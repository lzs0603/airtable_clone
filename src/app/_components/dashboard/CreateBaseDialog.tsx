"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface CreateBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBaseDialog({ open, onOpenChange }: CreateBaseDialogProps) {
  const [baseName, setBaseName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const utils = api.useUtils();
  const { mutate, error } = api.base.create.useMutation({
    onSuccess: () => {
      setBaseName("");
      setIsCreating(false);
      void utils.base.list.invalidate(); // 刷新 base 列表
      onOpenChange(false); // 关闭弹窗
    },
    onError: () => {
      setIsCreating(false);
    }
  });

  const handleCreate = () => {
    if (baseName.trim() === "") return;
    setIsCreating(true);
    mutate({ name: baseName });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建新基地</DialogTitle>
          <DialogDescription>
            基地是一个可视化数据库，用于组织和管理您的数据。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="base-name" className="text-sm font-medium">
                基地名称
              </label>
              <Input
                id="base-name"
                placeholder="输入基地名称"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error.message}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleCreate}
            disabled={baseName.trim() === "" || isCreating}
          >
            {isCreating ? "创建中..." : "创建基地"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 