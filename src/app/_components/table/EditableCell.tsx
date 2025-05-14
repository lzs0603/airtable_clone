"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";

interface EditableCellProps {
  recordId: string;
  fieldId: string;
  fieldType: string;
  initialValue: string | number | null;
  onTab?: (shift: boolean) => void;
}

export default function EditableCell({
  recordId,
  fieldId,
  fieldType,
  initialValue,
  onTab,
}: EditableCellProps) {
  const [value, setValue] = useState<string | number | null>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 如果初始值变化，更新内部状态
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  const utils = api.useUtils();
  
  // 更新单元格值
  const { mutate: updateCellValue } = api.cellValue.upsert.useMutation({
    onSuccess: () => {
      void utils.record.list.invalidate();
    },
  });
  
  // 保存编辑
  const saveEdit = () => {
    setIsEditing(false);
    
    // 如果值没有变化，不提交
    if (value === initialValue) return;
    
    // 根据字段类型转换值并提交
    if (fieldType === 'number') {
      const numValue = value === '' || value === null ? null : Number(value);
      void updateCellValue({
        recordId,
        fieldId,
        numberValue: typeof numValue === 'number' && !isNaN(numValue) ? numValue : null,
      });
    } else {
      void updateCellValue({
        recordId,
        fieldId,
        textValue: value === null ? null : String(value),
      });
    }
  };
  
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setValue(initialValue); // 重置为初始值
      setIsEditing(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      saveEdit();
      // 调用onTab处理Tab导航
      if (onTab) {
        onTab(e.shiftKey);
      }
    }
  };
  
  // 当编辑状态变化时聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // 选择所有文本
      if (typeof value === 'string' || typeof value === 'number') {
        inputRef.current.select();
      }
    }
  }, [isEditing, value]);
  
  // 如果处于编辑状态，显示输入框
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={fieldType === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => setValue(fieldType === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
        onBlur={saveEdit}
        onKeyDown={handleKeyDown}
        className="w-full py-1 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500"
        autoFocus
      />
    );
  }
  
  // 否则显示值（可点击进入编辑状态）
  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full cursor-pointer py-1 hover:bg-gray-100"
      tabIndex={0}
      onKeyDown={(e) => {
        // 当按下Enter或Space键时进入编辑模式
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        } else if (e.key === 'Tab' && onTab) {
          e.preventDefault();
          onTab(e.shiftKey);
        }
      }}
    >
      {value ?? <span className="text-gray-400">空</span>}
    </div>
  );
} 