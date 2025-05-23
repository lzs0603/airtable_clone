"use client";

import Link from "next/link";
import { Database, MoreHorizontal, Star, Grid } from "lucide-react";
import type { Table } from "@prisma/client";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";

interface TableCardProps {
  table: Table;
  baseId: string;
}

export default function TableCard({ table, baseId }: TableCardProps) {
  // 为表格卡片分配渐变色，和 BaseCard 统一
  const colorVariants = [
    "from-purple-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
  ];
  const colorIndex = table.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorVariants.length;
  const gradientColor = colorVariants[colorIndex];
  
  // 获取相对时间显示
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "今天";
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };
  
  const utils = api.useUtils();
  const { mutate: deleteTable, isPending: isDeleting } = api.table.delete.useMutation({
    onSuccess: () => {
      void utils.table.list.invalidate({ baseId });
    },
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  return (
    <>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除表格</DialogTitle>
            <DialogDescription>确定要删除该表格吗？此操作不可恢复！</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteTable({ id: table.id });
                setShowDeleteDialog(false);
              }}
              disabled={isDeleting}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* 顶部渐变色条 */}
        <div className={cn("h-2 w-full bg-gradient-to-r", gradientColor)} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <Link href={`/base/${baseId}/table/${table.id}`} className="flex-1">
              <div className="flex items-start">
                {/* 渐变色 icon 背景 */}
                <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white", gradientColor)}>
                  <Database className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="mb-1 text-base font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    {table.name}
                  </h4>
                  <div className="flex items-center text-xs text-slate-500">
                    <Grid className="mr-1 h-3 w-3" />
                    <span>网格视图</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-yellow-500">
                <Star className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>重命名</DropdownMenuItem>
                  <DropdownMenuItem>复制表格</DropdownMenuItem>
                  <DropdownMenuItem>锁定表格</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    删除表格
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between bg-slate-50 px-5 py-3 text-xs text-slate-500 border-t border-slate-100">
          <div>12条记录</div>
          <div>更新于 {getRelativeTime(table.updatedAt)}</div>
        </div>
      </div>
    </>
  );
} 