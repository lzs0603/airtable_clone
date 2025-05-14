"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

interface AddColumnModalProps {
  tableId: string;
  onClose: () => void;
}

export default function AddColumnModal({ tableId, onClose }: AddColumnModalProps) {
  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState<"text" | "number">("text");
  
  const utils = api.useUtils();
  
  const { mutate: createField, isPending } = api.field.create.useMutation({
    onSuccess: () => {
      void utils.field.list.invalidate({ tableId });
      onClose();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim()) return;
    
    void createField({
      name: columnName,
      type: columnType,
      tableId,
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">添加新列</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">列名</label>
            <Input
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="输入列名"
              required
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">类型</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="columnType"
                  value="text"
                  checked={columnType === "text"}
                  onChange={() => setColumnType("text")}
                  className="mr-2"
                />
                文本
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="columnType"
                  value="number"
                  checked={columnType === "number"}
                  onChange={() => setColumnType("number")}
                  className="mr-2"
                />
                数字
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isPending || !columnName.trim()}>
              {isPending ? "添加中..." : "添加列"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 