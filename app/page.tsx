"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white">

      <section className="max-w-5xl mx-auto py-28 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold mb-6"
        >
          Welcome to <span className="text-blue-600 dark:text-blue-400">My Blog</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mb-8"
        >
          Discover stories, tech guides, personal thoughts, and everything in between. Handcrafted with love and coffee ☕.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Link href="/pages/dashBoard">
            <Button size="lg" className="text-base gap-2">
              GO to  DashBoard
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>


      <section className="bg-white dark:bg-zinc-900 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Featured Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item * 0.2 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow hover:shadow-lg p-6 text-left transition"
              >
                <h3 className="text-xl font-semibold mb-2">Blog Post #{item}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-300">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut dolor sit amet massa tincidunt.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
