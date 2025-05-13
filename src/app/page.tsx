import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "./_components/AuthButton";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <LoginButton />
    </div>
  );
}
