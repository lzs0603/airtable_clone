"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import CreateBaseDialog from "./CreateBaseDialog";
import { cn } from "~/lib/utils";

interface CreateBaseButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function CreateBaseButton({ children, className }: CreateBaseButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={cn(className)}
      >
        {children ?? (
          <Button>创建新基地</Button>
        )}
      </div>

      <CreateBaseDialog 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
} 