"use client";

import { useState } from "react";

import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { clientApi } from "~/app/_lib/trpc";

type ReportFormState = {
  email: string;
  xHandle: string;
  tezosWallet: string;
};

const defaultFormState: ReportFormState = {
  email: "",
  xHandle: "",
  tezosWallet: "",
};

export function ReportGenerateForm() {
  const [formState, setFormState] = useState<ReportFormState>(defaultFormState);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const generateReport =
    clientApi.reports.startFreeReportGeneration.useMutation({
    onSuccess: (data) => {
      if ("error" in data) {
        setShowConfirmation(false);

        if (data.error === "EXCEEDED_FREE_REPORTS") {
          setFormError(
            "You already requested a free report with this email, X handle, or wallet.",
          );
          return;
        }

        if (data.error === "INVALID_FIELD") {
          setFormError(
            data.field === "xHandle"
              ? "Please enter a valid X handle."
              : "Please enter a valid Tezos wallet address.",
          );
          return;
        }

        setFormError("Failed to generate report.");
        return;
      }

      setFormError(null);
      setShowConfirmation(true);
    },
    onError: () => {
      setShowConfirmation(false);
      setFormError("Failed to generate report.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowConfirmation(false);
    setFormError(null);

    generateReport.mutate({
      email: formState.email.trim(),
      xHandle: formState.xHandle.trim(),
      tezosWallet: formState.tezosWallet.trim(),
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="report-email">Email</Label>
        <Input
          id="report-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formState.email}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="report-x-handle">X handle</Label>
        <Input
          id="report-x-handle"
          name="xHandle"
          type="text"
          autoComplete="username"
          placeholder="@yourhandle"
          value={formState.xHandle}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              xHandle: event.target.value,
            }))
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="report-tezos-wallet">Tezos wallet</Label>
        <Input
          id="report-tezos-wallet"
          name="tezosWallet"
          type="text"
          autoComplete="off"
          placeholder="tz1..."
          value={formState.tezosWallet}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              tezosWallet: event.target.value,
            }))
          }
          required
        />
      </div>
      {formError ? (
        <p className="text-destructive text-sm">{formError}</p>
      ) : null}
      {showConfirmation ? (
        <p className="text-muted-foreground text-sm">
          Check your email to verify your request and start the report.
        </p>
      ) : null}
      <Button type="submit" disabled={generateReport.isPending}>
        {generateReport.isPending ? "Sending..." : "Send verification email"}
      </Button>
    </form>
  );
}
