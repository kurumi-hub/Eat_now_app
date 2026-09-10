import { Box, Typography } from "@mui/material";
import Image from "next/image";

import BrandLogo from "@/components/common/BrandLogo";
import {
  brandContentClassName,
  brandImageClassName,
  brandOverlayClassName,
  brandPanelClassName,
  brandSubtitleClassName,
  brandTaglineClassName,
  mobileBrandClassName,
  wordmarkClassName,
} from "./tailwindClasses";

type AuthBrandPanelProps = {
  imageSrc: string;
  tagline: string;
  subtitle?: string;
  compact?: boolean;
};

export default function AuthBrandPanel({
  imageSrc,
  tagline,
  subtitle,
  compact = false,
}: AuthBrandPanelProps) {
  if (compact) {
    return (
      <Box className={mobileBrandClassName}>
        <Box className={wordmarkClassName} aria-label="EatNow">
          <BrandLogo
            alt=""
            className="h-full w-full object-contain"
            priority
            sizes="92px"
            variant="full"
          />
        </Box>
        <Typography
          component="p"
          className="m-0 mt-2 text-[var(--eatnow-text-secondary)]"
        >
          {tagline}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={brandPanelClassName}>
      <Image
        className={brandImageClassName}
        src={imageSrc}
        alt="Món ăn Việt Nam tại EatNow"
        fill
        priority
        sizes="(max-width: 720px) 0px, 540px"
      />
      <Box className={brandOverlayClassName} aria-hidden="true" />
      <Box className={brandContentClassName}>
        <Box className={wordmarkClassName} aria-label="EatNow">
          <BrandLogo
            alt=""
            className="h-full w-full object-contain"
            priority
            sizes="150px"
            variant="full"
          />
        </Box>
        <Typography component="p" className={brandTaglineClassName}>
          {tagline}
        </Typography>
        {subtitle ? (
          <Typography component="p" className={brandSubtitleClassName}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
