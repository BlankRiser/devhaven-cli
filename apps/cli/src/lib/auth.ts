import { db } from "@/db";
import { authUrl, oAuth2Client } from "@/db/oauth";
import { account, user } from "@/db/schema";
import type { UserInfo } from "@/types/oauth.types";
import chalk from "chalk";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { nanoid } from "nanoid";
import open from "open";

export async function getAuthenticatedClient() {
  const savedToken = await loadToken();

  if (savedToken) {
    oAuth2Client.setCredentials(savedToken);

    if (savedToken.expiry_date && savedToken.expiry_date > Date.now()) {
      return oAuth2Client;
    }

    try {
      await oAuth2Client.refreshAccessToken();
      return oAuth2Client;
    } catch (err) {
      console.error(
        "Failed to refresh token, initiating new authentication flow"
      );
    }
  }
  await authenticate();

  return oAuth2Client;
}

export async function authenticate() {
  return new Promise((resolve, reject) => {
    const app = new Elysia().get(
      "/api/auth/callback/google",
      async (context) => {
        try {
          const { code } = context.query;

          if (!code) {
            return "No authorization code provided";
          }

          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);

          const userInfo = await getUserInfo(oAuth2Client);
          saveToken(tokens, userInfo);

          return "Authentication successful! You can close this window.";
        } catch (error) {
          console.error("Error during authentication:", error);
          reject(error);
          return "Authentication failed. See CLI for details.";
        }
      }
    );

    app.listen(3000, () => {
      console.info("Listening for OAuth callback on port 3000");

      // Open browser for authentication
      console.info("Opening browser for authentication...");
      open(authUrl);
    });
  });
}

export async function saveToken(token: Credentials, userInfo: UserInfo) {
  const now = new Date();

  const existingUser = (
    await db.select().from(user).where(eq(user.email, userInfo.email)).limit(1)
  )?.[0];

  let userId;

  if (!existingUser) {
    userId = nanoid();
    await db.insert(user).values({
      id: nanoid(),
      name: userInfo.name,
      email: userInfo.email,
      emailVerified: true,
      image: userInfo.picture,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    userId = existingUser.id;
    await db
      .update(user)
      .set({
        name: userInfo.name,
        image: userInfo.picture,
        updatedAt: now,
      })
      .where(eq(user.id, userId));
  }

  const existingAccount = (
    await db
      .select()
      .from(account)
      .where(eq(account.providerId, "google"))
      .orderBy(account.updatedAt)
      .limit(1)
  )?.[0];

  const tokenData = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    idToken: token.id_token,
    accessTokenExpiresAt: new Date(token.expiry_date!),
    scope: token.scope,
    updatedAt: now,
  };

  if (!existingAccount) {
    // Create new account
    await db.insert(account).values({
      id: nanoid(),
      accountId: userInfo.id,
      providerId: "google",
      userId: userId,
      ...tokenData,
      createdAt: now,
    });
  } else {
    // Update existing account
    await db
      .update(account)
      .set(tokenData)
      .where(eq(account.id, existingAccount.id));
  }

  console.info(
    chalk.bgGreenBright("Token stored in database for user:", userInfo.email)
  );
  process.exit(0);
}

export async function loadToken() {
  try {
    // Find the most recently updated Google account
    const recentAccount = await db
      .select()
      .from(account)
      .orderBy(account.updatedAt)
      .limit(1)
      .where(eq(account.providerId, "google"))
      .get();

    if (recentAccount && recentAccount.accessToken) {
      return {
        access_token: recentAccount.accessToken,
        refresh_token: recentAccount.refreshToken,
        id_token: recentAccount.idToken,
        expiry_date: recentAccount.accessTokenExpiresAt?.getTime(),
        scope: recentAccount.scope,
        token_type: "Bearer",
      } as Credentials;
    }
  } catch (err) {
    console.error("Error loading token from database:", err);
  }
  return null;
}

export async function getUserInfo(client: OAuth2Client): Promise<UserInfo> {
  const url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
  const response = await client.request<UserInfo>({ url });
  return response.data;
}

export async function isUserExists(email?: string): Promise<boolean> {
  try {
    if (email) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      return existingUser.length > 0;
    } else {
      const anyUser = await db
        .select()
        .from(user)
        .orderBy(user.createdAt)
        .limit(1);
      return anyUser.length > 0;
    }
  } catch (err) {
    console.error(chalk.bgRed("Please login using `haven login`"));
    return false;
  }
}
