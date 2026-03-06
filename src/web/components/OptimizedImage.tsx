import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // If true, don't lazy load
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
}

/**
 * OptimizedImage component with:
 * - Lazy loading using Intersection Observer
 * - Blur-up placeholder effect
 * - Native loading="lazy" as fallback
 * - Fade-in animation on load
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Default blur placeholder (1x1 gray pixel)
  const defaultBlur = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
  const placeholderSrc = blurDataURL || defaultBlur;

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder === "blur" && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 transition-opacity duration-300"
          style={{ opacity: isLoaded ? 0 : 1 }}
        />
      )}
      
      {/* Main image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      
      {/* Loading skeleton when not in view */}
      {!isInView && placeholder === "empty" && (
        <div className="absolute inset-0 bg-bolao-card animate-pulse" />
      )}
    </div>
  );
}

/**
 * Preload critical images
 * Call this for above-the-fold images
 */
export function preloadImage(src: string) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseSrc: string, widths: number[]): string {
  const ext = baseSrc.split('.').pop();
  const base = baseSrc.replace(`.${ext}`, '');
  
  return widths
    .map((w) => `${base}-${w}w.${ext} ${w}w`)
    .join(", ");
}
