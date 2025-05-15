import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Base } from "@prisma/client";

export const baseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Base> => {
      return ctx.db.base.create({
        data: {
          name: input.name,
          ownerId: ctx.session.user.id,
        },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }): Promise<Base[]> => {
    return ctx.db.base.findMany({
      where: {
        ownerId: ctx.session.user.id,
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
    .query(async ({ ctx, input }): Promise<Base | null> => {
      return ctx.db.base.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 校验用户是否有权限删除该基地
      const base = await ctx.db.base.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
        },
      });
      if (!base) {
        throw new Error("无权删除此基地");
      }
      // 级联删除由 Prisma schema 保证
      return ctx.db.base.delete({ where: { id: input.id } });
    }),
});
