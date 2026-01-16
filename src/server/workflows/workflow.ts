import "server-only";

import { Client } from "@upstash/workflow";

import { env } from "~/env";

const WORKFLOWS_BASE_PATH = "/api/workflows";

const buildWorkflowUrl = (
  workflowName: string,
  baseUrl: string = env.APP_URL,
) => `${baseUrl}${WORKFLOWS_BASE_PATH}/${workflowName}`;

type WorkflowHandler = {
  POST: (request: Request) => Promise<Response>;
};

type TriggerOptions = {
  retries?: number;
  keepTriggerConfig?: boolean;
  baseUrl?: string;
  client?: Client;
};

export class Workflow {
  static name: string;
  static workflow: WorkflowHandler;

  static getClient() {
    return new Client({
      token: env.QSTASH_TOKEN!,
      baseUrl: env.QSTASH_URL ?? undefined,
    });
  }

  static trigger<Payload>(
    this: { name: string; getClient: () => Client },
    payload: Payload,
    options: TriggerOptions = {},
  ) {
    const client = options.client ?? this.getClient();

    return client.trigger({
      url: buildWorkflowUrl(this.name, options.baseUrl),
      body: payload,
      retries: options.retries ?? 3,
      keepTriggerConfig: options.keepTriggerConfig ?? true,
    });
  }
}
