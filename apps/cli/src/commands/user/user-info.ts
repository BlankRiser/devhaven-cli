import { getAuthenticatedClient, getUserInfo } from "@/lib/auth";
import type { Command } from "commander";

export async function userInfoAction(this: Command, options: { all: boolean }) {
  const client = await getAuthenticatedClient();
  const userInfo = await getUserInfo(client);
  if (options.all) {
    console.info(userInfo);
  } else {
    console.info({
      name: userInfo.name,
      email: userInfo.email,
    });
  }

  process.exit(0);
}
