"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * OptimizedImage component with built-in:
 * - Next.js Image optimization (quality: 50%)
 * - Lazy loading
 * - Placeholder blurring
 * - Optional animation
 *
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {string} props.alt - Image alt text
 * @param {boolean} props.animate - Whether to animate the image on load
 * @param {string} props.className - Additional class names
 * @returns {JSX.Element} - Optimized image component
 */
export default function OptimizedImage({
  src,
  width,
  height,
  alt,
  animate = false,
  className = "",
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Default for placeholder blur
  const blurDataURL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJUm6WlAAAAABJRU5ErkJggg==";

  const imageContent = (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt || "Image"}
      quality={50}
      loading="lazy"
      className={`${className} ${
        isLoaded ? "opacity-100" : "opacity-0"
      } transition-opacity duration-500`}
      placeholder="blur"
      blurDataURL={blurDataURL}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );

  // Wrap in motion.div if animation is requested
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {imageContent}
      </motion.div>
    );
  }

  return imageContent;
}
