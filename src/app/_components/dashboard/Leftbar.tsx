import React from "react";
import Link from "next/link";
import { 
  Home, 
  Database, 
  Calendar, 
  Star, 
  Clock, 
  Trash2, 
  Settings, 
  HeartHandshake,
  Plus 
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function Leftbar() {
  return (
    <div className="hidden md:flex w-60 flex-col bg-slate-50 border-r border-slate-200 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-3">
        <Button variant="outline" className="w-full justify-start bg-white border-slate-200 text-sm font-medium">
          <Plus className="mr-2 h-4 w-4" /> 创建
        </Button>
      </div>
      
      <div className="px-3 py-2">
        <div className="text-xs font-medium text-slate-500 mb-2 px-2">工作区</div>
        <nav className="space-y-1">
          <Link 
            href="/dashboard" 
            className="flex items-center h-9 px-2 text-sm text-slate-800 font-medium rounded hover:bg-slate-200"
          >
            <Home className="mr-2 h-4 w-4 text-blue-600" />
            主页
          </Link>

          <div className="py-1">
            <div className="text-xs font-medium text-slate-500 px-2 pb-1 flex items-center justify-between">
              <span>基地</span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3 text-slate-500 hover:text-slate-700" />
              </Button>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center h-9 px-2 text-sm rounded hover:bg-slate-200"
            >
              <Database className="mr-2 h-4 w-4 text-purple-600" />
              所有基地
            </Link>
          </div>
          
          <div className="py-1">
            <div className="text-xs font-medium text-slate-500 px-2 pb-1">视图</div>
            <Link
              href="#"
              className="flex items-center h-9 px-2 text-sm rounded hover:bg-slate-200"
            >
              <Calendar className="mr-2 h-4 w-4 text-green-600" />
              日历
            </Link>
          </div>
          
          <div className="py-1">
            <div className="text-xs font-medium text-slate-500 px-2 pb-1">收藏</div>
            <div className="text-xs text-slate-400 py-2 px-2">未添加收藏</div>
          </div>
        </nav>
      </div>
      
      <div className="mt-auto border-t border-slate-200 p-3">
        <nav className="space-y-1">
          <Link 
            href="#" 
            className="flex items-center h-9 px-2 text-sm text-slate-600 rounded hover:bg-slate-200"
          >
            <Star className="mr-2 h-4 w-4 text-slate-500" />
            收藏
          </Link>
          <Link 
            href="#" 
            className="flex items-center h-9 px-2 text-sm text-slate-600 rounded hover:bg-slate-200"
          >
            <Clock className="mr-2 h-4 w-4 text-slate-500" />
            最近使用
          </Link>
          <Link 
            href="#" 
            className="flex items-center h-9 px-2 text-sm text-slate-600 rounded hover:bg-slate-200"
          >
            <Trash2 className="mr-2 h-4 w-4 text-slate-500" />
            回收站
          </Link>
          <div className="h-px my-1 bg-slate-200" />
          <Link 
            href="#" 
            className="flex items-center h-9 px-2 text-sm text-slate-600 rounded hover:bg-slate-200"
          >
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            设置
          </Link>
          <Link 
            href="#" 
            className="flex items-center h-9 px-2 text-sm text-slate-600 rounded hover:bg-slate-200"
          >
            <HeartHandshake className="mr-2 h-4 w-4 text-slate-500" />
            帮助与支持
          </Link>
        </nav>
      </div>
    </div>
  );
}
