"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type ColumnResizeMode,
  type ColumnSizingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { 
  Plus, 
  ArrowUpDown, 
  Eye, 
  EyeOff, 
  ChevronDown,
  GripHorizontal,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import EditableCell from "./EditableCell";
import { useQueryClient } from "@tanstack/react-query";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

// 需要创建Tooltip组件
const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const TooltipTrigger = ({ asChild, children }: { asChild?: boolean, children: React.ReactNode }) => {
  return <>{children}</>;
};

const TooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="hidden">{children}</div>;
};

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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
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

  // 使用useCallback包装fetchNextPage，优化性能并简化操作
  const debouncedFetchNextPage = React.useCallback(async () => {
    if (isLoadingMore || isFetching || !hasNextPage) return;
    
    try {
      setIsLoadingMore(true);
      
      // 添加日志以便调试
      console.log('Fetching next page...');
      
      // 直接获取下一页数据，简化流程
      await fetchNextPage();
      
      // 设置一个短暂的延迟，防止快速连续触发
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 200);
    } catch (error) {
      console.error("Failed to fetch next page:", error);
      setIsLoadingMore(false);
    }
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
          header: ({ column }) => {
            return (
              <div className="flex items-center justify-between h-full group">
                <span className="font-medium">{field.name}</span>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  {column.getCanSort() && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" 
                          size="icon"
                          onClick={column.getToggleSortingHandler()}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>排序</TooltipContent>
                    </Tooltip>
                  )}
                  <div
                    className={cn(
                      "h-4 cursor-col-resize select-none touch-none",
                      "w-1 bg-muted-foreground/20 hover:bg-muted-foreground/50 ml-2",
                      "transition-colors duration-200",
                      column.getIsResizing() && "bg-primary"
                    )}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      column.getToggleSortingHandler()
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </div>
              </div>
            );
          },
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
                tableId={tableId}
              />
            );
          },
          enableSorting: true,
          enableResizing: true,
          size: 180,
          minSize: 100,
          maxSize: 500,
        }
      )
    );
    
    return cols;
  }, [fields, columnHelper, handleTabNavigation, tableId]);
  
  // 创建表格实例
  const table = useReactTable({
    data: memoizedFlatData,
    columns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnSizing,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode,
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
  
  // 处理无限滚动
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const containerRefElement = e.target as HTMLDivElement;
      if (!containerRefElement) return;
      
      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      
      // 更直接的方式检测是否要加载更多数据
      // 当滚动到距离底部100px时就加载更多
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (
        distanceFromBottom < 100 &&
        !isLoadingMore &&
        !isFetching &&
        hasNextPage
      ) {
        console.log('Loading more data from scroll...');
        void debouncedFetchNextPage();
      }
      
      // 向上滚动时，当接近顶部时刷新数据
      if (
        scrollTop < 50 &&
        !isLoadingTop &&
        !isFetching
      ) {
        console.log('Refreshing data from top scroll...');
        void refreshAllData();
      }
    };
    
    const currentRef = tableContainerRef.current;
    
    if (currentRef) {
      // 直接添加事件监听，移除防抖处理，减少延迟
      currentRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [debouncedFetchNextPage, hasNextPage, isFetching, isLoadingMore, isLoadingTop, refreshAllData]);

  // 更新已获取的记录ID集合
  useEffect(() => {
    if (flatData.length > 0) {
      const currentIds = new Set(flatData.map(record => record.id));
      fetchedIdsRef.current = currentIds;
    }
  }, [flatData]);

  // 预取数据页
  useEffect(() => {
    // 初始加载时获取第一页数据后，立即加载第二页，但不继续自动加载更多
    if (data && data.pages.length === 1 && !isFetching && hasNextPage) {
      // 只在初始加载后加载一次第二页，不持续预取
      void fetchNextPage().catch(e => console.error(e));
    }
  }, [data, fetchNextPage, hasNextPage, isFetching]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* 表格工具栏 */}
      <div className="px-4 py-2 border-b flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => void createRecord({ tableId })}
            className="flex items-center"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> 添加行
          </Button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => void refreshAllData()}
                disabled={isLoadingTop}
                className="flex items-center"
              >
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isLoadingTop && "animate-spin")} /> 
                刷新
              </Button>
            </TooltipTrigger>
            <TooltipContent>刷新数据</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-3.5 w-3.5 mr-1" /> 过滤
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>过滤选项</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-between">
                创建过滤器 <Plus className="h-3.5 w-3.5" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Eye className="h-3.5 w-3.5 mr-1" /> 字段
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>显示/隐藏字段</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().map((column) => {
                // 如果列没有headerValue，则可能是一个特殊列（如操作列），不要显示
                if (!column.columnDef.header) return null;
                
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {typeof column.columnDef.header === 'string' 
                      ? column.columnDef.header 
                      : fields.find(f => f.id === column.id)?.name ?? column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-3.5 w-3.5 mr-1" /> 导出
              </Button>
            </TooltipTrigger>
            <TooltipContent>导出数据</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* 表格内容区域 */}
      <div 
        className="relative flex-1 overflow-auto border-t" 
        ref={tableContainerRef}
        style={{ height: 'calc(100vh - 180px)' }}
      >
        {/* 顶部加载指示器 */}
        {isLoadingTop && (
          <div className="sticky top-0 left-0 right-0 z-20 flex justify-center bg-white p-2 text-center border-b">
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">刷新数据中...</span>
            </div>
          </div>
        )}
        
        {/* 表头 */}
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex w-max min-w-full border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <div key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map(header => (
                  <div 
                    key={header.id}
                    className="border-r last:border-r-0 py-3 px-4 bg-slate-50"
                    style={{ 
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder 
                      ? null 
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* 表格内容 - 使用虚拟滚动 */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
          className="w-max min-w-full"
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            
            if (!row) return null;
            
            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                className={cn(
                  "absolute top-0 left-0 w-full border-b hover:bg-slate-50/70 transition-colors",
                  row.getIsSelected() && "bg-slate-100/80"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="flex h-full w-max min-w-full">
                  {row.getVisibleCells().map((cell, colIndex) => (
                    <div 
                      key={cell.id} 
                      className="border-r last:border-r-0 px-4 py-2 flex items-center"
                      data-row-index={virtualRow.index}
                      data-col-index={colIndex}
                      style={{ 
                        width: cell.column.getSize(),
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
        
        {/* 底部加载指示器 */}
        {isLoadingMore && (
          <div className="sticky bottom-0 left-0 right-0 flex justify-center bg-white p-2 text-center border-t">
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">加载更多数据...</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="px-4 py-2 border-t flex items-center justify-between bg-white text-sm text-muted-foreground">
        <div>
          {`已加载 ${totalFetched} 行，共 ${totalDBRowCount} 行`}
        </div>
        
        <div>
          {Object.keys(rowSelection).length > 0 && (
            <span className="mr-4">已选择 {Object.keys(rowSelection).length} 行</span>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => void createRecord({ tableId })}
            className="flex items-center"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> 添加行
          </Button>
        </div>
      </div>
    </div>
  );
} 