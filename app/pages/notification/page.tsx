"use client";

import { JSX, useEffect, useState } from "react";
import { Bell, BookmarkCheck, Heart, MessageCircle, PlusSquare, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type User = { name: string };
type Blog = { title?: string; content?: string };

type NotificationType = "like" | "comment" | "new_post" | "subscribe" | "save";

type NotificationProps = {
  _id: string;
  type: NotificationType;
  createdAt: string;
  user?: User[];
  blog?: Blog;
  commentText?: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notification");
      const data = await res.json();
      if (res.ok) {
        // Avoid duplicates by using _id
        setNotifications(prev => {
          const ids = new Set(prev.map(n => n._id));
          const newNotifications = data.notifications.filter((n: NotificationProps) => !ids.has(n._id));
          return [...prev, ...newNotifications];
        });
      } else {
        console.error("Failed to fetch notifications:", data.error);
      }
    } catch (error) {
      console.error("Fetching notifications failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Map type to icon
  const getIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, JSX.Element> = {
      like: <Heart className="text-pink-500" />,
      comment: <MessageCircle className="text-blue-500" />,
      new_post: <PlusSquare className="text-green-500" />,
      subscribe: <UserPlus className="text-purple-500" />,
      save: <BookmarkCheck className="text-purple-500" />,
    };
    return icons[type] || <Bell className="text-yellow-500" />;
  };

  // Map type to text
  const getMessage = (note: NotificationProps) => {
    const senderName = note.user?.[0]?.name || "Someone";
    switch (note.type) {
      case "like":
        return `${senderName} liked your post "${note.blog?.title || ""}"`;
      case "comment":
        return `${senderName} commented on "${note.blog?.title || ""}"`;
      case "new_post":
        return `${senderName} posted something new`;
      case "subscribe":
        return `${senderName} subscribed to you`;
      case "save":
        return `${senderName} saved your post "${note.blog?.title || ""}"`;
      default:
        return `${senderName} sent a notification`;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Bell className="text-yellow-500" /> Notifications
          {notifications.length > 0 && (
            <span className="ml-2 bg-yellow-500 text-white text-sm font-medium px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </h1>

        {loading ? (
          <p className="text-center text-zinc-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-zinc-500">No new notifications right now.</p>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-700">
            <AnimatePresence>
              {notifications.map((note, index) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-5 space-y-2 flex items-start gap-4">
                      <div className="flex-shrink-0">{getIcon(note.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="text-lg font-semibold">{getMessage(note)}</div>
                        {note.type === "comment" && note.commentText && (
                          <p className="text-zinc-600 dark:text-zinc-300 italic">"{note.commentText}"</p>
                        )}
                        <div className="text-sm text-zinc-400">{new Date(note.createdAt).toLocaleString()}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
