"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

interface BlogPost {
  _id: string;
  tittle: string;
  excerpt: string;
  image: string;
  date: string;
  name: string;
  userId: string;
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/myblog?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setPosts(data.blogs || []))
        .catch((err) => console.error("Failed to fetch blogs:", err));
    }
  }, [session?.user?.id]);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">
          Please sign in to view your blog posts.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white p-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          My Blog Posts
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-300 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Welcome <span className="font-semibold">{session.user.name}</span>, here are your blogs ✍️
        </motion.p>
      </div>

      {/* Blog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post, idx) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
            >
             
                <Card className="shadow-lg rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-2xl transition duration-300"
                onClick={() => router.push(`/pages/blog/${post._id}`)}>
                  <div className="relative w-full h-64">
                       <img src={post.image} alt={post.tittle} className="object-cover w-full h-full" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500">{post.date}</p>
                    <h2 className="text-xl font-bold mt-2">{post.tittle}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <p className="text-sm text-blue-600 mt-4 font-medium">
                      By {post.name}
                    </p>
                  </CardContent>
                </Card>

            </motion.div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-300 col-span-full text-center">
            No blog posts yet. Start writing your first one!
          </p>
        )}
      </div>
    </main>
  );
}
