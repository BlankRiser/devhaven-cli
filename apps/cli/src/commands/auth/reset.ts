import { authenticate } from "@/lib/auth";

export async function resetAuthAction(){
    await authenticate()
    process.exit(0);
}