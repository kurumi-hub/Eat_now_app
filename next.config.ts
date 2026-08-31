import type { NextConfig } from "next";

function getSupabaseImageHostname() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) return "sdnulpfcmajmvoiqrwff.supabase.co";

  try {
    return new URL(value).hostname;
  } catch {
    return "sdnulpfcmajmvoiqrwff.supabase.co";
  }
}

const supabaseImageHostname = getSupabaseImageHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseImageHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
