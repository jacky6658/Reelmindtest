import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateContent } from "./gemini";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  content: router({
    generate: publicProcedure
      .input(
        z.object({
          topic: z.string().min(1),
          targetAudience: z.string().min(1),
          goal: z.string().min(1),
          platform: z.string().min(1),
          style: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await generateContent(input);
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
