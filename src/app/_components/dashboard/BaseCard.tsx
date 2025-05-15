"use client";
import { Database, MoreHorizontal, Star } from "lucide-react";
import Link from "next/link";
import type { Base } from "@prisma/client";
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

export function BaseCard({ base }: { base: Base }) {
  // 为每个基地分配一个不同的颜色
  const colorVariants = [
    "from-purple-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
  ];
  
  // 基于base.id生成一个稳定的索引来选择颜色
  const colorIndex = base.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorVariants.length;
  const gradientColor = colorVariants[colorIndex];
  
  const utils = api.useUtils();
  const { mutate: deleteBase } = api.base.delete.useMutation({
    onSuccess: () => {
      void utils.base.list.invalidate();
    },
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  return (
    <>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除基地</DialogTitle>
            <DialogDescription>确定要删除该基地吗？此操作不可恢复！</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteBase({ id: base.id });
                setShowDeleteDialog(false);
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* 顶部彩色条 */}
        <div className={cn("h-2 w-full bg-gradient-to-r", gradientColor)} />
        
        <div className="p-5">
          <div className="flex items-start justify-between">
            <Link href={`/base/${base.id}`} className="flex-1">
              <div className="flex items-start">
                <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white", gradientColor)}>
                  <Database className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="mb-1 text-base font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    {base.name || "未命名基地"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    更新于 {new Date(base.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center">
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
                  <DropdownMenuItem>复制链接</DropdownMenuItem>
                  <DropdownMenuItem>复制基地</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    删除基地
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <div>2个表格</div>
          <div>上次访问 {getRelativeTime(base.updatedAt)}</div>
        </div>
      </div>
    </>
  );
}

// 计算相对时间辅助函数
function getRelativeTime(date: Date): string {
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
}
