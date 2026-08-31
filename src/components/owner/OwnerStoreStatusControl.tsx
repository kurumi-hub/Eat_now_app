"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";

import * as ownerStyles from "@/components/owner/tailwindClasses";

type StoreStatus = "open" | "paused";

const statusOptions: Array<{
  id: StoreStatus;
  label: string;
  description: string;
}> = [
  {
    id: "open",
    label: "Đang mở cửa",
    description: "Nhận đơn bình thường",
  },
  {
    id: "paused",
    label: "Tạm đóng cửa",
    description: "Ẩn nhận đơn tạm thời",
  },
];

type OwnerStoreStatusControlProps = {
  initialStatus: string;
};

function getInitialStatus(initialStatus: string): StoreStatus {
  return initialStatus === "Tạm đóng cửa" ? "paused" : "open";
}

export default function OwnerStoreStatusControl({
  initialStatus,
}: OwnerStoreStatusControlProps) {
  const [selectedStatus, setSelectedStatus] = useState<StoreStatus>(() =>
    getInitialStatus(initialStatus)
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentStatus = statusOptions.find((option) => option.id === selectedStatus) ??
    statusOptions[0];

  const handleSelect = (status: StoreStatus) => {
    setSelectedStatus(status);
    setIsMenuOpen(false);
  };

  return (
    <div className={ownerStyles.liveControlClassName}>
      <button
        className={ownerStyles.livePillBaseClassName}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span className={ownerStyles.liveLightClassName(selectedStatus)} aria-hidden="true" />
        <span>{currentStatus.label}</span>
        <KeyboardArrowDownIcon fontSize="small" />
      </button>

      {isMenuOpen ? (
        <div className={ownerStyles.liveMenuClassName} role="menu">
          {statusOptions.map((option) => (
            <button
              key={option.id}
              className={ownerStyles.liveMenuItemClassName(option.id === selectedStatus)}
              type="button"
              role="menuitemradio"
              aria-checked={option.id === selectedStatus}
              onClick={() => handleSelect(option.id)}
            >
              <span className={ownerStyles.liveMenuLightClassName(option.id)} />
              <span>
                <strong className={ownerStyles.liveMenuTextTitleClassName}>
                  {option.label}
                </strong>
                <small className={ownerStyles.liveMenuTextDescriptionClassName}>
                  {option.description}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
