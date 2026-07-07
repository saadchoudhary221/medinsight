import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardContent className="pt-8">
          <p className="font-display text-3xl italic text-[--color-ink]">Reset your password</p>
          {sent ? (
            <p className="mt-4 text-sm text-[--color-ink-soft]">
              If that email is registered, a reset link is on its way. Check your inbox.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-[--color-ink-soft]">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-[--color-ink-soft]">
            <Link to="/login" className="font-medium text-[--color-ink]">Back to log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
