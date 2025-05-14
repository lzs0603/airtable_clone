import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { CellValue } from "@prisma/client";

export const cellValueRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        recordId: z.string(),
        fieldId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<CellValue | null> => {
      // 验证用户对字段的访问权限
      const field = await ctx.db.field.findFirst({
        where: {
          id: input.fieldId,
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (!field) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权访问此字段",
        });
      }

      return ctx.db.cellValue.findUnique({
        where: {
          recordId_fieldId: {
            recordId: input.recordId,
            fieldId: input.fieldId,
          },
        },
      });
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        recordId: z.string(),
        fieldId: z.string(),
        textValue: z.string().nullable().optional(),
        numberValue: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<CellValue> => {
      // 验证用户对字段的访问权限
      const field = await ctx.db.field.findFirst({
        where: {
          id: input.fieldId,
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (!field) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权编辑此字段",
        });
      }

      return ctx.db.cellValue.upsert({
        where: {
          recordId_fieldId: {
            recordId: input.recordId,
            fieldId: input.fieldId,
          },
        },
        create: {
          recordId: input.recordId,
          fieldId: input.fieldId,
          textValue: field.type === "text" ? input.textValue : null,
          numberValue: field.type === "number" ? input.numberValue : null,
        },
        update: {
          textValue: field.type === "text" ? input.textValue : null,
          numberValue: field.type === "number" ? input.numberValue : null,
        },
      });
    }),

  getForRecords: protectedProcedure
    .input(
      z.object({
        recordIds: z.array(z.string()),
        fieldIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }): Promise<CellValue[]> => {
      if (input.recordIds.length === 0 || input.fieldIds.length === 0) {
        return [];
      }

      // 验证用户对字段的访问权限
      const fields = await ctx.db.field.findMany({
        where: {
          id: { in: input.fieldIds },
          table: {
            base: {
              ownerId: ctx.session.user.id,
            },
          },
        },
      });

      if (fields.length !== input.fieldIds.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权访问部分字段",
        });
      }

      return ctx.db.cellValue.findMany({
        where: {
          recordId: { in: input.recordIds },
          fieldId: { in: input.fieldIds },
        },
      });
    }),
}); 