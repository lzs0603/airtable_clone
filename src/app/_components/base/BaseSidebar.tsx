"use client";

import Link from "next/link";
import { ChevronLeft, Database, Table } from "lucide-react";
import type { Base, Table as TableType } from "@prisma/client";
import { cn } from "~/lib/utils";

interface BaseSidebarProps {
  base: Base;
  tables: TableType[];
  baseId: string;
}

export default function BaseSidebar({ base, tables, baseId }: BaseSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center text-slate-600 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="ml-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <Database className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-slate-800 truncate max-w-[120px]">{base.name}</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="text-xs text-slate-400 mb-2 px-2">表格</div>
        <ul className="space-y-1">
          {tables.map((table) => (
            <li key={table.id}>
              <Link
                href={`/base/${baseId}/table/${table.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  typeof window !== 'undefined' && window.location.pathname.includes(table.id)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Table className="h-4 w-4" />
                <span className="truncate">{table.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 