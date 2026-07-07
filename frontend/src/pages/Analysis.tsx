import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, Skeleton } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { formatDate, cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Finding { test: string; value: string; status: "normal" | "borderline" | "attention" }
interface AnalysisData {
  summary: string;
  findings: Finding[];
  explanations: string;
  recommendations: string[];
  recommendation_status: "normal" | "borderline" | "attention";
}
interface ReportData {
  report: { id: string; file_name: string; upload_date: string; status: string };
  analysis: AnalysisData | null;
}

const RECOMMENDATION_COPY: Record<string, { icon: typeof CheckCircle2; text: string; tone: string }> = {
  normal: {
    icon: CheckCircle2,
    text: "Report appears within expected ranges.",
    tone: "text-[--color-status-normal] bg-[--color-status-normal-bg]",
  },
  borderline: {
    icon: AlertTriangle,
    text: "Some values may deserve additional attention.",
    tone: "text-[--color-status-borderline] bg-[--color-status-borderline-bg]",
  },
  attention: {
    icon: AlertTriangle,
    text: "Consider discussing these findings with a qualified healthcare professional.",
    tone: "text-[--color-status-attention] bg-[--color-status-attention-bg]",
  },
};

export default function Analysis() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => api.get<ReportData>(`/reports/${id}`),
    refetchInterval: (query) => (query.state.data?.report.status === "processing" ? 2500 : false),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) return null;
  const { report, analysis } = data;
  const isProcessing = report.status === "processing";
  const isFailed = report.status === "failed";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl italic text-[--color-ink]">{report.file_name}</p>
          <p className="mt-1 text-sm text-[--color-ink-soft]">Uploaded {formatDate(report.upload_date)}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {isFailed && (
        <Card className="border-[--color-status-attention]/30 bg-[--color-status-attention-bg] p-6">
          <p className="text-sm text-[--color-status-attention]">
            We couldn't process this report. Try re-uploading a clearer copy of the file.
          </p>
        </Card>
      )}

      {isProcessing && (
        <div className="space-y-4">
          <Card className="p-6"><Skeleton className="h-5 w-3/4" /><Skeleton className="mt-3 h-5 w-1/2" /></Card>
          <Card className="p-6"><Skeleton className="h-24 w-full" /></Card>
          <p className="text-sm text-[--color-ink-soft]">Your report is still processing — this page will update automatically.</p>
        </div>
      )}

      {analysis && !isProcessing && (
        <>
          <Card>
            <CardContent className="pt-6">
              <p className="font-display text-xl italic text-[--color-ink]">Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-[--color-ink-soft]">{analysis.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="font-display text-xl italic text-[--color-ink]">Important Findings</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[--color-hairline] text-[--color-ink-soft]">
                      <th className="pb-3 font-medium">Test</th>
                      <th className="pb-3 font-medium">Value</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.findings?.map((f, i) => (
                      <tr key={i} className="border-b border-[--color-hairline] last:border-0">
                        <td className="py-3 text-[--color-ink]">{f.test}</td>
                        <td className="py-3 text-[--color-ink-soft]">{f.value}</td>
                        <td className="py-3"><StatusBadge status={f.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="font-display text-xl italic text-[--color-ink]">Understanding Your Results</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[--color-ink-soft]">
                {analysis.explanations}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="font-display text-xl italic text-[--color-ink]">Wellness Suggestions</p>
              <ul className="mt-3 space-y-2 text-sm text-[--color-ink-soft]">
                {analysis.recommendations?.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </CardContent>
          </Card>

          {(() => {
            const rec = RECOMMENDATION_COPY[analysis.recommendation_status] ?? RECOMMENDATION_COPY.normal;
            const Icon = rec.icon;
            return (
              <div className={cn("flex items-center gap-3 rounded-2xl px-5 py-4", rec.tone)}>
                <Icon className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{rec.text}</p>
              </div>
            );
          })()}
        </>
      )}

      <DisclaimerBanner />
    </div>
  );
}
