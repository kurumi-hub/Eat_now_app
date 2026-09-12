import Image from "next/image";

type BrandLogoVariant = "full" | "horizontal" | "mark" | "icon";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  variant?: BrandLogoVariant;
};

const logoAssets: Record<
  BrandLogoVariant,
  { src: string; width: number; height: number }
> = {
  full: {
    src: "/images/brand/eatnow-logo.png",
    width: 508,
    height: 633,
  },
  horizontal: {
    src: "/images/brand/eatnow-logo-horizontal.png",
    width: 442,
    height: 192,
  },
  mark: {
    src: "/images/brand/eatnow-logo-mark.png",
    width: 312,
    height: 412,
  },
  icon: {
    src: "/images/brand/eatnow-icon.png",
    width: 512,
    height: 512,
  },
};

export default function BrandLogo({
  alt = "EatNow",
  className,
  priority = false,
  sizes,
  variant = "full",
}: BrandLogoProps) {
  const asset = logoAssets[variant];

  return (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
