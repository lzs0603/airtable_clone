import React from "react";
import { LogoutButton } from "../_components/AuthButton";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/");
  }

  return (
    <div>
      dashboard
      <LogoutButton />
    </div>
  );
}
