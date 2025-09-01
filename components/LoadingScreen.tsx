"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black z-[9999]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror" }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Loading CureNet Blog...
        </p>
      </motion.div>
    </div>
  );
}
