"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Plus, ArrowUpDown } from "lucide-react";
import EditableCell from "./EditableCell";

// 定义Field接口，与Prisma模型对应
interface Field {
  id: string;
  name: string;
  type: string;
  order: number;
  tableId: string;
}

// 定义CellValue接口
interface CellValue {
  fieldId: string;
  textValue?: string | null;
  numberValue?: number | null;
}

// 定义Record接口
interface RecordType {
  id: string;
  cellValues?: CellValue[];
}

interface DataTableProps {
  tableId: string;
  fields: Field[];
  search?: string;
  pageSize?: number;
}

export default function DataTable({ 
  tableId, 
  fields = [], 
  search = "",
  pageSize = 50 
}: DataTableProps) {
  const utils = api.useUtils();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // 跟踪当前聚焦的单元格
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; columnIndex: number } | null>(null);
  
  // 处理Tab键导航
  const handleTabNavigation = (rowIndex: number, columnIndex: number, shiftKey: boolean) => {
    const totalColumns = fields.length;
    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    if (shiftKey) {
      // Shift+Tab: 向前导航
      if (columnIndex > 0) {
        nextColumn = columnIndex - 1;
      } else {
        // 移动到上一行的最后一列
        if (rowIndex > 0) {
          nextRow = rowIndex - 1;
          nextColumn = totalColumns - 1;
        }
      }
    } else {
      // Tab: 向后导航
      if (columnIndex < totalColumns - 1) {
        nextColumn = columnIndex + 1;
      } else {
        // 移动到下一行的第一列
        nextRow = rowIndex + 1;
        nextColumn = 0;
      }
    }

    // 更新焦点
    setFocusedCell({ rowIndex: nextRow, columnIndex: nextColumn });
  };

  // 获取记录数据
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage } = 
    api.record.list.useInfiniteQuery(
      {
        tableId,
        limit: pageSize,
        search,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000, // 减少重新获取频率
      }
    );

  // 从响应中提取所有记录
  const flatData = React.useMemo(() => 
    data?.pages.flatMap((page) => page.records) ?? [], 
    [data]
  );
  
  const totalDBRowCount = data?.pages[0]?.totalCount ?? 0;
  const totalFetched = flatData.length;
  
  // 防止在数据加载时过度重新渲染
  const memoizedFlatData = React.useMemo(() => flatData, [flatData.length]);
  
  // 创建新记录
  const { mutate: createRecord } = api.record.create.useMutation({
    onSuccess: () => {
      void utils.record.list.invalidate({ tableId });
    },
  });

  // 创建表格列
  const columnHelper = createColumnHelper<RecordType>();
  
  const columns = React.useMemo(() => {
    const cols = fields.map((field) => 
      columnHelper.accessor(
        (row) => {
          const cellValues = row.cellValues ?? [];
          const cellValue = cellValues.find((cv: CellValue) => cv.fieldId === field.id);
          return field.type === 'number' 
            ? cellValue?.numberValue 
            : cellValue?.textValue;
        },
        {
          id: field.id,
          header: field.name,
          cell: ({ row, column, table }) => {
            const rowIndex = table.getSortedRowModel().rows.findIndex(r => r.id === row.id);
            const columnIndex = table.getAllColumns().findIndex(col => col.id === column.id);
            
            return (
              <EditableCell
                recordId={row.original.id}
                fieldId={column.id}
                fieldType={field.type}
                initialValue={row.getValue(column.id)}
                onTab={(shiftKey) => handleTabNavigation(rowIndex, columnIndex, shiftKey)}
              />
            );
          },
        }
      )
    );
    
    return cols;
  }, [fields, columnHelper, handleTabNavigation]);
  
  // 创建表格实例
  const table = useReactTable({
    data: memoizedFlatData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    debugTable: false, // 生产环境中关闭调试模式
  });

  // 表格虚拟化
  const { rows } = table.getRowModel();
  
  const rowVirtualizer = useVirtualizer({
    count: totalFetched,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45, // 每行高度估计
    overscan: 5, // 减小overscan以减轻渲染负担
  });
  
  // 当focusedCell变化时，找到对应的元素并聚焦
  useEffect(() => {
    if (focusedCell) {
      const { rowIndex, columnIndex } = focusedCell;
      const rows = table.getSortedRowModel().rows;
      const cellElement = document.querySelector(
        `[data-row-index="${rowIndex}"][data-col-index="${columnIndex}"]`
      );
      
      if (cellElement) {
        (cellElement as HTMLElement).focus();
      } else if (rowIndex >= rows.length) {
        // 如果焦点超出了当前加载的行，尝试加载更多数据
        if (hasNextPage && !isFetching) {
          void fetchNextPage();
        }
      }
    }
  }, [focusedCell, table, hasNextPage, fetchNextPage, isFetching]);
  
  // 处理无限滚动
  useEffect(() => {
    const fetchMoreOnBottomReached = (e: Event) => {
      const containerRefElement = e.target as HTMLDivElement;
      if (!containerRefElement) return;
      
      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      // 当用户滚动到离底部更近的位置时才加载更多数据
      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        !isFetching &&
        hasNextPage
      ) {
        void fetchNextPage();
      }
    };
    
    const currentRef = tableContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', fetchMoreOnBottomReached);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', fetchMoreOnBottomReached);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetching]);

  if (isLoading) {
    return <div className="h-full w-full p-4">加载中...</div>;
  }

  return (
    <div className="h-full w-full">
      <div 
        className="relative h-full overflow-auto border-t" 
        ref={tableContainerRef}
        style={{ height: 'calc(100vh - 140px)' }}
      >
        <table className="min-w-full table-fixed border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="border-r px-4 py-2 text-left font-medium text-gray-700 last:border-r-0"
                    style={{ width: `${Math.max(150, 100 / columns.length)}px` }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              
              // 移除这个条件，防止在渲染中触发fetchNextPage
              if (!row) return null;
              
              return (
                <tr 
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="border-b hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell, colIndex) => (
                    <td 
                      key={cell.id} 
                      className="border-r px-4 py-2 last:border-r-0"
                      data-row-index={virtualRow.index}
                      data-col-index={colIndex}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* 加载中提示 */}
        {isFetching && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-white p-2 text-center">
            加载更多数据...
          </div>
        )}
      </div>

      {/* 添加新记录的按钮 */}
      <div className="mt-4 flex justify-start border-t p-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => void createRecord({ tableId })}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> 添加行
        </Button>
        
        <div className="ml-4 text-sm text-gray-500">
          {`已加载 ${totalFetched} 行，共 ${totalDBRowCount} 行`}
        </div>
      </div>
    </div>
  );
} 