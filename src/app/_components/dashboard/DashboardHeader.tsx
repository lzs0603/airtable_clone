import React from "react";
import { PanelLeft, HelpCircle, Search, Database } from "lucide-react";
import { UserDropdown } from "./UserDropdown";

export default function DashboardHeader({
  user,
}: {
  user: Partial<{
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  }>;
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
      <div className="flex items-center">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <PanelLeft className="h-6 w-6" />
        </button>
        <div className="ml-4 flex items-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
            <Database className="h-4 w-4" />
          </div>
          <span className="ml-2 text-xl font-semibold text-blue-600">
            Dashboard
          </span>
        </div>
      </div>

      <div className="mx-8 max-w-xl flex-1">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm text-gray-500">⌘ K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <HelpCircle className="h-6 w-6" />
        </button>
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
