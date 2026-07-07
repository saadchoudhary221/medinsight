import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, Skeleton } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  file_name: string;
  upload_date: string;
  status: string;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "processing", label: "Processing" },
] as const;

export default function Reports({ historyMode = false }: { historyMode?: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get<{ reports: Report[] }>("/reports"),
  });

  const reports = (data?.reports ?? [])
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => r.file_name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(id: string) {
    try {
      await api.delete(`/reports/${id}`);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      showToast("Report deleted.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't delete report.", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-ink-soft]" />
          <Input
            placeholder="Search reports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {!historyMode && (
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  filter === f.key
                    ? "border-[--color-ink] bg-[--color-ink] text-[--color-paper]"
                    : "border-[--color-hairline] text-[--color-ink-soft] hover:text-[--color-ink]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-8 w-8 text-[--color-ink-soft]" />
              <p className="mt-3 text-sm text-[--color-ink-soft]">
                {search ? "No reports match your search." : "No reports yet. Upload your first one to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[--color-hairline] text-[--color-ink-soft]">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Upload Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-[--color-hairline] last:border-0">
                      <td className="py-3 text-[--color-ink]">{r.file_name}</td>
                      <td className="py-3 text-[--color-ink-soft]">{formatDate(r.upload_date)}</td>
                      <td className="py-3"><StatusBadge status={r.status} /></td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-4">
                          <Link to={`/reports/${r.id}`} className="text-sm font-medium text-[--color-ink] hover:underline">
                            View
                          </Link>
                          <button onClick={() => handleDelete(r.id)} aria-label="Delete report">
                            <Trash2 className="h-4 w-4 text-[--color-ink-soft] hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
