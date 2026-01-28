"use client";

/**
 * Lazy Load Components
 *
 * Components for lazy loading content, images, and components
 * with intersection observer for performance optimization.
 */

import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  Suspense,
  lazy,
  type ComponentType,
} from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Intersection observer hook
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        // Once visible, stop observing
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return [ref, isIntersecting];
}

// Lazy load container
interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
  className?: string;
  minHeight?: string | number;
}

export function LazyLoad({
  children,
  fallback,
  rootMargin = "100px",
  threshold = 0,
  className,
  minHeight = 100,
}: LazyLoadProps) {
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin,
    threshold,
  });

  const heightStyle = typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <div
      ref={ref}
      className={cn("transition-opacity duration-300", className)}
      style={{ minHeight: isVisible ? undefined : heightStyle }}
    >
      {isVisible ? (
        children
      ) : (
        fallback || (
          <div
            className="flex items-center justify-center"
            style={{ minHeight: heightStyle }}
          >
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )
      )}
    </div>
  );
}

// Lazy load image with blur placeholder
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderClassName?: string;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderClassName,
  rootMargin = "100px",
  onLoad,
  onError,
}: LazyImageProps) {
  const [ref, isVisible] = useIntersectionObserver({ rootMargin });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            placeholderClassName
          )}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Failed to load
        </div>
      )}

      {/* Image */}
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
        />
      )}
    </div>
  );
}

// Dynamic import wrapper for code splitting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: P) {
    return (
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8">
              <Skeleton className="h-32 w-full" />
            </div>
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Virtualized list for large data sets
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
