import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable React strict mode for catching potential issues
  reactStrictMode: true,

  // Output standalone for Docker deployment
  output: "standalone",

  // Optimize production builds
  compiler: {
    // Remove console.log in production (keep errors/warnings)
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // Image optimization
  images: {
    // Enable modern formats
    formats: ["image/avif", "image/webp"],
    // Disable image optimization for external URLs (if needed, configure remotePatterns)
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimized package imports for common libraries
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-select",
    ],
  },

  // Production source maps (optional, disable for smaller builds)
  productionBrowserSourceMaps: false,

  // Enable gzip compression headers
  compress: true,
};

export default withNextIntl(nextConfig);
