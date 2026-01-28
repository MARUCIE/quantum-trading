"use client";

/**
 * Optimized Image Component
 *
 * Wrapper around next/image with:
 * - Blur placeholder for better LCP
 * - Lazy loading by default
 * - Proper sizing hints
 */

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /** Show shimmer while loading */
  showShimmer?: boolean;
  /** Aspect ratio for container (e.g., "16/9", "1/1") */
  aspectRatio?: string;
  /** Fallback element when image fails to load */
  fallback?: React.ReactNode;
}

export function OptimizedImage({
  src,
  alt,
  className,
  showShimmer = true,
  aspectRatio,
  fallback,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatio && `aspect-[${aspectRatio}]`
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
        {...props}
      />
      {showShimmer && isLoading && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Avatar Image with fallback initials
 */
export interface AvatarImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: number;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  fallbackText,
  size = 40,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  // Get initials from alt text or fallbackText
  const initials =
    fallbackText ||
    alt
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        role="img"
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
