import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { View } from "@prisma/client";

export const viewRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<View[]> => {
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
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权访问此表格",
        });
      }

      return ctx.db.view.findMany({
        where: {
          tableId: input.tableId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        tableId: z.string(),
        filters: z.string().optional(),
        sorts: z.string().optional(),
        hiddenFields: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<View> => {
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
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权访问此表格",
        });
      }

      return ctx.db.view.create({
        data: {
          name: input.name,
          tableId: input.tableId,
          filters: input.filters,
          sorts: input.sorts,
          hiddenFields: input.hiddenFields,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        filters: z.string().optional(),
        sorts: z.string().optional(),
        hiddenFields: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<View> => {
      // 验证用户对视图的访问权限
      const view = await ctx.db.view.findFirst({
        where: {
          id: input.id,
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (!view) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权编辑此视图",
        });
      }

      return ctx.db.view.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          filters: input.filters,
          sorts: input.sorts,
          hiddenFields: input.hiddenFields,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<View> => {
      // 验证用户对视图的访问权限
      const view = await ctx.db.view.findFirst({
        where: {
          id: input.id,
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (!view) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权删除此视图",
        });
      }

      return ctx.db.view.delete({
        where: {
          id: input.id,
        },
      });
    }),
}); 