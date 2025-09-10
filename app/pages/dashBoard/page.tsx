"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Blog = {
  _id: string;
  tittle: string;           // ✅ fixed spelling (was tittle)
  content: string;
  category: string;
  likes: string[];      // (optional if you still keep array)
  likesCount: number;
  commentCount: number;
  author: string;          // ✅ renamed from name for clarity
  isLike: boolean;
  image?: string;
  userId?: string;
};

export default function DashBoard() {
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const router = useRouter();

  // ✅ Fetch blogs on mount
  useEffect(() => {
    const getBlogs = async () => {
      try {
        const res = await fetch("/api/blog", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch blogs");

        const data = await res.json();
        console.log("Fetched blogs:", data.blog);
        setBlogs(data.blog);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    getBlogs();
  }, []);

  // ✅ Like handler
  // ✅ Like handler
  const handleLike = async (blogId: string, isCurrentlyLiked: boolean) => {
    try {
      const res = await fetch(`/api/like/${blogId}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data);
        return;
      }

      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? {
              ...blog,
              isLike: data.isLike ?? !isCurrentlyLiked, // ✅ toggle or backend value
              likesCount: data.likesCount, // ✅ use count from backend
            }
            : blog
        )
      );
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };


  // ✅ Hide welcome after 5s
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Filter blogs by category
  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white">
      <div className="max-w-5xl mx-auto mt-16 px-6">
        {/* ✅ Welcome banner */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
              className="text-4xl font-bold text-center mb-8"
            >
              Welcome {session?.user?.name || "Guest"} 🎉
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Category filters */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {["All", "technology", "travel", "lifestyle"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="rounded-full px-6 py-2 capitalize"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* ✅ Blog grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((b, index) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Card
                onClick={() => router.push(`/pages/blog/${b._id}`)}
                className="cursor-pointer group bg-white dark:bg-zinc-900 
                           border border-zinc-200 dark:border-zinc-700 
                           shadow-lg hover:shadow-2xl 
                           transition-shadow duration-300 
                           rounded-2xl p-6 flex flex-col 
                           justify-between h-full"
              >
                <CardContent className="p-0 space-y-4 flex flex-col h-full justify-between">

                  {/* ✅ Author */}
                  <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                    {b.author}
                  </h3>

                  {/* ✅ Title */}
                  <h2 className="text-2xl font-semibold leading-tight group-hover:text-blue-600 transition">
                    {b.tittle}
                  </h2>

                  {/* ✅ Content snippet */}
                  <div
                    className="text-sm text-zinc-700 dark:text-zinc-300 prose dark:prose-invert max-w-none line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: b.content }}
                  />

                  {/* ✅ Category badge */}
                  <div className="mt-2 text-xs text-white bg-blue-600 dark:bg-blue-500 rounded-full px-3 py-1 self-start font-medium w-fit">
                    {b.category}
                  </div>

                  <hr className="my-2 border-zinc-200 dark:border-zinc-700" />

                  {/* ✅ Actions (likes + comments) */}
                  <div className="flex justify-between items-center">
                    {/* Like button */}
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(b._id, b.isLike);
                      }}
                    >
                      <Heart
                        className="w-4 h-4"
                        color={b.isLike ? "red" : "gray"}
                      />
                      {b.likesCount ?? 0} Likes {/* ✅ Correct, total like count */}
                    </Button>

                    {/* Comment button */}
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/pages/comment/${b._id}`);
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {b.commentCount ?? 0} Comments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
