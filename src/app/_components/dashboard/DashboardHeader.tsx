import React from "react";
import { PanelLeft, HelpCircle, Search, Database, BookOpen, LayoutGrid, Settings } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function DashboardHeader({
  user,
  onToggleSidebar,
}: {
  user: Partial<{
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  }>;
  onToggleSidebar?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700" onClick={onToggleSidebar}>
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-blue-500 to-blue-600 text-white shadow-sm">
            <Database className="h-4 w-4" />
          </div>
          <span className="ml-2 text-lg font-bold text-slate-800">
            AirClone
          </span>
        </div>
        
        <div className="ml-4 hidden md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium text-slate-600">
                工作区 <span className="ml-1 text-slate-400">▾</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>所有工作区</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>工作区设置</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="hidden md:block md:max-w-xl md:flex-1 px-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="搜索..."
            className="block w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-10 text-sm leading-5 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 text-xs text-slate-500 sm:inline-block">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden md:flex text-slate-500 hover:text-slate-700">
          <BookOpen className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <div className="ml-2 border-l border-slate-200 pl-2">
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
