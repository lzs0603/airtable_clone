"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { GoogleIcon } from "~/components/icons/google-icon";

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn("google")}
      variant="outline"
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-5 transition-colors hover:bg-gray-50 sm:w-auto"
    >
      <GoogleIcon className="h-5 w-5" />
      <span className="font-medium">Sign in with Google</span>
    </Button>
  );
}

export function LogoutButton() {
  return (
    <Button
      onClick={() => signOut()}
      variant="outline"
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-5 transition-colors hover:bg-gray-50 sm:w-auto"
    >
      <GoogleIcon className="h-5 w-5" />
      <span className="font-medium">Sign out</span>
    </Button>
  );
}
