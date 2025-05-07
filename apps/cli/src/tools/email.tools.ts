import { getAuthenticatedClient } from "@/lib/auth";
import { decodeBase64Url } from "@/lib/utils";
import { gmail } from "@googleapis/gmail";
import { tool } from "ai";
import { z } from "zod";

export const getMailDataTool = tool({
  description: [
    "Give a brief summary of the emails in the user's Gmail account based on the max number of emails the user specificies, the default is 5",
    "The text will be rendered in a terminal, so make sure to escape any special characters.",
    "If the email is about a bank transaction, include the transaction date, transaction amount, category of income/expense based on the body of the mail or the headers and the organization or place or a person where the transaction took place.",
    "The summary should be in the following format:",
    // "Subject: <subject>",
    // "Sender: <sender>",
    // "Date: <date>",
    // "Content: <content>",
    "If the email is about a task, include the task name and the due date.",
    "If the email is about a meeting, include the meeting name, meeting link, meeting place and the meeting date.",
    "If the email is about a reminder, include the reminder name, reminder date and the reminder time.",
    "If the email is a bill or an invoice, include the bill name, bill amount, bill date, bill due date and the bill link.",
    "If the email is about a job application, include the job title, company name, job link and the job application date.",
    "If the email is about a newsletter, include the newsletter name, newsletter link and the newsletter date.",
  ].join(" "),
  parameters: z.object({
    maxResults: z
      .number({
        description:
          "The maximum number of emails that will be returned. The default is 5.",
      })
      .default(5)
      .optional(),
  }),
  execute: async ({ maxResults }) => {
    const res = getMailData({
      maxResults: maxResults,
    });
    return res;
  },
});

export async function getMailData({ maxResults = 5 }: { maxResults?: number }) {
  const client = await getAuthenticatedClient();
  const accessToken = client.credentials.access_token!;

  const emailList = await gmail("v1").users.messages.list({
    userId: "me",
    maxResults: maxResults,
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

  return emailData;
}
