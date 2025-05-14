"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import TableCard from "~/app/_components/base/TableCard";
import BaseHeader from "~/app/_components/base/BaseHeader";

export default function BasePage() {
  const { baseId } = useParams<{ baseId: string }>();
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [tableName, setTableName] = useState("");

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

  if (isBaseLoading) {
    return <div className="p-8">正在加载...</div>;
  }

  if (!base) {
    return <div className="p-8">未找到该基地</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <BaseHeader base={base} />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">{base.name} 的表格</h2>
          
          {isTablesLoading ? (
            <div>加载表格中...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tables && tables.length > 0 ? (
                tables.map((table) => (
                  <TableCard key={table.id} table={table} baseId={baseId} />
                ))
              ) : (
                <div className="rounded-lg border border-gray-200 p-6 text-center">
                  <p className="mb-4 text-gray-600">这个基地还没有表格</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showCreateTable ? (
          <div className="mt-6 flex items-center gap-2">
            <Input
              placeholder="输入表格名称"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              autoFocus
            />
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
        ) : (
          <Button 
            onClick={() => setShowCreateTable(true)}
            className="mt-4 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> 创建新表格
          </Button>
        )}
      </div>
    </div>
  );
} 