import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Record as RecordModel } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { faker } from "@faker-js/faker";

// —— 1. 定义并导出各个 procedure 的 input schema —— //
const listInputSchema = z.object({
  tableId: z.string(),
  cursor: z.number().default(0),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  filters: z
    .array(
      z.object({
        fieldId: z.string(),
        operator: z.enum([
          "contains",
          "notContains",
          "equals",
          "notEquals",
          "empty",
          "notEmpty",
          "greaterThan",
          "lessThan",
        ]),
        value: z.string().optional(),
      })
    )
    .optional(),
  sorts: z
    .array(
      z.object({
        fieldId: z.string(),
        direction: z.enum(["asc", "desc"]),
      })
    )
    .optional(),
});
type ListInput = z.infer<typeof listInputSchema>;

const createInputSchema = z.object({
  tableId: z.string(),
});
type CreateInput = z.infer<typeof createInputSchema>;

const deleteInputSchema = z.object({
  id: z.string(),
});
type DeleteInput = z.infer<typeof deleteInputSchema>;

const createBulkInputSchema = z.object({
  tableId: z.string(),
  count: z.number().min(1).max(100000).default(10),
});
type CreateBulkInput = z.infer<typeof createBulkInputSchema>;

// —— 2. Router 定义 —— //
export const recordRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }): Promise<{
      records: RecordModel[];
      totalCount: number;
      nextCursor: number | null;
    }> => {
      // 强制把 input 当成 ListInput，消除 ESLint 的 any 报错
      const {
        tableId,
        cursor,
        limit,
        search,
        filters = [],
        sorts = [],
      } = input;

      // 验证权限
      const table = await ctx.db.table.findFirst({
        where: {
          id: tableId,
          base: { ownerId: ctx.session.user.id },
        },
      });
      if (!table) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权访问此表格" });
      }

      // 基础 where
      const where = { tableId };

      // 总数
      const totalCount = await ctx.db.record.count({ where });

      // 拉数据，多取一条判断下一页
      const rows = await ctx.db.record.findMany({
        where,
        skip: cursor,
        take: limit + 1,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: number | null = null;
      if (rows.length > limit) {
        rows.pop();
        nextCursor = cursor + limit;
      }

      return { records: rows, totalCount, nextCursor };
    }),

  create: protectedProcedure
    .input(createInputSchema)
    .mutation(async ({ ctx, input }): Promise<RecordModel> => {
      const { tableId } = input;
      const table = await ctx.db.table.findFirst({
        where: { id: tableId, base: { ownerId: ctx.session.user.id } },
      });
      if (!table) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权访问此表格" });
      }
      return ctx.db.record.create({ data: { tableId } });
    }),

  delete: protectedProcedure
    .input(deleteInputSchema)
    .mutation(async ({ ctx, input }): Promise<RecordModel> => {
      const { id } = input;
      const record = await ctx.db.record.findFirst({
        where: { 
          id, 
          table: { base: { ownerId: ctx.session.user.id } } 
        },
      });
      if (!record) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权删除此记录" });
      }
      return ctx.db.record.delete({ where: { id } });
    }),

  createBulk: protectedProcedure
    .input(createBulkInputSchema)
    .mutation(async ({ ctx, input }): Promise<{ count: number }> => {
      const { tableId, count } = input;
      const table = await ctx.db.table.findFirst({
        where: { id: tableId, base: { ownerId: ctx.session.user.id } },
      });
      if (!table) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权访问此表格" });
      }

      const batchSize = 1000;
      let createdCount = 0;
      for (let i = 0; i < count; i += batchSize) {
        const batchCount = Math.min(batchSize, count - i);
        await ctx.db.record.createMany({
          data: Array.from({ length: batchCount }, () => ({ tableId })),
        });
        createdCount += batchCount;
      }
      return { count: createdCount };
    }),
});