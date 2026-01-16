"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { clientApi } from "~/app/_lib/trpc";

type FreeReportVerificationPageProps = {
  params: {
    verificationID: string;
  };
};

export default function FreeReportVerificationPage({
  params,
}: FreeReportVerificationPageProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRequested = useRef(false);

  const confirmReport =
    clientApi.reports.confirmFreeReportGeneration.useMutation({
    onSuccess: (data) => {
      router.replace(`/reports/view/${data.reportId}`);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to verify your report request.");
    },
  });

  useEffect(() => {
    if (hasRequested.current) {
      return;
    }

    hasRequested.current = true;
    confirmReport.mutate({ id: params.verificationID });
  }, [confirmReport, params.verificationID]);

  return (
    <main className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Verifying your email</CardTitle>
          <CardDescription>
            We are confirming your request and starting the report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : (
            <p className="text-muted-foreground text-sm">Please wait...</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
