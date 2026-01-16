import "server-only";

import { serve } from "@upstash/workflow/nextjs";
import { z } from "zod";

import { db } from "~/server/lib/db";
import { Workflow } from "~/server/workflows/workflow";

export const helloWorldPayloadSchema = z.object({
  reportPublicId: z.string().optional(),
  note: z.string().optional(),
  delayMs: z.number().int().min(0).max(30_000).optional(),
});

const workflow = serve(
  async (context) => {
    const payload = context.requestPayload;

    console.log("[hello-world] start", {
      workflowRunId: context.workflowRunId,
      payload,
    });

    await context.run("log-payload", async () => {
      console.log("[hello-world] payload", payload);
    });

    await context.run("touch-report", async () => {
      if (!payload.reportPublicId) {
        console.log("[hello-world] no reportPublicId provided; skipping db update");
        return;
      }

      const result = await db.report.updateMany({
        where: { publicId: payload.reportPublicId },
        data: { workflowId: context.workflowRunId },
      });

      console.log("[hello-world] report updateMany result", result);
    });

    await context.run("optional-delay", async () => {
      const delayMs = payload.delayMs ?? 0;
      if (delayMs <= 0) {
        console.log("[hello-world] no delay requested");
        return;
      }

      console.log("[hello-world] delaying", { delayMs });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    });

    await context.run("about-to-throw", async () => {
      console.log("[hello-world] about to throw error to test failure handler");
    });

    throw new Error("hello-world workflow forced failure");
  },
  {
    schema: helloWorldPayloadSchema,
    failureFunction: async ({
      context,
      failStatus,
      failResponse,
      failHeaders,
      failStack,
    }) => {
      const payload = context.requestPayload;

      console.error("[hello-world] failure", {
        workflowRunId: context.workflowRunId,
        payload,
        failStatus,
        failResponse,
        failHeaders,
        failStack,
      });

      if (!payload.reportPublicId) {
        console.warn("[hello-world] no reportPublicId provided; skipping db update");
        return;
      }

      const result = await db.report.updateMany({
        where: { publicId: payload.reportPublicId },
        data: { workflowFailedAt: new Date() },
      });

      console.log("[hello-world] workflowFailedAt updateMany result", result);
    },
  },
);

export class HelloWorldWorkflow extends Workflow {
  static name = "hello-world";
  static workflow = workflow;
}
