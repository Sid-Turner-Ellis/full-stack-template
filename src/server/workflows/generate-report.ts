import "server-only";

import { serve } from "@upstash/workflow/nextjs";
import { z } from "zod";

import { db } from "~/server/lib/db";
import { syncTweets } from "~/server/services/sync-tweets";
import { Workflow } from "~/server/workflows/workflow";

export const generateReportPayloadSchema = z.object({
  email: z.string().email(),
  xHandle: z.string().min(1),
  tezosWallet: z.string().min(1),
  reportId: z.string().min(1),
  requestedAt: z.string().min(1),
  twitterUserId: z.string().min(1),
  tezosWalletId: z.string().min(1),
});

const workflow = serve(
  async (context) => {
    const payload = context.requestPayload;

    await db.report.update({
      where: { publicId: payload.reportId },
      data: { workflowId: context.workflowRunId },
    });
    const twitterData = await context.run("sync-tweets", async () => {
      await syncTweets(payload.twitterUserId);

      await db.report.update({
        where: { publicId: payload.reportId },
        data: { syncedTweetsAt: new Date() },
      });
    });

    const tezosData = await context.run("sync-tezos", async () => {
      await Promise.resolve(null);

      await db.report.update({
        where: { publicId: payload.reportId },
        data: { syncedBlockchainAt: new Date() },
      });
    });

    const report = await context.run("create-report", async () => {
      return null;
    });

    return {
      reportId: payload.reportId,
      email: payload.email,
      xHandle: payload.xHandle,
      tezosWallet: payload.tezosWallet,
      requestedAt: payload.requestedAt,
      twitterData,
      tezosData,
      report,
    };
  },
  {
    schema: generateReportPayloadSchema,
    failureFunction: async ({
      context,
      failStatus,
      failResponse,
      failHeaders,
      failStack,
    }) => {
      const payload = context.requestPayload;

      console.error("generate-report workflow failed", {
        reportId: payload.reportId,
        failStatus,
        failResponse,
        failHeaders,
        failStack,
      });

      await db.report.update({
        where: { publicId: payload.reportId },
        data: { workflowFailedAt: new Date() },
      });
    },
  },
);

export class GenerateReportWorkflow extends Workflow {
  static name = "generate-report";
  static workflow = workflow;
}
