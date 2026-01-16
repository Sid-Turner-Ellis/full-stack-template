import { ReportGenerateForm } from "./_components/report-generate-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

export default function GenerateReportPage() {
  return (
    <main className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Historical Impact Report</CardTitle>
          <CardDescription>
            See how your X activity maps to on-chain sales. We will email a
            verification link to start the report. One free report per email, X
            handle, or wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportGenerateForm />
        </CardContent>
      </Card>
    </main>
  );
}
