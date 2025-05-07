import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";

export const SCOPES = [
  // Basic profile and email info
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",

  // Drive API
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  
  // Sheets API
  "https://www.googleapis.com/auth/spreadsheets",

  //scope to read, send, delete, and manage your email
  "https://www.googleapis.com/auth/gmail.addons.current.message.action",
  "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
  "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
  "https://www.googleapis.com/auth/gmail.addons.current.message.action",
  "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
  "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
  "https://www.googleapis.com/auth/gmail.addons.current.action.compose",

  "https://mail.google.com/",
];

export const oAuth2Client = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.REDIRECT_URI,
});

export const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});
