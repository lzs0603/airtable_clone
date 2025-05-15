"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { 
  Plus, 
  Search, 
  Grid, 
  LayoutGrid, 
  Files, 
  ListFilter, 
  Database 
} from "lucide-react";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import TableCard from "~/app/_components/base/TableCard";
import BaseHeader from "~/app/_components/base/BaseHeader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import BaseSidebar from "~/app/_components/base/BaseSidebar";

export default function BasePage() {
  const { baseId } = useParams<{ baseId: string }>();
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [tableName, setTableName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: base, isLoading: isBaseLoading } = api.base.getById.useQuery(
    { id: baseId },
    { enabled: !!baseId }
  );

  const { data: tables, isLoading: isTablesLoading } = api.table.list.useQuery(
    { baseId: baseId },
    { enabled: !!baseId }
  );

  const utils = api.useUtils();
  
  const { mutate: createTable } = api.table.create.useMutation({
    onSuccess: () => {
      setTableName("");
      setShowCreateTable(false);
      void utils.table.list.invalidate({ baseId: baseId });
    },
  });

  // 过滤表格通过搜索
  const filteredTables = tables?.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isBaseLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Database className="h-12 w-12 animate-pulse text-blue-600" />
          <p className="text-slate-500">正在加载基地...</p>
        </div>
      </div>
    );
  }

  if (!base) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <Database className="mb-4 h-16 w-16 text-slate-400" />
        <h2 className="mb-2 text-xl font-semibold text-slate-800">未找到该基地</h2>
        <p className="mb-6 text-slate-500">该基地可能已被删除或您没有访问权限</p>
        <Button asChild>
          <a href="/dashboard">返回仪表板</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 左侧侧边栏 */}
      <BaseSidebar base={base} tables={tables ?? []} baseId={baseId} />
      {/* 右侧主内容 */}
      <div className="flex-1 flex flex-col">
        {/* <BaseHeader base={base} /> */}
        <div className="flex-1 p-6">
          <div className="mb-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="搜索表格..." 
                  className="w-full max-w-xs pl-9 h-9 rounded-md border border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Tabs defaultValue="grid" className="mr-2">
                  <TabsList className="h-9 bg-slate-100 rounded-md border border-slate-200">
                    <TabsTrigger value="grid" className="h-7 px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600">
                      <LayoutGrid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list" className="h-7 px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600">
                      <Files className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button variant="outline" size="sm" className="h-9 rounded-md border bg-white">
                  <ListFilter className="mr-1 h-4 w-4" />
                  排序
                </Button>
                
                <Button 
                  onClick={() => setShowCreateTable(true)}
                  size="sm"
                  className="h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  <Plus className="mr-1 h-4 w-4" /> 新建表格
                </Button>
              </div>
            </div>
            
            {showCreateTable ? (
              <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="mb-3 text-base font-medium text-slate-800">创建新表格</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="输入表格名称"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="bg-white rounded-md border border-slate-200"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => 
                        createTable({ 
                          name: tableName, 
                          baseId: baseId 
                        })
                      }
                      disabled={tableName.trim() === ""}
                    >
                      创建表格
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateTable(false);
                        setTableName("");
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            
            {isTablesLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                <Grid className="mx-auto mb-4 h-8 w-8 animate-pulse text-blue-400" />
                <p className="text-slate-500">加载表格中...</p>
              </div>
            ) : (
              <>
                {filteredTables && filteredTables.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTables.map((table) => (
                      <TableCard key={table.id} table={table} baseId={baseId} />
                    ))}
                    <div 
                      onClick={() => setShowCreateTable(true)}
                      className="group flex h-full min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 shadow-xs"
                    >
                      <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 transition-colors group-hover:bg-blue-200">
                        <Plus className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700">添加新表格</h3>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-12 text-center shadow-xs">
                    <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
                      <Grid className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-700">
                      还没有表格
                    </h3>
                    <p className="mb-6 max-w-md text-slate-500">
                      表格是基地中存储和组织数据的地方。您可以创建不同的表格来分类您的数据。
                    </p>
                    <Button 
                      onClick={() => setShowCreateTable(true)}
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs"
                    >
                      <Plus className="mr-1 h-4 w-4" /> 创建第一个表格
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 