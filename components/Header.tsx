"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Bell, Heart, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✅ Define a type for notifications
interface Notification {
  _id: string;
  read: boolean;
}

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  const avatarFallback = session?.user?.name?.charAt(0).toUpperCase();

  // Fetch notifications count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch("/api/notification");
        const data = await res.json();

        if (res.status === 200 && Array.isArray(data.notifications)) {
          // ✅ No `any` now, use Notification type
          const unread = (data.notifications as Notification[]).filter(
            (n) => !n.read
          ).length;
          setNotificationCount(unread);
        } else {
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (session) {
      fetchNotificationCount();
    }
  }, [session]);

  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-zinc-900">
      <Link
        href="/pages/dashBoard"
        className="text-2xl font-bold text-zinc-900 dark:text-white"
      >
        MyBlog
      </Link>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/pages/wishlist")}
        >
          <Heart className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/pages/createBlog")}
        >
          <Plus className="w-5 h-5" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/pages/myblog")}
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {notificationCount}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await fetch("/api/notification", { method: "PUT" });
                setNotificationCount(0); // clear badge permanently
                router.push("/pages/notification");
              } catch (error) {
                console.error("Failed to mark notifications as read", error);
              }
            }}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {session ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 gap-2">
                <span>{session.user?.name}</span>
                <Avatar>
                  <AvatarImage
                    src={session.user?.image || undefined}
                    alt="User avatar"
                  />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/pages/dashBoard" className="w-full">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pages/setting" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button className="w-full text-left" onClick={handleSignOut}>
                  Log out
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button
                  className="w-full text-left"
                  onClick={() => router.push("/authentication/signUp")}
                >
                  Sign up
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            onClick={() => router.push("/authentication/signIn")}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
