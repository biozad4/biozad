"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, children, variant = "primary", size = "md", loading, ...props }, ref) => {
    
    const baseStyle = "relative inline-flex items-center justify-center font-medium overflow-hidden rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98]";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/95 shadow-premium-sm hover:shadow-premium-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-border bg-transparent text-foreground hover:bg-neutral-50/50 hover:border-neutral-400 dark:hover:bg-neutral-900/50",
      ghost: "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs tracking-wider",
      md: "px-6 py-3 text-sm tracking-wide",
      lg: "px-8 py-4 text-base tracking-wide",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyle, variants[variant], sizes[size], className)}
        disabled={loading}
        {...(props as any)}
      >
        {/* تأثير التوهج اللطيف للزر الرئيسي */}
        {variant === "primary" && (
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        )}
        
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-xs">...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";