"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import TableHeader from "~/app/_components/table/TableHeader";
import DataTable from "~/app/_components/table/DataTable";
import TableLoading from "~/app/_components/table/TableLoading";
import ViewManager from "~/app/_components/table/ViewManager";

export default function TablePage() {
  const { baseId, tableId } = useParams<{ baseId: string; tableId: string }>();
  const [search, setSearch] = useState("");
  const [pageSize] = useState(50);
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  
  // 获取表格信息
  const { data: table, isLoading: isTableLoading } = api.table.getById.useQuery(
    { id: tableId },
    { enabled: !!tableId }
  );
  
  // 获取基地信息
  const { data: base, isLoading: isBaseLoading } = api.base.getById.useQuery(
    { id: baseId },
    { enabled: !!baseId }
  );
  
  // 获取字段列表
  const { data: allFields = [], isLoading: isFieldsLoading } = api.field.list.useQuery(
    { tableId: tableId },
    { enabled: !!tableId }
  );
  
  // 过滤隐藏的字段
  const fields = allFields.filter(field => !hiddenFields.includes(field.id));

  // 应用过滤器
  const handleApplyFilter = (newFilters: unknown[]) => {
    // 这里可以根据实际类型替换 unknown
    // setFilters(newFilters); // 移除未使用的 setFilters
  };

  // 应用排序
  const handleApplySort = (newSorts: unknown[]) => {
    // 这里可以根据实际类型替换 unknown
    // setSorts(newSorts); // 移除未使用的 setSorts
  };

  // 切换字段显示状态
  const handleToggleFields = (newHiddenFields: string[]) => {
    setHiddenFields(newHiddenFields);
  };

  if (isTableLoading || isBaseLoading || isFieldsLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex-1 p-4">
          <TableLoading />
        </div>
      </div>
    );
  }

  if (!table || !base) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex-1 p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold">未找到表格</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TableHeader 
        table={table} 
        baseId={baseId} 
        search={search}
        onSearchChange={setSearch}
      />
      
      <div className="px-4">
        <ViewManager 
          tableId={tableId}
          onApplyFilter={handleApplyFilter}
          onApplySort={handleApplySort}
          onToggleFields={handleToggleFields}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <DataTable 
          tableId={tableId} 
          fields={fields} 
          search={search}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
} 