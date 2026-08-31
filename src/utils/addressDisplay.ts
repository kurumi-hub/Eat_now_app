import type { AccountAddress } from "@/types/account";

export const DEFAULT_DELIVERY_LOCATION_LABEL = "Ninh Kiều, Cần Thơ";

function cleanAddressPart(value?: string | null) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function comparable(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isSameAddressPart(left: string, right: string) {
  const normalizedLeft = comparable(left);
  const normalizedRight = comparable(right);

  return Boolean(normalizedLeft && normalizedLeft === normalizedRight);
}

function lineContainsPart(line: string, part: string) {
  const normalizedLine = comparable(line);
  const normalizedPart = comparable(part);

  return Boolean(
    normalizedLine &&
      normalizedPart &&
      normalizedLine.includes(normalizedPart)
  );
}

function uniqueParts(parts: string[]) {
  return parts.reduce<string[]>((result, part) => {
    const cleanedPart = cleanAddressPart(part);

    if (!cleanedPart) return result;
    if (
      result.some((existingPart) =>
        isSameAddressPart(existingPart, cleanedPart)
      )
    ) {
      return result;
    }

    return [...result, cleanedPart];
  }, []);
}

export function getDefaultAddress(addresses: AccountAddress[]) {
  return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}

export function getAddressLineLabel(address: AccountAddress) {
  const line = cleanAddressPart(address.line1);
  const extraParts = uniqueParts([address.ward, address.district, address.city])
    .filter((part) => !lineContainsPart(line, part));

  return uniqueParts([line, ...extraParts]).join(", ");
}

export function getAddressLocationLabel(
  address: AccountAddress | null | undefined,
  fallback = DEFAULT_DELIVERY_LOCATION_LABEL
) {
  if (!address) return fallback;

  const ward = cleanAddressPart(address.ward);
  const district = cleanAddressPart(address.district);
  const city = cleanAddressPart(address.city);

  if (district && city && !isSameAddressPart(district, city)) {
    return [district, city].join(", ");
  }

  if (ward && city && !isSameAddressPart(ward, city)) {
    return [ward, city].join(", ");
  }

  if (city) return city;
  if (district) return district;
  if (ward) return ward;

  const fallbackParts = cleanAddressPart(address.line1)
    .split(",")
    .map(cleanAddressPart)
    .filter((part) => part && !/^việt nam$/i.test(part));

  return fallbackParts.slice(-2).join(", ") || fallback;
}

export function getDeliveryLocationLabel(
  addresses: AccountAddress[],
  fallback = DEFAULT_DELIVERY_LOCATION_LABEL
) {
  return getAddressLocationLabel(getDefaultAddress(addresses), fallback);
}
