"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="flex min-h-[50svh] items-center justify-center">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center sm:p-8">
        <p className="soft-chip inline-flex">Loading</p>
        <h2 className="mt-3 font-display text-3xl">Fetching today&apos;s timings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Give us a moment while we align your prayer schedule.
        </p>

        <div className="mt-5 overflow-hidden rounded-full border border-border/70 bg-background/60 p-1">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            className="h-1.5 rounded-full bg-primary"
            transition={{
              duration: 1.4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
      </div>
    </div>
  );
}
