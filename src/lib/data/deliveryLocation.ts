import "server-only";

import type { PublicUser } from "@/types/auth";
import {
  DEFAULT_DELIVERY_LOCATION_LABEL,
  getDeliveryLocationLabel,
} from "@/utils/addressDisplay";
import { hasRole } from "@/utils/roles";
import { getCurrentUserAddresses } from "./addresses";

export async function getCurrentDeliveryLocationLabel(
  user: PublicUser | null
) {
  if (!hasRole(user, "CUSTOMER")) {
    return DEFAULT_DELIVERY_LOCATION_LABEL;
  }

  const addresses = await getCurrentUserAddresses();

  return getDeliveryLocationLabel(addresses);
}
