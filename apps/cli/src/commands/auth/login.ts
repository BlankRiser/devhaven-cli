
import { db } from '@/db';
import { authUrl, oAuth2Client } from '@/db/oauth';
import { account, user } from '@/db/schema';
import type { UserInfo } from '@/types/oauth.types';
import { randomUUIDv7 } from 'bun';
import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { OAuth2Client, type Credentials } from 'google-auth-library';
import open from 'open';

export const login = async () => {
  try {
    const client = await getAuthenticatedClient();
    console.log('Authentication successful!', client);

  } catch (error) {
    console.error('Authentication failed:', error);
    process.exit(1);
  }
};

async function authenticate() {
  return new Promise((resolve, reject) => {
    
    const app = new Elysia()
      .get('/api/auth/callback/google', async (context) => {
        try {
          const { code } = context.query;
          
          if (!code) {
            return 'No authorization code provided';
          }

          // Exchange code for tokens
          const { tokens, res } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);

          const userInfo = await getUserInfo(oAuth2Client);
          
          console.log('User Info:', userInfo); // Add this line to print userInf


          console.log('Tokens:', tokens);
          console.log('Response:', res);
          
          // Save tokens
          saveToken(tokens, userInfo );
          
          return 'Authentication successful! You can close this window.';
        } catch (error) {
          console.error('Error during authentication:', error);
          reject(error);
          return 'Authentication failed. See CLI for details.';
        }
      });

    // Start the server
    app.listen(3000, () => {
      console.log('Listening for OAuth callback on port 3000');
      
      // Open browser for authentication
      console.log('Opening browser for authentication...');
      open(authUrl);
    });
  });
}

async function getAuthenticatedClient() {
  
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
      console.log('Failed to refresh token, initiating new authentication flow');
    }
  }
  
  await authenticate();
  return oAuth2Client;
}

async function getUserInfo(client: OAuth2Client): Promise<UserInfo> {
  const url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';
  const response = await client.request<UserInfo>({ url });
  return response.data;
}

async function saveToken(token: Credentials, userInfo: UserInfo) {
  const now = new Date();

  const existingUser =( await db
  .select()
  .from(user)
  .where(eq(user.email, userInfo.email))
  .limit(1))?.[0]
  
  let userId;
  
  if (!existingUser) {
    userId = randomUUIDv7();
    await db.insert(user).values({
      id: randomUUIDv7(),
      name: userInfo.name,
      email: userInfo.email,
      emailVerified: true,
      image: userInfo.picture,
      createdAt: now,
      updatedAt: now
    });
  } else {
    userId = existingUser.id;
    await db.update(user)
      .set({
        name: userInfo.name,
        image: userInfo.picture,
        updatedAt: now
      })
      .where(eq(user.id, userId));
  }
  
  const existingAccount = (await db
  .select()
  .from(account)
  .where(eq(account.providerId, 'google'))
  .orderBy(account.updatedAt)
  .limit(1))?.[0];
  
  const tokenData = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    idToken: token.id_token,
    accessTokenExpiresAt: new Date(token.expiry_date!),
    scope: token.scope,
    updatedAt: now
  };
  
  if (!existingAccount) {
    // Create new account
    await db.insert(account).values({
      id: randomUUIDv7(),
      accountId: userInfo.id,
      providerId: 'google',
      userId: userId,
      ...tokenData,
      createdAt: now
    });
  } else {
    // Update existing account
    await db.update(account)
      .set(tokenData)
      .where(eq(account.id, existingAccount.id));
  }
  
  console.log('Token stored in database for user:', userInfo.email);
}

// Load saved token from database
async function loadToken() {
  try {
    // Find the most recently updated Google account
    const recentAccount = await db.select().from(account).orderBy(account.updatedAt).limit(1).where(eq(account.providerId, 'google')).get();
      
    if (recentAccount && recentAccount.accessToken) {
      return {
        access_token: recentAccount.accessToken,
        refresh_token: recentAccount.refreshToken,
        id_token: recentAccount.idToken,
        expiry_date: recentAccount.accessTokenExpiresAt?.getTime(),
        scope: recentAccount.scope,
        token_type: 'Bearer'
      } as Credentials;
    }
  } catch (err) {
    console.error('Error loading token from database:', err);
  }
  return null;
}
