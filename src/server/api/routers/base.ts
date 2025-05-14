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
});
