// src/utils/api.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "~/server/api/root";

// 创建前端 tRPC 客户端实例
export const api = createTRPCReact<AppRouter>();
