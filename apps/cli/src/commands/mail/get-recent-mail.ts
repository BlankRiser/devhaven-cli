import { getAuthenticatedClient } from "@/lib/auth";
import { decodeBase64Url } from "@/lib/utils";
import { gmail } from "@googleapis/gmail";

export async function getRecentMailAction() {
  const client = await getAuthenticatedClient();
  const accessToken = client.credentials.access_token!;

  const emailList = await gmail("v1").users.messages.list({
    userId: "me",
    auth: client,
    maxResults: 5,
    oauth_token: accessToken,
    pageToken: "0",
  });

  if (!emailList.data.messages) {
    console.log("No emails found");
    process.exit(0);
  }

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

  const emailData = [];

  for (const email of emailResults) {
    const bodyData = email.data.payload?.body?.data;
    emailData.push({
      mimeType: email.data.payload?.mimeType!,
      headers: email.data.payload?.headers!,
      body: bodyData ? decodeBase64Url(email.data.payload?.body?.data!) : "",
    });
  }
  
  console.log(emailData);
}
