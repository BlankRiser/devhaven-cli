import { getAuthenticatedClient } from "@/lib/auth";
import type { Command } from "commander";

export async function loginAction(this: Command) {
  try {
    await getAuthenticatedClient();
  } catch (error) {
    console.error("Authentication failed:", error);
    
  }
  process.exit(0);
};
