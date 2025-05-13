"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { LogoutButton } from "../AuthButton";
import type { User as SessionUser } from "next-auth";

interface UserDropdownProps {
  user: SessionUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 font-medium text-white transition-colors hover:bg-purple-700">
          {user.name?.[0] ?? user.email?.[0] ?? "U"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          asChild
        >
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
