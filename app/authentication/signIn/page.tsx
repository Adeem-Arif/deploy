"use client";

import React, { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function SignIn() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.ok) {
            setPending(false);
            toast.success(`Welcome back, ${email}!`);
            router.push("/");
        } else if (res?.error) {
            setPending(false);
            setError(res.error);
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
        <div className="drop-shadow-blue-800 min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-200 px-4">
            <Card className="w-full max-w-md shadow-xl border-none bg-white/70 backdrop-blur-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-blue-600">
                        Sign In
                    </CardTitle>
                </CardHeader>

                {!!error && (
                    <div className="mb-4 text-red-700 text-sm flex items-start gap-2 bg-red-100 border border-red-300 px-4 py-2 rounded-lg shadow-sm">
                        <span className="text-lg"><RiAlertFill /></span>
                        <span className="leading-snug">{error}</span>
                    </div>
                )}

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                disabled={pending}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-xl"
                            />
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                disabled={pending}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl"
                            />
                            <Button
                                className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-transform hover:scale-105 duration-100"
                                disabled={pending}
                                type="submit"
                            >
                                Sign In
                            </Button>

                            <div className="relative text-center my-4">
                                <span className="bg-white px-2 text-gray-500 text-sm z-10 relative">
                                    or sign in with
                                </span>
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                            </div>

                            <div className="flex justify-between gap-4">
                                <Button
                                    onClick={(e) => handleSocialClick(e, "google")}
                                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-red-500 shadow-sm hover:shadow-md transition-all hover:scale-105 ease-in-out duration-200"
                                    variant="outline"
                                >
                                    <FaGoogle className="text-red-500" />
                                    Google
                                </Button>
                                <Button
                                    onClick={(e) => handleSocialClick(e, "github")}
                                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900 shadow-sm hover:shadow-md transition-all hover:scale-105 ease-in-out duration-200"
                                    variant="outline"
                                >
                                    <FaGithub className="text-gray-700" />
                                    GitHub
                                </Button>
                            </div>
                        </div>

                        <CardFooter className="mt-4 justify-center text-sm text-blue-600 hover:underline cursor-pointer">
                            <Link href={"/authentication/signUp"}>
                                Don’t have an account? Sign up
                            </Link>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
