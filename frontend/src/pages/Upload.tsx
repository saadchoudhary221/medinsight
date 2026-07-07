import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";

const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE = 10 * 1024 * 1024;

type Stage = "idle" | "uploading" | "processing" | "complete" | "error";

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function validate(f: File): string | null {
    if (!ALLOWED.includes(f.type)) return "Invalid file type. Please upload a PDF, PNG, or JPG.";
    if (f.size > MAX_SIZE) return "File is too large. Maximum size is 10 MB.";
    return null;
  }

  function handleFile(f: File) {
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  async function startUpload() {
    if (!file) return;
    setStage("uploading");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await api.upload<{ report: { id: string } }>("/reports/upload", formData);
      setStage("processing");
      // Poll until analysis completes, then route to the analysis page.
      const reportId = data.report.id;
      const poll = setInterval(async () => {
        const res = await api.get<{ report: { status: string } }>(`/reports/${reportId}`);
        if (res.report.status === "completed") {
          clearInterval(poll);
          setStage("complete");
          setTimeout(() => navigate(`/reports/${reportId}`), 600);
        } else if (res.report.status === "failed") {
          clearInterval(poll);
          setStage("error");
          setError("We couldn't process this report. Please try a clearer file.");
        }
      }, 2000);
    } catch (err) {
      setStage("error");
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
              dragActive ? "border-[--color-ink] bg-[--color-ink]/5" : "border-[--color-hairline]"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <UploadCloud className="h-10 w-10 text-[--color-ink-soft]" />
            <p className="mt-4 font-display text-xl italic text-[--color-ink]">
              Drag and drop your report here
            </p>
            <p className="mt-1 text-sm text-[--color-ink-soft]">or click to browse — PDF, PNG, or JPG, up to 10 MB</p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[--color-status-attention-bg] px-4 py-3 text-sm text-[--color-status-attention]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {file && !error && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-[--color-hairline] px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[--color-ink-soft]" />
                <div>
                  <p className="text-sm font-medium text-[--color-ink]">{file.name}</p>
                  <p className="text-xs text-[--color-ink-soft]">{formatBytes(file.size)}</p>
                </div>
              </div>
              {stage === "idle" && (
                <Button size="sm" onClick={startUpload}>Analyze report</Button>
              )}
            </div>
          )}

          {stage !== "idle" && (
            <div className="mt-6 space-y-3">
              {(["uploading", "processing", "complete"] as const).map((s, i) => {
                const order = ["uploading", "processing", "complete"];
                const currentIndex = order.indexOf(stage === "error" ? "processing" : stage);
                const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
                const labels = { uploading: "Uploading", processing: "Processing", complete: "Complete" };
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        state === "done" && "bg-[--color-status-normal]",
                        state === "active" && "bg-[--color-ink] animate-pulse",
                        state === "pending" && "bg-[--color-hairline]"
                      )}
                    />
                    <p className={cn("text-sm", state === "pending" ? "text-[--color-ink-soft]" : "text-[--color-ink]")}>
                      {labels[s]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardContent className="pt-6">
          <p className="font-display text-xl italic text-[--color-ink]">Tips</p>
          <ul className="mt-4 space-y-3 text-sm text-[--color-ink-soft]">
            <li>• Upload clear reports.</li>
            <li>• Recent reports work best.</li>
            <li>• Your files remain private.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
