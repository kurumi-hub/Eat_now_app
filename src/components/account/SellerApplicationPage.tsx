"use client";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  saveSellerApplicationAction,
  submitSellerApplicationAction,
  withdrawSellerApplicationAction,
  type SellerApplicationInput,
} from "@/app/account/seller/actions";
import type { PublicUser } from "@/types/auth";
import type {
  RestaurantApplication,
  RestaurantApplicationStatus,
  SellerContext,
} from "@/types/owner";
import { hasRole } from "@/utils/roles";

type SellerApplicationPageProps = {
  user: PublicUser;
  sellerContext: SellerContext;
};

type FeedbackState = {
  severity: "success" | "error";
  message: string;
};

type SellerFormValues = {
  restaurantName: string;
  description: string;
  address: string;
  phone: string;
  businessLicenseNumber: string;
  taxCode: string;
  legalRepresentativeName: string;
};

type SellerDisplayStatus = RestaurantApplicationStatus | "NOT_APPLIED";

const editableStatuses: SellerDisplayStatus[] = [
  "NOT_APPLIED",
  "DRAFT",
  "NEEDS_CHANGES",
  "REJECTED",
  "WITHDRAWN",
];

const submittableStatuses: SellerDisplayStatus[] = [
  "DRAFT",
  "NEEDS_CHANGES",
  "REJECTED",
  "WITHDRAWN",
];

const withdrawableStatuses: SellerDisplayStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
];

const statusCopy: Record<
  SellerDisplayStatus,
  { label: string; description: string; tone: "neutral" | "warning" | "success" | "error" }
> = {
  NOT_APPLIED: {
    label: "Chưa đăng ký",
    description: "Hoàn thiện hồ sơ nhà hàng để EatNow bắt đầu xét duyệt.",
    tone: "neutral",
  },
  DRAFT: {
    label: "Bản nháp",
    description: "Hồ sơ đã được lưu, bạn có thể nộp khi thông tin đã đầy đủ.",
    tone: "neutral",
  },
  SUBMITTED: {
    label: "Đã nộp",
    description: "EatNow đã nhận hồ sơ và sẽ chuyển sang bước xét duyệt.",
    tone: "warning",
  },
  UNDER_REVIEW: {
    label: "Đang xét duyệt",
    description: "Đội ngũ EatNow đang kiểm tra thông tin nhà hàng của bạn.",
    tone: "warning",
  },
  NEEDS_CHANGES: {
    label: "Cần bổ sung",
    description: "Cập nhật các thông tin được yêu cầu rồi nộp lại hồ sơ.",
    tone: "warning",
  },
  APPROVED: {
    label: "Đã duyệt",
    description: "Tài khoản người bán đã sẵn sàng để quản lý nhà hàng.",
    tone: "success",
  },
  REJECTED: {
    label: "Từ chối",
    description: "Bạn có thể chỉnh lại thông tin và gửi hồ sơ mới khi đã sẵn sàng.",
    tone: "error",
  },
  WITHDRAWN: {
    label: "Đã rút",
    description: "Hồ sơ đã được rút, bạn có thể chỉnh sửa và gửi lại.",
    tone: "neutral",
  },
};

function getInitialValues(
  application: RestaurantApplication | null,
  user: PublicUser
): SellerFormValues {
  return {
    restaurantName: application?.restaurantName ?? "",
    description: application?.description ?? "",
    address: application?.address ?? "",
    phone: application?.phone ?? user.phone ?? "",
    businessLicenseNumber: application?.businessLicenseNumber ?? "",
    taxCode: application?.taxCode ?? "",
    legalRepresentativeName:
      application?.legalRepresentativeName ?? user.fullName ?? "",
  };
}

function formatTimelineDate(value: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function SellerApplicationPage({
  user,
  sellerContext,
}: SellerApplicationPageProps) {
  const router = useRouter();
  const application = sellerContext.application;
  const restaurants = sellerContext.restaurants;
  const timeline = sellerContext.timeline;
  const status: SellerDisplayStatus = application?.status ?? "NOT_APPLIED";
  const statusMeta = statusCopy[status];
  const hasPortalAccess =
    hasRole(user, "RESTAURANT_OWNER") || restaurants.length > 0;
  const canEdit = editableStatuses.includes(status);
  const canSubmit = Boolean(application?.id) && submittableStatuses.includes(status);
  const canWithdraw =
    Boolean(application?.id) && withdrawableStatuses.includes(status);
  const [values, setValues] = useState<SellerFormValues>(() =>
    getInitialValues(application, user)
  );
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isPending, startTransition] = useTransition();
  const isBusy = isPending;

  const checklist = useMemo(
    () => [
      {
        label: "Thông tin nhà hàng",
        done: Boolean(values.restaurantName.trim() && values.address.trim()),
      },
      {
        label: "Liên hệ vận hành",
        done: Boolean(values.phone.trim()),
      },
      {
        label: "Thông tin pháp lý",
        done: Boolean(
          values.businessLicenseNumber.trim() ||
            values.taxCode.trim() ||
            values.legalRepresentativeName.trim()
        ),
      },
    ],
    [values]
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFeedback(null);
  };

  const toPayload = (): SellerApplicationInput => {
    return {
      applicationId: application?.id,
      restaurantName: values.restaurantName,
      description: values.description,
      address: values.address,
      phone: values.phone,
      businessLicenseNumber: values.businessLicenseNumber,
      taxCode: values.taxCode,
      legalRepresentativeName: values.legalRepresentativeName,
    };
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isBusy) return;

    const payload = toPayload();

    startTransition(async () => {
      const result = await saveSellerApplicationAction(payload);
      setFeedback({
        severity: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  };

  const handleSubmitApplication = () => {
    if (!application?.id || !canSubmit || isBusy) {
      setFeedback({
        severity: "error",
        message: "Hãy lưu hồ sơ trước khi nộp xét duyệt.",
      });
      return;
    }

    startTransition(async () => {
      const result = await submitSellerApplicationAction(application.id);
      setFeedback({
        severity: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  };

  const handleWithdraw = () => {
    if (!application?.id || !canWithdraw || isBusy) return;
    const note = window.prompt("Lý do rút hồ sơ (không bắt buộc)", "") ?? "";

    startTransition(async () => {
      const result = await withdrawSellerApplicationAction(application.id, note);
      setFeedback({
        severity: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  };

  return (
    <div className="seller-application-page">
      <section className="seller-hero-panel">
        <div className="seller-hero-panel__copy">
          <span className="seller-hero-panel__icon" aria-hidden="true">
            <StorefrontOutlinedIcon />
          </span>
          <p className="seller-hero-panel__eyebrow">Người bán EatNow</p>
          <Typography component="h2" variant="h2">
            Mở quán trên EatNow
          </Typography>
          <p>
            Cập nhật thông tin nhà hàng, gửi hồ sơ xét duyệt và vào kênh quản
            lý sau khi tài khoản được cấp quyền.
          </p>
        </div>

        <aside className="seller-status-card" aria-label="Trạng thái hồ sơ">
          <span className="seller-status-card__label">Trạng thái hồ sơ</span>
          <Chip
            className={`seller-status-chip seller-status-chip--${statusMeta.tone}`}
            label={statusMeta.label}
          />
          <p>{statusMeta.description}</p>
          {application?.reviewNote ? (
            <p className="seller-status-card__note">{application.reviewNote}</p>
          ) : null}
        </aside>
      </section>

      {feedback ? (
        <Alert
          className="seller-feedback"
          severity={feedback.severity}
          iconMapping={{
            success: <CheckCircleOutlineOutlinedIcon fontSize="inherit" />,
          }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      {hasPortalAccess ? (
        <section className="seller-portal-card">
          <div>
            <p className="seller-section-eyebrow">Owner Portal</p>
            <Typography component="h2" variant="h3">
              Kênh người bán đã sẵn sàng
            </Typography>
            <p>
              Quản lý đơn hàng, thực đơn, doanh thu và đánh giá trong giao diện
              Restaurants Owner.
            </p>
          </div>
          <div className="seller-portal-card__restaurants">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <span key={restaurant.id}>{restaurant.name}</span>
              ))
            ) : (
              <span>Tài khoản chủ quán</span>
            )}
          </div>
          <Link className="seller-portal-link" href="/owner">
            <span>Vào Owner Portal</span>
            <ArrowForwardOutlinedIcon fontSize="small" />
          </Link>
        </section>
      ) : null}

      <div className="seller-application-layout">
        <form className="seller-application-form" onSubmit={handleSave} noValidate>
          <section className="seller-form-section">
            <div className="seller-section-heading">
              <FactCheckOutlinedIcon aria-hidden="true" />
              <div>
                <p className="seller-section-eyebrow">Bước 1</p>
                <Typography component="h2" variant="h3">
                  Thông tin nhà hàng
                </Typography>
              </div>
            </div>

            <div className="seller-form-grid">
              <TextField
                required
                label="Tên nhà hàng"
                name="restaurantName"
                value={values.restaurantName}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="organization"
              />
              <TextField
                required
                label="Số điện thoại"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="tel"
              />
              <TextField
                required
                className="seller-form-grid__wide"
                label="Địa chỉ nhà hàng"
                name="address"
                value={values.address}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="street-address"
              />
              <TextField
                className="seller-form-grid__wide"
                label="Mô tả ngắn"
                name="description"
                value={values.description}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                multiline
                minRows={3}
              />
            </div>
          </section>

          <section className="seller-form-section">
            <div className="seller-section-heading">
              <StorefrontOutlinedIcon aria-hidden="true" />
              <div>
                <p className="seller-section-eyebrow">Bước 2</p>
                <Typography component="h2" variant="h3">
                  Thông tin pháp lý
                </Typography>
              </div>
            </div>

            <div className="seller-form-grid">
              <TextField
                label="Người đại diện"
                name="legalRepresentativeName"
                value={values.legalRepresentativeName}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="name"
              />
              <TextField
                label="Mã số thuế"
                name="taxCode"
                value={values.taxCode}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
              />
              <TextField
                className="seller-form-grid__wide"
                label="Số giấy phép kinh doanh"
                name="businessLicenseNumber"
                value={values.businessLicenseNumber}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
              />
            </div>
          </section>

          <div className="seller-form-actions">
            <Button
              type="submit"
              variant="contained"
              startIcon={
                isBusy ? <CircularProgress color="inherit" size={18} /> : <SaveOutlinedIcon />
              }
              disabled={!canEdit || isBusy}
            >
              {isBusy ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              startIcon={<SendOutlinedIcon />}
              onClick={handleSubmitApplication}
              disabled={!canSubmit || isBusy}
            >
              Nộp hồ sơ xét duyệt
            </Button>
            {canWithdraw ? (
              <Button
                type="button"
                color="error"
                variant="text"
                startIcon={<CancelOutlinedIcon />}
                onClick={handleWithdraw}
                disabled={isBusy}
              >
                Rút hồ sơ
              </Button>
            ) : null}
          </div>
        </form>

        <aside className="seller-side-column">
          <section className="seller-checklist-card">
            <p className="seller-section-eyebrow">Hồ sơ cần có</p>
            <div className="seller-checklist">
              {checklist.map((item) => (
                <div key={item.label} className="seller-checklist__item">
                  <span
                    className={item.done ? "is-done" : ""}
                    aria-hidden="true"
                  >
                    <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  </span>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="seller-timeline-card">
            <div className="seller-section-heading">
              <HistoryOutlinedIcon aria-hidden="true" />
              <div>
                <p className="seller-section-eyebrow">Xét duyệt</p>
                <Typography component="h2" variant="h3">
                  Lịch sử hồ sơ
                </Typography>
              </div>
            </div>

            {timeline.length > 0 ? (
              <ol className="seller-timeline">
                {timeline.map((event) => (
                  <li key={event.id}>
                    <span>{statusCopy[event.toStatus].label}</span>
                    <time dateTime={event.createdAt}>
                      {formatTimelineDate(event.createdAt)}
                    </time>
                    {event.note ? <p>{event.note}</p> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="seller-empty-note">
                Lưu bản nháp đầu tiên để bắt đầu lịch sử xét duyệt.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
