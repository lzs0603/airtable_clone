"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "~/components/ui/dropdown-menu";
import { LogoutButton } from "../AuthButton";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Settings, User, HelpCircle, Bell, UserCog } from "lucide-react";
import type { User as SessionUser } from "next-auth";

interface UserDropdownProps {
  user: SessionUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
  // 获取用户名首字母或邮箱首字母
  const userInitial = user.name?.[0] ?? user.email?.[0] ?? "U";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:bg-slate-100 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <Avatar className="h-8 w-8 cursor-pointer border-2 border-white bg-gradient-to-r from-blue-600 to-blue-700 text-xs font-medium shadow-sm transition-transform hover:scale-105">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "用户"} />
            <AvatarFallback className="text-white">{userInitial}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm text-slate-700 font-medium">{user.name ?? user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? "用户"}</p>
            <p className="text-xs leading-none text-slate-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <UserCog className="mr-2 h-4 w-4" />
            <span>账号设置</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>通知</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>帮助与支持</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>偏好设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
