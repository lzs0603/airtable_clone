"use client";

import Link from "next/link";
import { Database } from "lucide-react";
import type { Table } from "@prisma/client";

interface TableCardProps {
  table: Table;
  baseId: string;
}

export default function TableCard({ table, baseId }: TableCardProps) {
  return (
    <Link
      href={`/base/${baseId}/table/${table.id}`}
      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-base font-medium">{table.name}</h4>
          <p className="text-sm text-gray-500">
            最后更新: {new Date(table.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
} 