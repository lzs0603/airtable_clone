import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Table } from "@prisma/client";

export const tableRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        baseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Table> => {
      // 检查基地是否属于当前用户
      const base = await ctx.db.base.findFirst({
        where: {
          id: input.baseId,
          ownerId: ctx.session.user.id,
        },
      });

      if (!base) {
        throw new Error("无权在此基地创建表格");
      }

      // 创建表格
      const table = await ctx.db.table.create({
        data: {
          name: input.name,
          baseId: input.baseId,
        },
      });

      // 创建默认字段（文本和数字）
      await ctx.db.field.createMany({
        data: [
          {
            name: "标题",
            type: "text",
            order: 0,
            tableId: table.id,
          },
          {
            name: "数值",
            type: "number",
            order: 1,
            tableId: table.id,
          },
        ],
      });

      return table;
    }),

  list: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<Table[]> => {
      // 验证用户对基地的访问权限
      const base = await ctx.db.base.findFirst({
        where: {
          id: input.baseId,
          ownerId: ctx.session.user.id,
        },
      });

      if (!base) {
        throw new Error("无权访问此基地");
      }

      return ctx.db.table.findMany({
        where: {
          baseId: input.baseId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<Table | null> => {
      const table = await ctx.db.table.findFirst({
        where: {
          id: input.id,
          base: {
            ownerId: ctx.session.user.id,
          },
        },
      });

      return table;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 校验用户是否有权限删除该表格
      const table = await ctx.db.table.findFirst({
        where: {
          id: input.id,
          base: { ownerId: ctx.session.user.id },
        },
      });
      if (!table) {
        throw new Error("无权删除此表格");
      }
      // 级联删除由 Prisma schema 保证
      return ctx.db.table.delete({ where: { id: input.id } });
    }),
}); 