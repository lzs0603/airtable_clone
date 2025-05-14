import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Field } from "@prisma/client";

export const fieldRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<Field[]> => {
      // 验证用户对表格的访问权限
      const table = await ctx.db.table.findFirst({
        where: {
          id: input.tableId,
          base: {
            ownerId: ctx.session.user.id,
          },
        },
      });

      if (!table) {
        throw new Error("无权访问此表格");
      }

      return ctx.db.field.findMany({
        where: {
          tableId: input.tableId,
        },
        orderBy: {
          order: "asc",
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        type: z.enum(["text", "number"]),
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Field> => {
      // 验证用户对表格的访问权限
      const table = await ctx.db.table.findFirst({
        where: {
          id: input.tableId,
          base: {
            ownerId: ctx.session.user.id,
          },
        },
      });

      if (!table) {
        throw new Error("无权访问此表格");
      }

      // 获取下一个排序位置
      const lastField = await ctx.db.field.findFirst({
        where: {
          tableId: input.tableId,
        },
        orderBy: {
          order: "desc",
        },
      });

      const nextOrder = lastField ? lastField.order + 1 : 0;

      return ctx.db.field.create({
        data: {
          name: input.name,
          type: input.type,
          order: nextOrder,
          tableId: input.tableId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Field> => {
      // 验证用户对字段的访问权限
      const field = await ctx.db.field.findFirst({
        where: {
          id: input.id,
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (!field) {
        throw new Error("无权编辑此字段");
      }

      return ctx.db.field.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Field> => {
      // 验证用户对字段的访问权限
      const field = await ctx.db.field.findFirst({
        where: {
          id: input.id,
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (!field) {
        throw new Error("无权删除此字段");
      }

      return ctx.db.field.delete({
        where: {
          id: input.id,
        },
      });
    }),
}); 