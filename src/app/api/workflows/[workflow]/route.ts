import { NextResponse, type NextRequest } from "next/server";

import { workflows } from "~/server/workflows";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflow: string }> },
) {
  const { workflow: workflowName } = await params;
  const workflow = workflows[workflowName];

  if (!workflow) {
    return NextResponse.json(
      { error: "Unknown workflow" },
      { status: 404 },
    );
  }

  return workflow.POST(request);
}
