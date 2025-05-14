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

interface BaseHeaderProps {
  base: Base;
}

export default function BaseHeader({ base }: BaseHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-3 flex items-center text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 text-sm">返回</span>
          </Link>
          
          <h1 className="mr-4 text-lg font-semibold text-slate-800">{base.name}</h1>
          
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

      <div className="border-t border-slate-100 px-4">
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