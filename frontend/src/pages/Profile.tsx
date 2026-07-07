import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/profile", { fullName, avatarUrl });
      await refreshUser();
      showToast("Profile updated.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/profile", { currentPassword, newPassword });
      showToast("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't change password.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[--color-ink] font-display text-2xl italic text-[--color-paper]">
              {user?.full_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-display text-xl italic text-[--color-ink]">{user?.full_name}</p>
              <p className="text-sm text-[--color-ink-soft]">Member since {user && formatDate(user.created_at)}</p>
            </div>
          </div>

          <form onSubmit={onSaveProfile} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
            </div>
            <Button type="submit" disabled={saving}>Save changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="font-display text-xl italic text-[--color-ink]">Change password</p>
          <form onSubmit={onChangePassword} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving} variant="outline">Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
