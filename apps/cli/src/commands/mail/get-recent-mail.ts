import { modelProviders } from "@/config/models";
import { getAuthenticatedClient } from "@/lib/auth";
import { terminalLoader } from "@/lib/terminal-loader";
import { terminalRenderer } from "@/lib/terminal-renderer";
import { decodeBase64Url } from "@/lib/utils";
import { tools } from "@/tools";
import { gmail } from "@googleapis/gmail";
import { streamText } from "ai";

export async function getRecentMailAction(options: { recent: number }) {
  terminalLoader.start("Authenticating with Google...");
  const client = await getAuthenticatedClient();
  const accessToken = client.credentials.access_token!;

  terminalLoader.update("Retrieving email list...");
  const emailList = await gmail("v1").users.messages.list({
    userId: "me",
    maxResults: options.recent,
    oauth_token: accessToken,
    pageToken: "0",
  });

  if (!emailList.data.messages) {
    console.log("No emails found");
    process.exit(0);
  }

  terminalLoader.succeed(`Found ${emailList.data.messages.length} emails`);
  // Start a new spinner for the next phase
  terminalLoader.start("Fetching email details...");
  const emailPromises = emailList.data.messages.map((message) => {
    if (!message.id) {
      console.log("No emails found");
      process.exit(0);
    }

    return gmail("v1").users.messages.get({
      id: message.id,
      userId: "me",
      oauth_token: accessToken,
      prettyPrint: true,
    });
  });

  const emailResults = await Promise.all(emailPromises);

  terminalLoader.update("Processing email data...");
  const emailData = [];

  for (const email of emailResults) {
    const bodyData = email.data.payload?.body?.data;
    emailData.push({
      mimeType: email.data.payload?.mimeType!,
      headers: email.data.payload?.headers!,
      body: bodyData ? decodeBase64Url(email.data.payload?.body?.data!) : "",
    });
  }

  terminalLoader.succeed("Email data processed");

  terminalLoader.color("cyan");
  terminalLoader.start("Generating email summary...");

  const { textStream } = await streamText({
    model: modelProviders.openRouter({}),
    prompt: `Give me a summary of the most recent ${
      options.recent ?? 5
    } email(s) in Gmail.`,
    maxRetries: 1,
    tools: tools,
    maxSteps: 5,
  });

  terminalLoader.stop();

  for await (const textPart of textStream) {
    terminalRenderer.render(textPart);
  }

  process.exit(0);
}
