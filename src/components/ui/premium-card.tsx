"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, children, hoverEffect = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        whileHover={hoverEffect ? { 
          y: -4, 
          shadow: "var(--shadow-premium-lg)", 
          borderColor: "rgba(0,0,0,0.08)" 
        } : {}}
        className={cn(
          "bg-white dark:bg-neutral-950 border border-neutral-100/80 dark:border-neutral-900 rounded-[1.25rem] p-5 shadow-premium-sm transition-all duration-300 ease-apple-ease",
          hoverEffect && "hover:shadow-premium-md",
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";