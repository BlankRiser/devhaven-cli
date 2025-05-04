import { Command } from "commander";
import { login } from "./commands/auth/login";


const program = new Command();

const main = () => {
  program
    .name("haven")
    .description("CLI for managing notes with Google OAuth authentication")
    .version("1.0.0");

  program
    .command("login")
    .description("Log in with Google OAuth")
    .action(async () => {
      await login();
    });

  program
    .command("note")
    .description("Add a new note (requires authentication)")
    .argument("<content>", "Note content")
    .action(async (content) => {
      
    });

  program.parse();
};





main();
