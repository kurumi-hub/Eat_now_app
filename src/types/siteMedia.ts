export const SITE_MEDIA_SLOTS = [
  "home_hero",
  "auth_login",
  "auth_register",
] as const;

export type SiteMediaSlot = (typeof SITE_MEDIA_SLOTS)[number];

export type SiteMediaItem = {
  slot: SiteMediaSlot;
  label: string;
  description: string;
  recommendedSize: string;
  imageUrl: string;
  objectPath: string | null;
  altText: string;
  updatedAt: string | null;
  usesFallback: boolean;
};

export type SiteMediaMap = Record<SiteMediaSlot, SiteMediaItem>;

export const SITE_MEDIA_DEFINITIONS: Record<
  SiteMediaSlot,
  {
    label: string;
    description: string;
    recommendedSize: string;
    fallbackUrl: string;
    fallbackAlt: string;
  }
> = {
  home_hero: {
    label: "Hero trang chủ",
    description: "Ảnh lớn ở section đầu tiên của trang chủ.",
    recommendedSize: "1600 × 760 px",
    fallbackUrl: "/images/home/hero.png",
    fallbackAlt: "Mâm món Việt nổi bật tại EatNow",
  },
  auth_login: {
    label: "Ảnh đăng nhập",
    description: "Dùng cho đăng nhập, quên mật khẩu và đặt lại mật khẩu.",
    recommendedSize: "1080 × 1350 px",
    fallbackUrl: "/images/auth/login-food.png",
    fallbackAlt: "Món ăn Việt Nam tại EatNow",
  },
  auth_register: {
    label: "Ảnh đăng ký",
    description: "Dùng cho đăng ký, OTP và màn hình kiểm tra email.",
    recommendedSize: "1080 × 1350 px",
    fallbackUrl: "/images/auth/register-food.png",
    fallbackAlt: "Ẩm thực Việt Nam tại EatNow",
  },
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseSiteMedia(value: unknown): SiteMediaMap {
  const source = isRecord(value) ? value : {};

  return Object.fromEntries(
    SITE_MEDIA_SLOTS.map((slot) => {
      const definition = SITE_MEDIA_DEFINITIONS[slot];
      const raw: UnknownRecord = isRecord(source[slot]) ? source[slot] : {};
      const imageUrl = optionalText(raw.image_url);
      const altText = optionalText(raw.alt_text);

      return [
        slot,
        {
          slot,
          label: definition.label,
          description: definition.description,
          recommendedSize: definition.recommendedSize,
          imageUrl: imageUrl ?? definition.fallbackUrl,
          objectPath: optionalText(raw.object_path),
          altText: altText ?? definition.fallbackAlt,
          updatedAt: optionalText(raw.updated_at),
          usesFallback: !imageUrl,
        },
      ];
    })
  ) as SiteMediaMap;
}
