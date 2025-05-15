"use client";

import Link from "next/link";
import { ChevronLeft, Settings, Share2, Star, Grid, Users, Folder } from "lucide-react";
import type { Base } from "@prisma/client";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

interface BaseHeaderProps {
  base: Base;
}

export default function BaseHeader({ base }: BaseHeaderProps) {
  // 复用 BaseCard 的渐变色方案
  const colorVariants = [
    "from-purple-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
  ];
  const colorIndex = base.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorVariants.length;
  const gradientColor = colorVariants[colorIndex];

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
      {/* 顶部渐变色条 */}
      <div className={cn("h-2 w-full bg-gradient-to-r", gradientColor)} />
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 text-sm">返回</span>
          </Link>
          {/* 品牌色 icon */}
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br text-white", gradientColor)}>
            <Grid className="h-4 w-4" />
          </div>
          <h1 className="ml-2 text-xl font-bold text-slate-800">{base.name}</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-yellow-500">
            <Star className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Share2 className="mr-1 h-3.5 w-3.5" />
                分享
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>邀请协作者</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Folder className="mr-2 h-4 w-4" />
                <span>创建共享链接</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Grid className="mr-2 h-4 w-4" />
                <span>嵌入</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-t border-slate-100 px-6">
        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="h-10 bg-transparent">
            <TabsTrigger
              value="tables"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4"
            >
              表格
            </TabsTrigger>
            <TabsTrigger
              value="automation"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4"
            >
              自动化
            </TabsTrigger>
            <TabsTrigger
              value="apps"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4"
            >
              应用
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
} 