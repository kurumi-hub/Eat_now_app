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
import {
  sellerApplicationFormClassName,
  sellerApplicationLayoutClassName,
  sellerChecklistClassName,
  sellerChecklistIconClassName,
  sellerChecklistItemClassName,
  sellerCopyClassName,
  sellerEmptyNoteClassName,
  sellerEyebrowClassName,
  sellerFeedbackClassName,
  sellerFormActionsClassName,
  sellerFormGridClassName,
  sellerFormSectionClassName,
  sellerHeroCopyClassName,
  sellerHeroCopyTextClassName,
  sellerHeroIconClassName,
  sellerHeroPanelClassName,
  sellerHeroTitleClassName,
  sellerInputSx,
  sellerPageClassName,
  sellerPortalCardClassName,
  sellerPortalLinkClassName,
  sellerPortalRestaurantsClassName,
  sellerSectionHeadingClassName,
  sellerSectionTitleClassName,
  sellerSideCardClassName,
  sellerSideColumnClassName,
  sellerStatusCardClassName,
  sellerStatusChipClassName,
  sellerStatusLabelClassName,
  sellerStatusNoteClassName,
  sellerTimelineClassName,
  sellerTimelineItemClassName,
  wideFieldClassName,
} from "./tailwindClasses";

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
    <div className={sellerPageClassName}>
      <section className={sellerHeroPanelClassName}>
        <div className={sellerHeroCopyClassName}>
          <span className={sellerHeroIconClassName} aria-hidden="true">
            <StorefrontOutlinedIcon />
          </span>
          <p className={sellerEyebrowClassName}>Người bán EatNow</p>
          <Typography component="h2" variant="h2" className={sellerHeroTitleClassName}>
            Mở quán trên EatNow
          </Typography>
          <p className={sellerHeroCopyTextClassName}>
            Cập nhật thông tin nhà hàng, gửi hồ sơ xét duyệt và vào kênh quản
            lý sau khi tài khoản được cấp quyền.
          </p>
        </div>

        <aside className={sellerStatusCardClassName} aria-label="Trạng thái hồ sơ">
          <span className={sellerStatusLabelClassName}>Trạng thái hồ sơ</span>
          <Chip
            className={sellerStatusChipClassName(statusMeta.tone)}
            label={statusMeta.label}
          />
          <p className={`m-0 ${sellerCopyClassName}`}>{statusMeta.description}</p>
          {application?.reviewNote ? (
            <p className={sellerStatusNoteClassName}>{application.reviewNote}</p>
          ) : null}
        </aside>
      </section>

      {feedback ? (
        <Alert
          className={sellerFeedbackClassName}
          severity={feedback.severity}
          iconMapping={{
            success: <CheckCircleOutlineOutlinedIcon fontSize="inherit" />,
          }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      {hasPortalAccess ? (
        <section className={sellerPortalCardClassName}>
          <div>
            <p className={sellerEyebrowClassName}>Owner Portal</p>
            <Typography component="h2" variant="h3" className={sellerSectionTitleClassName}>
              Kênh người bán đã sẵn sàng
            </Typography>
            <p className={`m-0 mt-2 ${sellerCopyClassName}`}>
              Quản lý đơn hàng, thực đơn, doanh thu và đánh giá trong giao diện
              Restaurants Owner.
            </p>
          </div>
          <div className={sellerPortalRestaurantsClassName}>
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <span key={restaurant.id}>{restaurant.name}</span>
              ))
            ) : (
              <span>Tài khoản chủ quán</span>
            )}
          </div>
          <Link className={sellerPortalLinkClassName} href="/owner">
            <span>Vào Owner Portal</span>
            <ArrowForwardOutlinedIcon fontSize="small" />
          </Link>
        </section>
      ) : null}

      <div className={sellerApplicationLayoutClassName}>
        <form className={sellerApplicationFormClassName} onSubmit={handleSave} noValidate>
          <section className={sellerFormSectionClassName}>
            <div className={sellerSectionHeadingClassName}>
              <FactCheckOutlinedIcon aria-hidden="true" />
              <div>
                <p className={sellerEyebrowClassName}>Bước 1</p>
                <Typography component="h2" variant="h3" className={sellerSectionTitleClassName}>
                  Thông tin nhà hàng
                </Typography>
              </div>
            </div>

            <div className={sellerFormGridClassName}>
              <TextField
                required
                label="Tên nhà hàng"
                name="restaurantName"
                value={values.restaurantName}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="organization"
                sx={sellerInputSx}
              />
              <TextField
                required
                label="Số điện thoại"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="tel"
                sx={sellerInputSx}
              />
              <TextField
                required
                className={wideFieldClassName}
                label="Địa chỉ nhà hàng"
                name="address"
                value={values.address}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="street-address"
                sx={sellerInputSx}
              />
              <TextField
                className={wideFieldClassName}
                label="Mô tả ngắn"
                name="description"
                value={values.description}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                multiline
                minRows={3}
                sx={sellerInputSx}
              />
            </div>
          </section>

          <section className={sellerFormSectionClassName}>
            <div className={sellerSectionHeadingClassName}>
              <StorefrontOutlinedIcon aria-hidden="true" />
              <div>
                <p className={sellerEyebrowClassName}>Bước 2</p>
                <Typography component="h2" variant="h3" className={sellerSectionTitleClassName}>
                  Thông tin pháp lý
                </Typography>
              </div>
            </div>

            <div className={sellerFormGridClassName}>
              <TextField
                label="Người đại diện"
                name="legalRepresentativeName"
                value={values.legalRepresentativeName}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                autoComplete="name"
                sx={sellerInputSx}
              />
              <TextField
                label="Mã số thuế"
                name="taxCode"
                value={values.taxCode}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                sx={sellerInputSx}
              />
              <TextField
                className={wideFieldClassName}
                label="Số giấy phép kinh doanh"
                name="businessLicenseNumber"
                value={values.businessLicenseNumber}
                onChange={handleChange}
                disabled={!canEdit || isBusy}
                sx={sellerInputSx}
              />
            </div>
          </section>

          <div className={sellerFormActionsClassName}>
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

        <aside className={sellerSideColumnClassName}>
          <section className={sellerSideCardClassName}>
            <p className={sellerEyebrowClassName}>Hồ sơ cần có</p>
            <div className={sellerChecklistClassName}>
              {checklist.map((item) => (
                <div key={item.label} className={sellerChecklistItemClassName}>
                  <span
                    className={sellerChecklistIconClassName(item.done)}
                    aria-hidden="true"
                  >
                    <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  </span>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={sellerSideCardClassName}>
            <div className={sellerSectionHeadingClassName}>
              <HistoryOutlinedIcon aria-hidden="true" />
              <div>
                <p className={sellerEyebrowClassName}>Xét duyệt</p>
                <Typography component="h2" variant="h3" className={sellerSectionTitleClassName}>
                  Lịch sử hồ sơ
                </Typography>
              </div>
            </div>

            {timeline.length > 0 ? (
              <ol className={sellerTimelineClassName}>
                {timeline.map((event) => (
                  <li className={sellerTimelineItemClassName} key={event.id}>
                    <span>{statusCopy[event.toStatus].label}</span>
                    <time dateTime={event.createdAt}>
                      {formatTimelineDate(event.createdAt)}
                    </time>
                    {event.note ? <p>{event.note}</p> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className={sellerEmptyNoteClassName}>
                Lưu bản nháp đầu tiên để bắt đầu lịch sử xét duyệt.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
