"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";

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
  const statusToneClass = selectedStatus === "open"
    ? "owner-live-pill--open"
    : "owner-live-pill--paused";

  const handleSelect = (status: StoreStatus) => {
    setSelectedStatus(status);
    setIsMenuOpen(false);
  };

  return (
    <div className="owner-live-control">
      <button
        className={`owner-live-pill ${statusToneClass}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span className="owner-live-pill__light" aria-hidden="true" />
        <span>{currentStatus.label}</span>
        <KeyboardArrowDownIcon fontSize="small" />
      </button>

      {isMenuOpen ? (
        <div className="owner-live-menu" role="menu">
          {statusOptions.map((option) => (
            <button
              key={option.id}
              className={option.id === selectedStatus ? "is-selected" : ""}
              type="button"
              role="menuitemradio"
              aria-checked={option.id === selectedStatus}
              onClick={() => handleSelect(option.id)}
            >
              <span className={`owner-live-menu__light owner-live-menu__light--${option.id}`} />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
