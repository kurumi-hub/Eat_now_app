import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

type AuthBrandPanelProps = {
  imageSrc: string;
  imageAlt: string;
  tagline: string;
  subtitle?: string;
  compact?: boolean;
};

export default function AuthBrandPanel({
  imageSrc,
  imageAlt,
  tagline,
  subtitle,
  compact = false,
}: AuthBrandPanelProps) {
  if (compact) {
    return (
      <Box className="auth-mobile-brand">
        <Box className="auth-wordmark" aria-label="EatNow">
          <RestaurantMenuOutlinedIcon fontSize="small" />
          <span>EatNow</span>
        </Box>
        <Typography component="p" color="text.secondary">
          {tagline}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="auth-brand-panel">
      <Image
        className="auth-brand-image"
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        unoptimized
        sizes="(max-width: 720px) 0px, 540px"
      />
      <Box className="auth-brand-overlay" aria-hidden="true" />
      <Box className="auth-brand-content">
        <Box className="auth-wordmark auth-wordmark--light" aria-label="EatNow">
          <RestaurantMenuOutlinedIcon />
          <span>EatNow</span>
        </Box>
        <Typography component="p" className="auth-brand-tagline">
          {tagline}
        </Typography>
        {subtitle ? (
          <Typography component="p" className="auth-brand-subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
