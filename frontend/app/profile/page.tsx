// frontend/app/profile/page.tsx
// User profile page

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const { userRole } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Supabase session
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClientComponentClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setProfile({
          name: session.user.user_metadata?.name || session.user.email || "",
          email: session.user.email || "",
          role: userRole || "USER",
          avatar_url: session.user.user_metadata?.avatar_url || undefined,
        });
        setAvatarPreview(session.user.user_metadata?.avatar_url || null);
      }
    };
    fetchProfile();
  }, [userRole]);

  // Handle avatar file selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload (Supabase Storage or placeholder)
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Placeholder: In production, upload to Supabase Storage and update user profile
      // For now, just simulate success
      setTimeout(() => {
        setSuccess("Avatar updated (placeholder, not actually uploaded)");
        setSaving(false);
      }, 1000);
    } catch {
      setError("Failed to upload avatar.");
      setSaving(false);
    }
  };

  if (!profile) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-center">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-2">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarImage
                src={avatarPreview || undefined}
                alt={profile.name}
              />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <label className="block text-sm font-medium mt-2">
              Change Avatar
            </label>
            <Input type="file" accept="image/*" onChange={handleAvatarChange} />
            {avatarFile && (
              <Button size="sm" onClick={handleAvatarUpload} disabled={saving}>
                {saving ? "Uploading..." : "Upload Avatar"}
              </Button>
            )}
            {success && (
              <div className="text-green-600 text-sm mt-1">{success}</div>
            )}
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>
          {/* Profile Info */}
          <div className="w-full flex flex-col gap-2 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <Input value={profile.name} readOnly className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <Input value={profile.email} readOnly className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Role</label>
              <Input
                value={profile.role}
                readOnly
                className="bg-gray-100 font-bold uppercase"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
