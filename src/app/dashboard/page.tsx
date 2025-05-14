import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { Database, Plus, ListFilter, CalendarRange, GridIcon } from "lucide-react";
import Leftbar from "../_components/dashboard/Leftbar";
import { BaseCard } from "../_components/dashboard/BaseCard";
import type { Base } from "@prisma/client";
import DashboardHeader from "../_components/dashboard/DashboardHeader";
import CreateBaseButton from "../_components/dashboard/CreateBaseButton";
import { Button } from "~/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

export default async function page() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/");
  }

  const bases = await db.base.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const recentBases = bases.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <DashboardHeader user={session.user} />
      <div className="flex flex-1">
        <Leftbar />
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {/* 欢迎栏 */}
          <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm border border-blue-100">
            <h1 className="mb-2 text-2xl font-bold text-slate-800">欢迎回来，{session.user.name ?? '用户'}</h1>
            <p className="text-slate-600 mb-4">继续处理您的项目或创建新的基地</p>
            <div className="flex gap-3">
              <CreateBaseButton className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                创建新基地
              </CreateBaseButton>
              <Button variant="outline" className="bg-white">
                浏览模板
              </Button>
            </div>
          </div>

          {/* 主要内容区 */}
          <Tabs defaultValue="all" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">所有基地</TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-white">最近访问</TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-white">收藏</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <ListFilter className="mr-1 h-3.5 w-3.5" />
                  排序
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <GridIcon className="mr-1 h-3.5 w-3.5" />
                  视图
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {bases.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {bases.map((base: Base) => (
                    <BaseCard base={base} key={base.id} />
                  ))}
                  <CreateBaseButton>
                    <div className="group flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
                      <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 transition-colors group-hover:bg-blue-200">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="mb-1 text-base font-medium text-slate-700">创建新基地</h3>
                      <p className="text-sm text-slate-500">从头开始或使用模板</p>
                    </div>
                  </CreateBaseButton>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-16 text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
                    <Database className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium text-slate-700">
                    没有基地
                  </h3>
                  <p className="mb-6 max-w-md text-slate-500">
                    基地是一个强大的可视化数据库，可以帮助您和您的团队组织工作。创建您的第一个基地以开始使用。
                  </p>
                  <CreateBaseButton>
                    <button
                      className="flex items-center rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="font-medium">创建新基地</span>
                    </button>
                  </CreateBaseButton>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              {recentBases.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentBases.map((base: Base) => (
                    <BaseCard base={base} key={base.id} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
                  <p className="text-slate-500">没有最近访问的基地</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
                <p className="text-slate-500">没有收藏的基地</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mb-8">
            <h3 className="mb-4 text-base font-medium text-slate-700">
              快速入门
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="mr-4 rounded-lg bg-purple-100 p-2 text-purple-600">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium text-slate-800">创建基地</h4>
                    <p className="text-sm text-slate-600">为您的项目建立结构化数据</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="mr-4 rounded-lg bg-green-100 p-2 text-green-600">
                    <GridIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium text-slate-800">构建视图</h4>
                    <p className="text-sm text-slate-600">创建自定义视图以优化工作流程</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600">
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium text-slate-800">日历视图</h4>
                    <p className="text-sm text-slate-600">以日历形式查看和管理您的项目</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
