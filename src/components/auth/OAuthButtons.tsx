"use client";

import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import { Button, Stack } from "@mui/material";
import type { ReactNode } from "react";

export type OAuthProvider = "Google" | "Apple" | "Facebook";

type OAuthButtonsProps = {
  providers: OAuthProvider[];
  onPlaceholder: (provider: OAuthProvider) => void;
};

const providerIcons: Record<OAuthProvider, ReactNode> = {
  Google: <GoogleIcon fontSize="small" />,
  Apple: <AppleIcon fontSize="small" />,
  Facebook: <FacebookIcon fontSize="small" />,
};

export default function OAuthButtons({
  providers,
  onPlaceholder,
}: OAuthButtonsProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
    </Stack>
  );
}
