import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Firebase Auth's Google sign-in popup navigates to Google's domain,
          // which sets COOP: same-origin. That breaks the browsing context group
          // between the opener and popup, preventing window.close() from working.
          // "same-origin-allow-popups" is not enough — we must use "unsafe-none"
          // so the popup can freely communicate with and close itself.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
