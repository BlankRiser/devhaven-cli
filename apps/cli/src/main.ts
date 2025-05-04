#!/usr/bin/env bun

import { login } from "@/commands/auth/login";
import { Command } from "commander";
import { getAuthenticatedClient, getUserInfo } from "@/lib/auth";

const program = new Command();

const main = () => {
  program
    .name("haven")
    .description("CLI for managing notes with Google OAuth authentication")
    .version("1.0.0");

  program.action(() => {
    console.info("Welcome to Haven!");
    console.info("Use 'haven login' to authenticate with Google.");
  });

  program
    .command("login")
    .description("Log in with Google OAuth")
    .action(async () => {
      await login();
    });

  program
    .command("user")
    .description("Manage users")
    .option("--all", "Display all the user info stored in the database.")
    .action(async (options: { all: boolean }) => {
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
    });

  program.parse(process.argv);
};

main();
