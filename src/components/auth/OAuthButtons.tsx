"use client";

import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/components/icons/BrandIcons";

export type OAuthProvider = "Google" | "Apple" | "Facebook";

type OAuthButtonsProps = {
  providers: OAuthProvider[];
  onPlaceholder: (provider: OAuthProvider) => void;
};

const providerIcons: Record<OAuthProvider, ReactNode> = {
  Google: <GoogleIcon className="h-4 w-4" />,
  Apple: <AppleIcon className="h-4 w-4" />,
  Facebook: <FacebookIcon className="h-4 w-4" />,
};

export default function OAuthButtons({
  providers,
  onPlaceholder,
}: OAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {providers.map((provider) => (
        <Button
          key={provider}
          fullWidth
          type="button"
          variant="outlined"
          startIcon={providerIcons[provider]}
          onClick={() => onPlaceholder(provider)}
        >
          {provider}
        </Button>
      ))}
    </div>
  );
}
