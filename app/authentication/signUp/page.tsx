"use client";
import React, { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [pending, setPending] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simple email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null); // Clear previous errors
    setPending(true);

    try {
      const res = await fetch("/api/auth/signUp", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setPending(false);
        toast.success(`Thanks for signing up, ${form.email}!`);
        router.push("/pages/OTP");
      } else {
        setPending(false);
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      setPending(false);
      setError("Something went wrong. Please try again.");
    }
  };


  const handleSocialClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    value: "google" | "github"
  ) => {
    e.preventDefault();
    signIn(value, { callbackUrl: "/pages/dashBoard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-200 px-4">
      <Card className="w-full max-w-md shadow-xl border-none bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">
            Create Your Account
          </CardTitle>
        </CardHeader>

        {!!error && (
          <div className="mb-4 text-red-700 text-sm flex items-start gap-2 bg-red-100 border border-red-300 px-4 py-2 rounded-lg shadow-sm">
            <span className="text-lg">
              <RiAlertFill />
            </span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Social Buttons */}
            <div className="flex justify-between gap-4">
              <Button
                onClick={(e) => handleSocialClick(e, "google")}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 hover:text-red-500 shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200"
                variant="outline"
              >
                <FaGoogle className="text-red-500" />
                Google
              </Button>
              <Button
                onClick={(e) => handleSocialClick(e, "github")}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 shadow-sm hover:shadow-md transition-all hover:scale-105 duration-200"
                variant="outline"
              >
                <FaGithub className="text-gray-700" />
                GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="relative text-center my-6">
              <span className="bg-white px-2 text-gray-500 text-sm z-10 relative">
                or sign up with email
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={form.name}
                disabled={pending}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={form.email}
                disabled={pending}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl"
              />
              <Input
                type="password"
                placeholder="Create Password"
                value={form.password}
                disabled={pending}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-xl"
              />

              {/* Submit */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-transform hover:scale-105 duration-100"
                disabled={pending}
                type="submit"
              >
                Sign Up
              </Button>

              {/* Sign In Link */}
              <Button
                type="button"
                variant="link"
                className="text-blue-600 hover:text-blue-800 text-sm hover:underline-offset-4"
                disabled={pending}
              >
                <Link href="/authentication/signIn">
                  Already have an account?
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
