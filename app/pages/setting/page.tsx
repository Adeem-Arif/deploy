"use client";

import { useState} from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProfileUpdatePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id; // ✅ comes from JWT/session
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      setMessage("User ID missing ❌");
      return;
    }
    if (!name || !password) {
      setMessage("Name and password are required");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("password", password);
    if (imageFile) {
      formData.append("profileImage", imageFile);
    }

    try {
      const res = await fetch(`/api/updateUser/${userId}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Profile updated successfully ✅");
      } else {
        setMessage(data.message || "Update failed ❌");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black p-6">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Update Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-zinc-500">No Image</span>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} className="w-fit" />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          {message && <p className="text-sm text-center">{message}</p>}

          {/* Save */}
          <div className="flex justify-end">
            <Button className="px-6" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
