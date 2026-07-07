import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardContent className="pt-8">
          <p className="font-display text-3xl italic text-[--color-ink]">Set a new password</p>

          {!token ? (
            <p className="mt-4 text-sm text-red-700">
              This link is missing its reset token. Request a new one from the
              <Link to="/forgot-password" className="ml-1 font-medium text-[--color-ink]">forgot password</Link> page.
            </p>
          ) : done ? (
            <p className="mt-4 text-sm text-[--color-ink-soft]">Password updated. Redirecting to log in…</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
