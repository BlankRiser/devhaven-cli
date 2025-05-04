import { getAuthenticatedClient } from "@/lib/auth";

export const login = async () => {
  try {
    await getAuthenticatedClient();
  } catch (error) {
    console.error("Authentication failed:", error);
    process.exit(1);
  }
};
