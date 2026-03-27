import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function POST() {
  const sessionToken = (await cookies()).get("session")?.value;
  
  if (sessionToken) {
    // Delete session from database
    await prisma.session.deleteMany({
      where: { token: sessionToken }
    });
    
    // Clear cookie
    (await cookies()).delete("session");
  }
  
  return redirect("/");
}
