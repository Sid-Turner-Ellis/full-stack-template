import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { db } from "~/server/lib/db";

type ReportViewPageProps = {
  params: {
    id: string;
  };
};

export default async function ReportViewPage({ params }: ReportViewPageProps) {
  const report = await db.report.findUnique({
    where: { publicId: params.id },
    select: {
      workflowId: true,
      completedAt: true,
      workflowFailedAt: true,
    },
  });

  if (!report) {
    notFound();
  }

  let title = "Report in progress";
  let description =
    "We're generating your report. We'll email you when it's ready.";
  let statusMessage =
    "This can take a few minutes. You can safely close this page.";

  if (report.workflowFailedAt) {
    title = "Report failed";
    description =
      "Something went wrong whilst generating your report, email us at sid@engineerbox.uk.";
    statusMessage = "We'll take a look as soon as possible.";
  } else if (!report.workflowId) {
    title = "Verify your email";
    description =
      "We haven't started yet. Check your inbox for the verification link.";
    statusMessage = "Once verified, we'll begin generating your report.";
  } else if (report.completedAt) {
    title = "Report ready";
    description = "Your report is ready. We'll email you a link shortly.";
    statusMessage = "If you don't see it, check your spam folder.";
  }

  return (
    <main className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-muted-foreground text-sm">{statusMessage}</p>
          <p className="text-muted-foreground text-sm">
            Report id: <span className="font-mono">{params.id}</span>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
