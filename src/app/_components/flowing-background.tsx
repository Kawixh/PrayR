"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AdvancedFlowingBackground() {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Set initial window size
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }

    const handleMouseMove = (e) => {
      if (typeof window !== "undefined") {
        setMousePosition({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        });
      }
    };

    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const darkColors = {
    primary: "rgba(147, 51, 234, 0.4)", // purple-600
    secondary: "rgba(59, 130, 246, 0.4)", // blue-500
    tertiary: "rgba(168, 85, 247, 0.4)", // purple-500
  };

  const lightColors = {
    primary: "rgba(252, 231, 243, 0.6)", // pink-100
    secondary: "rgba(219, 234, 254, 0.6)", // blue-100
    tertiary: "rgba(237, 233, 254, 0.6)", // purple-100
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div
        className={`
          absolute inset-0 transition-all duration-1000
          ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"
              : "bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50"
          }
        `}
      />

      {/* Animated blobs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${
              Object.values(colors)[i % 3]
            } 0%, transparent 70%)`,
            width: Math.random() * 300 + 150,
            height: Math.random() * 300 + 150,
          }}
          animate={{
            x: [
              Math.random() * windowSize.width,
              Math.random() * windowSize.width,
              Math.random() * windowSize.width,
            ],
            y: [
              Math.random() * windowSize.height,
              Math.random() * windowSize.height,
              Math.random() * windowSize.height,
            ],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Interactive blob that follows mouse */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          width: 300,
          height: 300,
        }}
        animate={{
          x: mousePosition.x * windowSize.width - 150,
          y: mousePosition.y * windowSize.height - 150,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 100,
        }}
      />
    </div>
  );
}
