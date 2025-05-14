"use client";

import { useState } from "react";
import { Eye, Plus, Check, Filter, ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

interface ViewManagerProps {
  tableId: string;
  onApplyFilter: (filters: Filter[]) => void;
  onApplySort: (sorts: Sort[]) => void;
  onToggleFields: (hiddenFields: string[]) => void;
}

// 类型定义
interface View {
  id: string;
  name: string;
  tableId: string;
  filters: string | null;
  sorts: string | null;
  hiddenFields: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Field {
  id: string;
  name: string;
  type: string;
  order: number;
  tableId: string;
}

interface Filter {
  fieldId: string;
  operator: string;
  value?: string;
}

interface Sort {
  fieldId: string;
  order: 'asc' | 'desc';
}

export default function ViewManager({
  tableId,
  onApplyFilter,
  onApplySort,
  onToggleFields,
}: ViewManagerProps) {
  const [isCreatingView, setIsCreatingView] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // 获取表格的所有视图
  const { data: views = [] } = api.view.list.useQuery<View[]>(
    { tableId },
    { enabled: !!tableId }
  );
  
  // 获取表格字段
  const { data: fields = [] } = api.field.list.useQuery<Field[]>(
    { tableId },
    { enabled: !!tableId }
  );
  
  // 当前选中的视图
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  
  // 过滤器和排序状态
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  
  const utils = api.useUtils();
  
  // 创建新视图
  const { mutate: createView } = api.view.create.useMutation({
    onSuccess: () => {
      setIsCreatingView(false);
      setNewViewName("");
      void utils.view.list.invalidate({ tableId });
    },
  });
  
  // 应用视图
  const applyView = (viewId: string) => {
    const view = views.find((v) => v.id === viewId);
    if (!view) return;
    
    setActiveViewId(viewId);
    
    // 解析并应用过滤器
    try {
      const parsedJson: unknown = view.filters ? JSON.parse(view.filters) : [];
      // 添加类型检查，确保解析的结果符合 Filter[] 类型
      const parsedFilters: Filter[] = Array.isArray(parsedJson) 
        ? parsedJson.filter((item: unknown): item is Filter => 
            typeof item === 'object' && 
            item !== null && 
            'fieldId' in item &&
            'operator' in item &&
            typeof (item as Record<string, unknown>).fieldId === 'string' && 
            typeof (item as Record<string, unknown>).operator === 'string')
        : [];
      setFilters(parsedFilters);
      onApplyFilter(parsedFilters);
    } catch (e) {
      console.error("无法解析过滤器:", e);
    }
    
    // 解析并应用排序
    try {
      const parsedJson: unknown = view.sorts ? JSON.parse(view.sorts) : [];
      // 添加类型检查，确保解析的结果符合 Sort[] 类型
      const parsedSorts: Sort[] = Array.isArray(parsedJson)
        ? parsedJson.filter((item: unknown): item is Sort =>
            typeof item === 'object' &&
            item !== null &&
            'fieldId' in item &&
            'order' in item &&
            typeof (item as Record<string, unknown>).fieldId === 'string' &&
            ((item as Record<string, unknown>).order === 'asc' || (item as Record<string, unknown>).order === 'desc'))
        : [];
      setSorts(parsedSorts);
      onApplySort(parsedSorts);
    } catch (e) {
      console.error("无法解析排序:", e);
    }
    
    // 解析并应用隐藏字段
    try {
      const parsedJson: unknown = view.hiddenFields ? JSON.parse(view.hiddenFields) : [];
      // 添加类型检查，确保解析的结果是字符串数组
      const parsedHiddenFields: string[] = Array.isArray(parsedJson)
        ? parsedJson.filter((item: unknown): item is string => typeof item === 'string')
        : [];
      setHiddenFields(parsedHiddenFields);
      onToggleFields(parsedHiddenFields);
    } catch (e) {
      console.error("无法解析隐藏字段:", e);
    }
  };
  
  // 保存当前视图
  const { mutate: updateView } = api.view.update.useMutation({
    onSuccess: () => {
      void utils.view.list.invalidate({ tableId });
    },
  });
  
  const saveCurrentView = () => {
    if (!activeViewId) return;
    
    updateView({
      id: activeViewId,
      filters: JSON.stringify(filters),
      sorts: JSON.stringify(sorts),
      hiddenFields: JSON.stringify(hiddenFields),
    });
  };
  
  // 创建新视图
  const handleCreateView = () => {
    if (!newViewName.trim()) return;
    
    createView({
      name: newViewName,
      tableId,
      filters: JSON.stringify(filters),
      sorts: JSON.stringify(sorts),
      hiddenFields: JSON.stringify(hiddenFields),
    });
  };
  
  return (
    <div className="relative mb-2">
      <div className="flex items-center">
        <div className="mr-2 flex items-center border-r border-gray-200 pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowViewOptions(!showViewOptions)}
            className="flex items-center gap-1 text-sm"
          >
            <Eye className="h-4 w-4" />
            视图
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-1 overflow-x-auto">
          {views.map((view) => (
            <Button
              key={view.id}
              variant={activeViewId === view.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => applyView(view.id)}
              className="flex items-center gap-1 text-sm"
            >
              {view.name}
              {activeViewId === view.id && <Check className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>
        
        {!isCreatingView ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingView(true)}
            className="flex items-center text-sm"
          >
            <Plus className="mr-1 h-3 w-3" />
            新建视图
          </Button>
        ) : (
          <div className="ml-2 flex items-center">
            <Input
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="视图名称"
              className="h-8 w-32 text-sm"
              autoFocus
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCreateView}
              disabled={!newViewName.trim()}
              className="text-sm"
            >
              保存
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsCreatingView(false);
                setNewViewName("");
              }}
              className="text-sm"
            >
              取消
            </Button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={isFiltering ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsFiltering(!isFiltering)}
            className="flex items-center gap-1 text-sm"
          >
            <Filter className="h-4 w-4" />
            过滤器
          </Button>
          
          {activeViewId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={saveCurrentView}
              className="text-sm"
            >
              保存视图
            </Button>
          )}
        </div>
      </div>
      
      {/* 视图选项下拉菜单 */}
      {showViewOptions && (
        <div className="absolute left-0 top-10 z-10 w-64 rounded-md border border-gray-200 bg-white p-2 shadow-md">
          <div className="mb-2 text-sm font-medium">字段显示</div>
          {fields.map((field) => (
            <div key={field.id} className="flex items-center py-1">
              <input
                type="checkbox"
                id={`field-${field.id}`}
                checked={!hiddenFields.includes(field.id)}
                onChange={(e) => {
                  const newHiddenFields = e.target.checked
                    ? hiddenFields.filter(id => id !== field.id)
                    : [...hiddenFields, field.id];
                  
                  setHiddenFields(newHiddenFields);
                  onToggleFields(newHiddenFields);
                }}
                className="mr-2"
              />
              <label htmlFor={`field-${field.id}`} className="text-sm">
                {field.name}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {/* 过滤器面板 */}
      {isFiltering && (
        <div className="mt-2 rounded-md border border-gray-200 bg-white p-2">
          <div className="mb-2 text-sm font-medium">过滤条件</div>
          
          {filters.length === 0 ? (
            <div className="text-sm text-gray-500">暂无过滤条件</div>
          ) : (
            <div className="space-y-2">
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* 过滤器UI，这里简化实现 */}
                  <select
                    value={filter.fieldId}
                    onChange={(e) => {
                      const newFilters = [...filters];
                      if (newFilters[index]) {
                        newFilters[index] = { ...newFilters[index], fieldId: e.target.value, operator: newFilters[index].operator ?? 'contains' };
                      }
                      setFilters(newFilters);
                      onApplyFilter(newFilters);
                    }}
                    className="h-8 rounded-md border border-gray-200 text-sm"
                  >
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={(e) => {
                      const newFilters = [...filters];
                      if (newFilters[index]) {
                        newFilters[index] = { ...newFilters[index], operator: e.target.value, fieldId: newFilters[index].fieldId };
                      }
                      setFilters(newFilters);
                      onApplyFilter(newFilters);
                    }}
                    className="h-8 rounded-md border border-gray-200 text-sm"
                  >
                    <option value="contains">包含</option>
                    <option value="notContains">不包含</option>
                    <option value="equals">等于</option>
                    <option value="notEquals">不等于</option>
                    <option value="empty">为空</option>
                    <option value="notEmpty">不为空</option>
                    {fields.find(f => f.id === filter.fieldId)?.type === 'number' && (
                      <>
                        <option value="greaterThan">大于</option>
                        <option value="lessThan">小于</option>
                      </>
                    )}
                  </select>
                  
                  {!['empty', 'notEmpty'].includes(filter.operator) && (
                    <Input
                      value={filter.value ?? ''}
                      onChange={(e) => {
                        const newFilters = [...filters];
                        if (newFilters[index]) {
                          newFilters[index] = { ...newFilters[index], value: e.target.value, fieldId: newFilters[index].fieldId, operator: newFilters[index].operator };
                        }
                        setFilters(newFilters);
                        onApplyFilter(newFilters);
                      }}
                      className="h-8 w-32 text-sm"
                    />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newFilters = filters.filter((_, i) => i !== index);
                      setFilters(newFilters);
                      onApplyFilter(newFilters);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const defaultField = fields[0]?.id;
              if (!defaultField) return;
              
              const newFilter: Filter = {
                fieldId: defaultField,
                operator: 'contains',
                value: '',
              };
              
              const newFilters = [...filters, newFilter];
              setFilters(newFilters);
              onApplyFilter(newFilters);
            }}
            className="mt-2 text-sm"
            disabled={fields.length === 0}
          >
            <Plus className="mr-1 h-3 w-3" />
            添加过滤条件
          </Button>
        </div>
      )}
    </div>
  );
} 