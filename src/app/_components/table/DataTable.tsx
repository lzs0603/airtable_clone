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
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // 跟踪当前聚焦的单元格
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; columnIndex: number } | null>(null);
  
  // 添加一个请求锁，防止短时间内多次请求
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // 添加顶部加载状态
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  // 记录滚动位置
  const scrollPositionRef = useRef(0);
  // 记录已获取的数据ID集合，防止重复渲染
  const fetchedIdsRef = useRef(new Set<string>());
  
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
        staleTime: 60 * 1000, // 增加到1分钟，减少重新获取频率
        gcTime: 5 * 60 * 1000, // 在垃圾回收前保持缓存数据5分钟
      }
    );

  // 从响应中提取所有记录
  const flatData = React.useMemo(() => 
    data?.pages.flatMap((page) => page.records) ?? [], 
    [data]
  );
  
  const totalDBRowCount = data?.pages[0]?.totalCount ?? 0;
  const totalFetched = flatData.length;
  
  // 保持对数据的稳定引用，防止在加载新数据时丢失旧数据
  const memoizedFlatData = React.useMemo(() => flatData, [flatData]);
  
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
    overscan: 10, // 增加overscan以确保数据不会消失
    measureElement: typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
      ? (element) => element?.getBoundingClientRect().height ?? 45
      : undefined,  // 动态测量行高，但在Firefox中禁用(可能导致性能问题)
  });
  
  // 当focusedCell变化时，找到对应的元素并聚焦
  useEffect(() => {
    if (focusedCell) {
      const { rowIndex, columnIndex } = focusedCell;
      const rows = table.getSortedRowModel().rows;
      
      // 使用requestAnimationFrame确保在下一帧中聚焦，减少布局抖动
      requestAnimationFrame(() => {
        const cellElement = document.querySelector(
          `[data-row-index="${rowIndex}"][data-col-index="${columnIndex}"]`
        );
        
        if (cellElement) {
          (cellElement as HTMLElement).focus();
        } else if (rowIndex >= rows.length) {
          // 如果焦点超出了当前加载的行，尝试加载更多数据
          if (hasNextPage && !isLoadingMore && !isFetching) {
            void fetchNextPage();
          }
        }
      });
    }
  }, [focusedCell, table, hasNextPage, fetchNextPage, isFetching, isLoadingMore]);
  
  // 使用useCallback包装fetchNextPage，添加防抖和锁定
  const debouncedFetchNextPage = React.useCallback(async () => {
    if (isLoadingMore || isFetching || !hasNextPage) return;
    
    setIsLoadingMore(true);
    await fetchNextPage();
    // 设置一个短暂的延迟，防止快速连续触发
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 300);
  }, [fetchNextPage, hasNextPage, isFetching, isLoadingMore]);
  
  // 添加重新获取数据的函数，用于向上滚动时加载旧数据
  const refreshAllData = React.useCallback(async () => {
    if (isLoadingTop || isFetching) return;
    
    try {
      setIsLoadingTop(true);
      // 保存当前滚动位置
      if (tableContainerRef.current) {
        scrollPositionRef.current = tableContainerRef.current.scrollTop;
      }
      
      // 重新加载所有数据
      await utils.record.list.invalidate({ tableId });
      
      // 延迟恢复滚动位置
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = scrollPositionRef.current;
        }
        setIsLoadingTop(false);
      }, 300);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setIsLoadingTop(false);
    }
  }, [utils.record.list, tableId, isLoadingTop, isFetching]);
  
  // 更新已获取的记录ID集合
  useEffect(() => {
    if (flatData.length > 0) {
      const currentIds = new Set(flatData.map(record => record.id));
      fetchedIdsRef.current = currentIds;
    }
  }, [flatData]);

  // 处理无限滚动
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const containerRefElement = e.target as HTMLDivElement;
      if (!containerRefElement) return;
      
      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      
      // 向下滚动时，当接近底部时加载更多数据
      if (
        scrollHeight - scrollTop - clientHeight < 80 &&
        !isLoadingMore &&
        !isFetching &&
        hasNextPage
      ) {
        void debouncedFetchNextPage();
      }
      
      // 向上滚动时，当接近顶部时刷新数据
      if (
        scrollTop < 80 &&
        !isLoadingTop &&
        !isFetching
      ) {
        void refreshAllData();
      }
    };
    
    const currentRef = tableContainerRef.current;
    
    // 使用防抖包装滚动处理函数，减少频繁触发
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const debouncedScroll = (e: Event) => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => handleScroll(e), 100);
    };
    
    if (currentRef) {
      currentRef.addEventListener('scroll', debouncedScroll);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', debouncedScroll);
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [debouncedFetchNextPage, hasNextPage, isFetching, isLoadingMore, isLoadingTop, refreshAllData]);

  // 预取数据页
  useEffect(() => {
    // 如果当前有数据，并且不是正在获取数据，预取下一页
    if (data && data.pages.length > 0 && !isFetching && hasNextPage) {
      // 预取下一页数据，但不会立即显示
      void fetchNextPage({ cancelRefetch: true }).catch(e => console.error(e));
    }
  }, [data, fetchNextPage, hasNextPage, isFetching]);

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
        {/* 顶部加载指示器 */}
        {isLoadingTop && (
          <div className="sticky top-0 left-0 right-0 z-20 flex justify-center bg-white p-2 text-center border-b">
            刷新数据中...
          </div>
        )}
        
        {/* 表头 */}
        <table className="min-w-full table-fixed border-collapse sticky top-0 z-10">
          <thead className="bg-white">
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
        </table>
        
        {/* 表格内容 - 使用虚拟滚动 */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            
            if (!row) return null;
            
            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                className="absolute top-0 left-0 w-full border-b hover:bg-gray-50"
                data-state={row.getIsSelected() ? "selected" : undefined}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="flex h-full">
                  {row.getVisibleCells().map((cell, colIndex) => (
                    <div 
                      key={cell.id} 
                      className="border-r px-4 py-2 last:border-r-0 flex items-center"
                      data-row-index={virtualRow.index}
                      data-col-index={colIndex}
                      style={{ 
                        width: `${Math.max(150, 100 / columns.length)}px`,
                        minWidth: `${Math.max(150, 100 / columns.length)}px` 
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 加载中提示 */}
        {(isFetching || isLoadingMore) && (
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