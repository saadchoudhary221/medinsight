import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, CheckCircle2, CalendarClock, Upload as UploadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Skeleton } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

interface Report {
  id: string;
  file_name: string;
  upload_date: string;
  status: string;
}
interface Stats {
  total_reports: number;
  completed_analyses: number;
  uploads_this_month: number;
}

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get<{ stats: Stats }>("/reports/stats"),
  });
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get<{ reports: Report[] }>("/reports"),
  });

  const stats = statsData?.stats;
  const recent = (reportsData?.reports ?? []).slice(0, 5);

  const cards = [
    { label: "Total Reports", value: stats?.total_reports, icon: FileText },
    { label: "Completed Analyses", value: stats?.completed_analyses, icon: CheckCircle2 },
    { label: "Uploads This Month", value: stats?.uploads_this_month, icon: CalendarClock },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-6">
            <Icon className="h-5 w-5 text-[--color-ink-soft]" />
            <p className="mt-4 text-3xl font-semibold text-[--color-ink]">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : value}
            </p>
            <p className="mt-1 text-sm text-[--color-ink-soft]">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-xl italic text-[--color-ink]">Upload a new report</p>
          <p className="mt-1 text-sm text-[--color-ink-soft]">Get a plain-language breakdown in seconds.</p>
        </div>
        <Link to="/upload">
          <Button>
            <UploadIcon className="h-4 w-4" />
            Upload New Report
          </Button>
        </Link>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="font-display text-xl italic text-[--color-ink]">Recent Reports</p>
          <div className="mt-4 overflow-x-auto">
            {reportsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-[--color-ink-soft]">No reports yet. Upload your first one to get started.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[--color-hairline] text-[--color-ink-soft]">
                    <th className="pb-3 font-medium">Report Name</th>
                    <th className="pb-3 font-medium">Upload Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-b border-[--color-hairline] last:border-0">
                      <td className="py-3 text-[--color-ink]">{r.file_name}</td>
                      <td className="py-3 text-[--color-ink-soft]">{formatDate(r.upload_date)}</td>
                      <td className="py-3"><StatusBadge status={r.status} /></td>
                      <td className="py-3 text-right">
                        <Link to={`/reports/${r.id}`} className="text-sm font-medium text-[--color-ink] hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
