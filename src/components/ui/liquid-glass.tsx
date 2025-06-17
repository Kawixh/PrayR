"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
}

export default function LiquidGlass({
  children,
  className = "",
}: LiquidGlassProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* SVG Filter - only render once */}
      <svg className="hidden">
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <motion.div
        className={`liquid-glass-wrapper ${className}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{
          padding: "0.4rem",
        }}
        animate={{
          padding: isHovered ? "0.6rem" : "0.4rem",
        }}
        transition={{
          duration: 0.1,
          ease: "easeInOut",
        }}
      >
        {/* Glass Effect Layer */}
        <div className="liquid-glass-effect" />

        {/* Tint Layer */}
        <div className="liquid-glass-tint" />

        {/* Shine Layer */}
        <div className="liquid-glass-shine" />

        {/* Content Layer */}
        <div className="liquid-glass-text relative z-[3]">{children}</div>
      </motion.div>
    </>
  );
}
