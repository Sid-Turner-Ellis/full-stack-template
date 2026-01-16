import type { JsonObject } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";

import { GenerateReportWorkflow } from "~/server/workflows/generate-report";
import { env } from "~/env";
import { sendEmail } from "~/server/lib/email";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type TwitterApiUserInfo,
  twitterApiService,
} from "~/server/lib/twitter-api";

const sanitizeXHandle = (value: string) => value.trim().replace(/^@+/, "");

export const reportsRouter = createTRPCRouter({
  startFreeReportGeneration: publicProcedure
    .input(
      z.object({
        email: z.string().trim().email(),
        xHandle: z.string().trim().min(1),
        tezosWallet: z.string().trim().min(1),
      }),
    )
    .output(
      z.union([
        z.object({
          success: z.literal(true),
        }),
        z.discriminatedUnion("error", [
          z.object({
            error: z.literal("EXCEEDED_FREE_REPORTS"),
          }),
          z.object({
            error: z.literal("INVALID_FIELD"),
            field: z.enum(["xHandle", "tezosWallet"]),
          }),
        ]),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      const xHandle = sanitizeXHandle(input.xHandle);

      if (!xHandle) {
        return { error: "INVALID_FIELD", field: "xHandle" };
      }

      const existingReport = await ctx.db.report.findFirst({
        where: {
          OR: [
            { email: input.email },
            { tezosWallet: { address: input.tezosWallet } },
          ],
        },
        select: { id: true },
      });

      if (existingReport) {
        return { error: "EXCEEDED_FREE_REPORTS" };
      }

      let twitterUserInfo: TwitterApiUserInfo;

      try {
        twitterUserInfo = await twitterApiService.getUserInfo(xHandle);
      } catch (error) {
        return { error: "INVALID_FIELD", field: "xHandle" };
      }

      const existingTwitterUser = await ctx.db.twitterUser.findUnique({
        where: { externalUserId: twitterUserInfo.id },
        select: { id: true },
      });

      if (existingTwitterUser) {
        return { error: "EXCEEDED_FREE_REPORTS" };
      }

      // TODO: validate tezos wallet format.

      const twitterUser = await ctx.db.twitterUser.upsert({
        where: { externalUserId: twitterUserInfo.id },
        create: {
          handle: twitterUserInfo.userName ?? xHandle,
          externalUserId: twitterUserInfo.id,
          userInfoData: twitterUserInfo as JsonObject,
        },
        update: {
          handle: twitterUserInfo.userName ?? xHandle,
          userInfoData: twitterUserInfo as JsonObject,
        },
        select: {
          id: true,
        },
      });

      const tezosWallet = await ctx.db.tezosWallet.upsert({
        where: { address: input.tezosWallet },
        create: { address: input.tezosWallet },
        update: {},
        select: {
          id: true,
        },
      });

      const reportId = `rpt_${nanoid()}`;
      const startGenerationCode = `stg_${nanoid()}`;

      await ctx.db.report.create({
        data: {
          publicId: reportId,
          email: input.email,
          startGenerationCode,
          twitterUserId: twitterUser.id,
          tezosWalletId: tezosWallet.id,
        },
        select: { id: true },
      });

      const verificationUrl = `${env.APP_URL}/reports/free-report-verification/${startGenerationCode}`;

      await sendEmail({
        to: input.email,
        subject: "Verify your report request",
        text: `Verify your report request: ${verificationUrl}`,
      });

      return { success: true };
    }),
  confirmFreeReportGeneration: publicProcedure
    .input(
      z.object({
        id: z.string().trim().min(1),
      }),
    )
    .output(
      z.object({
        reportId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.report.findUnique({
        where: { startGenerationCode: input.id },
        select: {
          publicId: true,
          email: true,
          workflowId: true,
          twitterUserId: true,
          tezosWalletId: true,
          twitterUser: { select: { handle: true } },
          tezosWallet: { select: { address: true } },
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verification code not found.",
        });
      }

      if (report.workflowId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Report already verified.",
        });
      }

      const requestedAt = new Date().toISOString();

      await GenerateReportWorkflow.trigger(
        {
          email: report.email,
          xHandle: report.twitterUser.handle,
          tezosWallet: report.tezosWallet.address,
          twitterUserId: report.twitterUserId,
          tezosWalletId: report.tezosWalletId,
          reportId: report.publicId,
          requestedAt,
        },
        { retries: 0 },
      );

      return { reportId: report.publicId };
    }),
});
