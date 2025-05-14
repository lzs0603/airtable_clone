"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Table } from "@prisma/client";
import { api } from "~/trpc/react";
import AddColumnModal from "./AddColumnModal";

interface TableHeaderProps {
  table: Table;
  baseId: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function TableHeader({ 
  table, 
  baseId, 
  search, 
  onSearchChange 
}: TableHeaderProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  
  const utils = api.useUtils();
  
  const { mutate: generateData, isPending: isGenerating } = api.record.createBulk.useMutation({
    onSuccess: () => {
      void utils.record.list.invalidate({ tableId: table.id });
    },
  });
  
  const handleGenerateData = () => {
    void generateData({ 
      tableId: table.id,
      count: 100000 // 生成10万条数据
    });
  };
  
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link
            href={`/base/${baseId}`}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="text-xl font-semibold">{table.name}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="搜索表格..."
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> 添加列
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGenerateData}
            disabled={isGenerating}
            className="flex items-center gap-1"
          >
            {isGenerating ? "生成中..." : "生成10万行数据"}
          </Button>
        </div>
      </div>
      
      {isAddingColumn && (
        <AddColumnModal 
          tableId={table.id} 
          onClose={() => setIsAddingColumn(false)} 
        />
      )}
    </div>
  );
} 