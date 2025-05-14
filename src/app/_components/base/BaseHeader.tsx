"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Base } from "@prisma/client";

interface BaseHeaderProps {
  base: Base;
}

export default function BaseHeader({ base }: BaseHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          返回仪表盘
        </Link>
        <h1 className="text-xl font-semibold">{base.name}</h1>
      </div>
    </div>
  );
} 