import "server-only";

import { GenerateReportWorkflow } from "./generate-report";
import { HelloWorldWorkflow } from "./hello-world";

const workflowList = [GenerateReportWorkflow, HelloWorldWorkflow] as const;

export const workflows = workflowList.reduce(
  (acc, workflow) => ({
    ...acc,
    [workflow.name]: workflow.workflow,
  }),
  {} as Record<string, { POST: (request: Request) => Promise<Response> }>,
);
