"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NextResponse } from "next/server";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Blog = {
  _id: string;
  tittle: string;
  content: string;
  category: string;
  likesCount: number;
  commentCount: number;
  name: string;
  likes: number;
  isLike: boolean;
  image: string;
  userId?: string;
};

export default function DashBoard() {
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(true);
  const [blog, setBlog] = useState<Blog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const router = useRouter();

  useEffect(() => {
    const getBlog = async () => {
      try {
        const res = await fetch("/api/blog", {
          cache: "no-store",
          method: "GET",
        });
        if (!res.ok) throw new Error("blog is not fetch");
        const data = await res.json();

        console.log("Fetched blogs:", data.blog);
        setBlog(data.blog);
      } catch (error) {
        return NextResponse.json({ message: "error" }, { status: 400 });
      }
    };
    getBlog();
  }, []);

  const handleLike = async (blogId: string, isCurrentlyLike: boolean) => {
    try {
      const res = await fetch(`/api/like/${blogId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      console.log("Like response:", data);
      if (!res.ok)
        return NextResponse.json(
          { message: "server error" },
          { status: 400 }
        );

      setBlog((prev) =>
        prev.map((blogItem) =>
          blogItem._id === blogId
            ? {
                ...blogItem,
                likesCount: data.likesCount,
                isLike: !isCurrentlyLike,
              }
            : blogItem
        )
      );
    } catch (error) {
      console.error("Error like blog", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);


  const filterBlog =
    selectedCategory === "All"
      ? blog
      : blog.filter((b) => b.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white">
      <div className="max-w-5xl mx-auto mt-16 px-6">
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

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {["All", "technology", "travel", "LifeStyle"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="rounded-full px-6 py-2"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

      
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filterBlog.map((b, index) => (
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
               
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-semibold leading-tight group-hover:text-blue-600 transition">
                      {b.name}
                    </h3>
                  </div>

             
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-semibold leading-tight group-hover:text-blue-600 transition">
                      {b.tittle}
                    </h3>
                  </div>

       
                  <div
                    className="text-sm text-zinc-700 dark:text-zinc-300 prose dark:prose-invert max-w-none line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: b.content }}
                  />

         
                  <div className="mt-2 text-xs text-white bg-blue-600 dark:bg-blue-500 rounded-full px-3 py-1 self-start font-medium w-fit">
                    {b.category}
                  </div>

                  <hr className="my-2 border-zinc-200 dark:border-zinc-700" />


                  <div className="flex justify-between items-center">
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
                      {b.likesCount ?? 0}
                    </Button>

                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/pages/comment/${b._id}`);
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Comment {b.commentCount ?? 0}
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
