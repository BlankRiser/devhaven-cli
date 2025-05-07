#!/usr/bin/env bun
import { getModelAction } from "@/commands/ai-model/model-selection";
import { loginAction } from "@/commands/auth/login";
import { userInfoAction } from "@/commands/user/user-info";
import { Command } from "commander";
import { getRecentMailAction } from "./mail/get-recent-mail";
import { resetAuthAction } from "./auth/reset";

const program = new Command();

export const runAllCommands = () => {
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
    .action(loginAction);

  program
    .command("reset")
    .description("Reset Google OAuth")
    .action(resetAuthAction);

  program
    .command("user")
    .description("Manage users")
    .option("-l, --list", "Display all the user info stored in the database.")
    .action(userInfoAction);

  program.command("model").description("Manage users").action(getModelAction);

  program
    .command("mail")
    .description("Manage emails")
    .option("-r, --recent <count>", "Show recent mails.")
    .action(getRecentMailAction);

  program.parse(process.argv);
};
