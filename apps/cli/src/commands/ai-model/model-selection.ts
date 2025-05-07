import { isUserExists } from "@/lib/auth";
import { password, rawlist } from "@inquirer/prompts";
import chalk from "chalk";
import type { Command } from "commander";

export async function getModelAction(this: Command) {
  if (!isUserExists()) {
    process.exit(0);
  }

  const model = await rawlist({
    message: "Select a model provider",
    choices: [
      { name: "Open Router", value: "open-router" },
      { name: "LM Studio", value: "lmstudio" },
      { name: "Open AI", value: "open-ai" },
      { name: "Claude", value: "claude" },
    ],
    theme: {
      style: {
        answer: (text: string) => chalk.blue(text),
        message: (text: string) => chalk.greenBright(text),
        error: (text: string) => chalk.red(text),
        help: (text: string) => chalk.dim(text),
      },
    },
  });

  console.log(`You chose: ${model}`);

  if (model) {
    const apiKey = await password({
      message: `Enter api key of ${model}`,
      theme: {
        style: {
          answer: (text: string) => chalk.blue(text),
          message: (text: string) => chalk.greenBright(text),
          error: (text: string) => chalk.red(text),
          help: (text: string) => chalk.dim(text),
        },
      },
    });
    // save api key in db
  }

  process.exit(0);
}
