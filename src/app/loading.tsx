"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-8 text-xl font-medium text-orange-500">
          Please wait while we
          <br />
          get our ducks in a row.
        </h2>

        <div className="mx-auto h-10 w-32 overflow-hidden relative">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0px 0px", "80px 0px"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: "200%",
              height: "100%",
              background: `url("data:image/svg+xml,%3Csvg width='80' height='40' viewBox='0 0 80 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,20 Q20,8 40,20 T80,20' stroke='orange' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
