"use client";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import {
  createFinanceOverrideAction,
  createFinanceVersionAction,
  simulateFinancePayoutAction,
} from "@/app/admin/actions";
import type {
  AdminActionResult,
  AdminFinanceSettings,
  CreateFinanceOverrideInput,
  CreateFinanceVersionInput,
  FinanceOverrideSettings,
  FinanceSettlementCycle,
  FinanceSimulation,
  FinanceTaxBasis,
  FinanceTaxRule,
} from "@/types/admin";

type VersionForm = {
  name: string;
  effectiveFrom: string;
  effectiveTo: string;
  note: string;
  commissionPercent: string;
  fixedOrderFee: string;
  gatewayPercent: string;
  gatewayFixed: string;
  refundPercent: string;
  refundFixed: string;
  voucherPlatformPercent: string;
  settlementCycle: FinanceSettlementCycle;
  settlementDay: string;
  minimumPayout: string;
  holdPercent: string;
  holdFixed: string;
  holdDays: string;
  taxes: FinanceTaxRule[];
};

type OverrideForm = Omit<VersionForm, "taxes"> & {
  restaurantId: string;
  overrideTaxes: boolean;
  taxes: FinanceTaxRule[];
};

const EMPTY_VERSION_FORM: VersionForm = {
  name: "",
  effectiveFrom: "",
  effectiveTo: "",
  note: "",
  commissionPercent: "20",
  fixedOrderFee: "0",
  gatewayPercent: "0",
  gatewayFixed: "0",
  refundPercent: "0",
  refundFixed: "0",
  voucherPlatformPercent: "100",
  settlementCycle: "weekly",
  settlementDay: "1",
  minimumPayout: "500000",
  holdPercent: "0",
  holdFixed: "0",
  holdDays: "0",
  taxes: [{ code: "VAT", name: "Thuế VAT", rate_percent: 10, basis: "platform_fees" }],
};

const EMPTY_OVERRIDE_FORM: OverrideForm = {
  ...EMPTY_VERSION_FORM,
  restaurantId: "",
  commissionPercent: "",
  fixedOrderFee: "",
  gatewayPercent: "",
  gatewayFixed: "",
  refundPercent: "",
  refundFixed: "",
  voucherPlatformPercent: "",
  settlementCycle: "weekly",
  settlementDay: "",
  minimumPayout: "",
  holdPercent: "",
  holdFixed: "",
  holdDays: "",
  overrideTaxes: false,
  taxes: [],
};

const STATUS_LABELS = {
  active: "Đang áp dụng",
  scheduled: "Đã lên lịch",
  expired: "Hết hiệu lực",
};

const CYCLE_LABELS: Record<FinanceSettlementCycle, string> = {
  daily: "Hàng ngày",
  weekly: "Hàng tuần",
  biweekly: "Hai tuần",
  monthly: "Hàng tháng",
};

const TAX_BASIS_LABELS: Record<FinanceTaxBasis, string> = {
  platform_fees: "Tổng phí nền tảng",
  owner_revenue: "Doanh thu Owner",
  order_subtotal: "Giá trị món",
};

const FINANCE_FORM_STEPS = [
  "Phạm vi áp dụng",
  "Phí & voucher",
  "Đối soát",
  "Thuế & xác nhận",
] as const;

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function requiredNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function TaxEditor({
  taxes,
  onChange,
}: {
  taxes: FinanceTaxRule[];
  onChange: (taxes: FinanceTaxRule[]) => void;
}) {
  const update = (index: number, patch: Partial<FinanceTaxRule>) => {
    onChange(taxes.map((tax, itemIndex) => itemIndex === index ? { ...tax, ...patch } : tax));
  };

  return (
    <div className="admin-finance-taxes">
      <div className="admin-finance-section-title">
        <div><strong>Thuế VAT và các loại thuế khác</strong><small>Tối đa 12 loại thuế</small></div>
        <button
          type="button"
          className="admin-button"
          disabled={taxes.length >= 12}
          onClick={() => onChange([...taxes, {
            code: `TAX_${taxes.length + 1}`,
            name: "Thuế khác",
            rate_percent: 0,
            basis: "platform_fees",
          }])}
        >
          <AddRoundedIcon /> Thêm thuế
        </button>
      </div>
      {taxes.length === 0 ? (
        <p className="admin-finance-empty-tax">Phiên bản này không áp dụng thuế.</p>
      ) : taxes.map((tax, index) => (
        <div className="admin-finance-tax-row" key={`${tax.code}-${index}`}>
          <label>Mã<input value={tax.code} maxLength={30} onChange={(event) => update(index, { code: event.target.value.toUpperCase() })} /></label>
          <label>Tên<input value={tax.name} maxLength={120} onChange={(event) => update(index, { name: event.target.value })} /></label>
          <label>Tỷ lệ (%)<input type="number" min="0" max="100" step="0.01" value={tax.rate_percent} onChange={(event) => update(index, { rate_percent: Number(event.target.value) })} /></label>
          <label>Cơ sở tính<select value={tax.basis} onChange={(event) => update(index, { basis: event.target.value as FinanceTaxBasis })}>{Object.entries(TAX_BASIS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <IconButton aria-label="Xóa loại thuế" onClick={() => onChange(taxes.filter((_, itemIndex) => itemIndex !== index))}><CloseRoundedIcon /></IconButton>
        </div>
      ))}
    </div>
  );
}

function FinanceNumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
  optional,
  max,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  optional?: boolean;
  max?: number;
}) {
  return <label className="admin-finance-number-field"><span className="admin-finance-field-label"><b>{label}</b>{optional ? <small>Để trống để kế thừa</small> : null}</span><span className="admin-finance-input-wrap"><input type="number" min="0" max={max} step="0.01" value={value} required={!optional} onChange={(event) => onChange(event.target.value)} />{suffix ? <em>{suffix}</em> : null}</span>{hint ? <small className="admin-finance-field-hint"><InfoOutlinedIcon /> {hint}</small> : null}</label>;
}

function FinanceStepper({ step }: { step: number }) {
  return <ol className="admin-finance-stepper" aria-label="Các bước cấu hình biểu phí">
    {FINANCE_FORM_STEPS.map((label, index) => <li key={label} className={index === step ? "is-current" : index < step ? "is-done" : ""} aria-current={index === step ? "step" : undefined}>
      <span>{index < step ? <CheckCircleOutlineRoundedIcon /> : index + 1}</span>
      <b>{label}</b>
    </li>)}
  </ol>;
}

function FinanceFormIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return <div className="admin-finance-form-intro"><small>{eyebrow}</small><h3>{title}</h3><p>{description}</p></div>;
}

function displayFormValue(value: string, suffix: string, optional: boolean) {
  if (!value.trim()) return optional ? "Kế thừa biểu phí chung" : `0 ${suffix}`;
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return suffix === "₫" ? formatMoney(number) : `${number}${suffix}`;
}

function FinanceFormReview({
  form,
  override,
}: {
  form: VersionForm | OverrideForm;
  override?: boolean;
}) {
  return <div className="admin-finance-review">
    <div className="admin-finance-review__heading"><CheckCircleOutlineRoundedIcon /><div><strong>Sẵn sàng tạo phiên bản</strong><small>Kiểm tra nhanh các thông số quan trọng trước khi lưu.</small></div></div>
    <div className="admin-finance-review__grid">
      <article><small>Hoa hồng</small><strong>{displayFormValue(form.commissionPercent, "%", Boolean(override))}</strong></article>
      <article><small>Phí cố định</small><strong>{displayFormValue(form.fixedOrderFee, "₫", Boolean(override))}</strong></article>
      <article><small>Voucher nền tảng</small><strong>{displayFormValue(form.voucherPlatformPercent, "%", Boolean(override))}</strong></article>
      <article><small>Đối soát</small><strong>{form.settlementDay ? `${CYCLE_LABELS[form.settlementCycle]} · ngày ${form.settlementDay}` : override ? "Kế thừa biểu phí chung" : CYCLE_LABELS[form.settlementCycle]}</strong></article>
      <article><small>Mức thanh toán tối thiểu</small><strong>{displayFormValue(form.minimumPayout, "₫", Boolean(override))}</strong></article>
      <article><small>Thuế</small><strong>{"overrideTaxes" in form && !form.overrideTaxes ? "Kế thừa biểu phí chung" : `${form.taxes.length} loại thuế`}</strong></article>
    </div>
  </div>;
}

export default function AdminFinancePanel({ finance }: { finance: AdminFinanceSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [versionOpen, setVersionOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [versionStep, setVersionStep] = useState(0);
  const [overrideStep, setOverrideStep] = useState(0);
  const [versionForm, setVersionForm] = useState<VersionForm>(EMPTY_VERSION_FORM);
  const [overrideForm, setOverrideForm] = useState<OverrideForm>(EMPTY_OVERRIDE_FORM);
  const [fieldError, setFieldError] = useState("");
  const [simulation, setSimulation] = useState<FinanceSimulation | null>(null);
  const [simulationRestaurant, setSimulationRestaurant] = useState("");
  const [simulationAt, setSimulationAt] = useState("");
  const [simulationSubtotal, setSimulationSubtotal] = useState("500000");
  const [simulationVoucher, setSimulationVoucher] = useState("50000");
  const [simulationRefund, setSimulationRefund] = useState("0");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const activeVersion = finance.versions.find((version) => version.status === "active") ?? null;

  const notify = (result: AdminActionResult) => {
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.ok ? "success" : "error",
    });
  };

  const submitVersion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError("");
    const effectiveFrom = toIso(versionForm.effectiveFrom);
    const effectiveTo = versionForm.effectiveTo ? toIso(versionForm.effectiveTo) : null;
    if (!effectiveFrom || (versionForm.effectiveTo && !effectiveTo)) {
      setFieldError("Khoảng thời gian áp dụng không hợp lệ.");
      return;
    }
    const input: CreateFinanceVersionInput = {
      name: versionForm.name,
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
      note: versionForm.note,
      settings: {
        commission_percent: requiredNumber(versionForm.commissionPercent),
        fixed_order_fee: requiredNumber(versionForm.fixedOrderFee),
        gateway_fee_percent: requiredNumber(versionForm.gatewayPercent),
        gateway_fixed_fee: requiredNumber(versionForm.gatewayFixed),
        refund_fee_percent: requiredNumber(versionForm.refundPercent),
        refund_fixed_fee: requiredNumber(versionForm.refundFixed),
        voucher_platform_percent: requiredNumber(versionForm.voucherPlatformPercent),
        settlement_cycle: versionForm.settlementCycle,
        settlement_day: requiredNumber(versionForm.settlementDay),
        minimum_payout: requiredNumber(versionForm.minimumPayout),
        hold_percent: requiredNumber(versionForm.holdPercent),
        hold_fixed_amount: requiredNumber(versionForm.holdFixed),
        hold_days: requiredNumber(versionForm.holdDays),
        taxes: versionForm.taxes,
      },
    };
    startTransition(async () => {
      const result = await createFinanceVersionAction(input);
      notify(result);
      if (result.ok) {
        setVersionOpen(false);
        setVersionStep(0);
        setVersionForm(EMPTY_VERSION_FORM);
        router.refresh();
      }
    });
  };

  const submitOverride = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError("");
    const effectiveFrom = toIso(overrideForm.effectiveFrom);
    const effectiveTo = overrideForm.effectiveTo ? toIso(overrideForm.effectiveTo) : null;
    if (!effectiveFrom || (overrideForm.effectiveTo && !effectiveTo)) {
      setFieldError("Khoảng thời gian áp dụng không hợp lệ.");
      return;
    }
    const settings: FinanceOverrideSettings = {
      commission_percent: optionalNumber(overrideForm.commissionPercent),
      fixed_order_fee: optionalNumber(overrideForm.fixedOrderFee),
      gateway_fee_percent: optionalNumber(overrideForm.gatewayPercent),
      gateway_fixed_fee: optionalNumber(overrideForm.gatewayFixed),
      refund_fee_percent: optionalNumber(overrideForm.refundPercent),
      refund_fixed_fee: optionalNumber(overrideForm.refundFixed),
      voucher_platform_percent: optionalNumber(overrideForm.voucherPlatformPercent),
      minimum_payout: optionalNumber(overrideForm.minimumPayout),
      hold_percent: optionalNumber(overrideForm.holdPercent),
      hold_fixed_amount: optionalNumber(overrideForm.holdFixed),
      hold_days: optionalNumber(overrideForm.holdDays),
      taxes: overrideForm.overrideTaxes ? overrideForm.taxes : null,
    };
    if (overrideForm.settlementDay) {
      settings.settlement_cycle = overrideForm.settlementCycle;
      settings.settlement_day = optionalNumber(overrideForm.settlementDay);
    }
    const input: CreateFinanceOverrideInput = {
      restaurant_id: overrideForm.restaurantId,
      name: overrideForm.name,
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
      note: overrideForm.note,
      settings,
    };
    startTransition(async () => {
      const result = await createFinanceOverrideAction(input);
      notify(result);
      if (result.ok) {
        setOverrideOpen(false);
        setOverrideStep(0);
        setOverrideForm(EMPTY_OVERRIDE_FORM);
        router.refresh();
      }
    });
  };

  const submitSimulation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const at = toIso(simulationAt);
    if (!at) {
      notify({ ok: false, message: "Hãy chọn thời điểm mô phỏng." });
      return;
    }
    startTransition(async () => {
      const result = await simulateFinancePayoutAction({
        restaurant_id: simulationRestaurant || null,
        at,
        order_subtotal: requiredNumber(simulationSubtotal),
        voucher_discount: requiredNumber(simulationVoucher),
        refund_amount: requiredNumber(simulationRefund),
      });
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.ok ? "success" : "error",
      });
      if (result.ok) setSimulation(result.data);
    });
  };

  const goToNextVersionStep = () => {
    setFieldError("");
    if (versionStep === 0 && (!versionForm.name.trim() || !versionForm.effectiveFrom)) {
      setFieldError("Hãy nhập tên phiên bản và ngày bắt đầu.");
      return;
    }
    if (versionStep === 1 && [
      versionForm.commissionPercent, versionForm.fixedOrderFee,
      versionForm.gatewayPercent, versionForm.gatewayFixed,
      versionForm.refundPercent, versionForm.refundFixed,
      versionForm.voucherPlatformPercent,
    ].some((value) => !value.trim())) {
      setFieldError("Hãy nhập đầy đủ các mức phí và tỷ lệ voucher.");
      return;
    }
    if (versionStep === 2 && [
      versionForm.settlementDay, versionForm.minimumPayout,
      versionForm.holdPercent, versionForm.holdFixed, versionForm.holdDays,
    ].some((value) => !value.trim())) {
      setFieldError("Hãy nhập đầy đủ thông tin đối soát và tạm giữ.");
      return;
    }
    setVersionStep((current) => Math.min(current + 1, FINANCE_FORM_STEPS.length - 1));
  };

  const goToNextOverrideStep = () => {
    setFieldError("");
    if (overrideStep === 0 && (
      !overrideForm.restaurantId || !overrideForm.name.trim() || !overrideForm.effectiveFrom
    )) {
      setFieldError("Hãy chọn nhà hàng, nhập tên ngoại lệ và ngày bắt đầu.");
      return;
    }
    setOverrideStep((current) => Math.min(current + 1, FINANCE_FORM_STEPS.length - 1));
  };

  const renderFeeFields = (
    form: VersionForm | OverrideForm,
    setForm: (next: never) => void,
    optional = false
  ) => {
    const update = (patch: Partial<VersionForm | OverrideForm>) =>
      setForm({ ...form, ...patch } as never);
    const rawShare = Number(form.voucherPlatformPercent);
    const platformShare = Number.isFinite(rawShare) ? Math.min(Math.max(rawShare, 0), 100) : 0;
    return <div className="admin-finance-form-stack">
      <section className="admin-finance-form-card">
        <FinanceFormIntro eyebrow="Phí vận hành" title="Khoản nền tảng thu trên mỗi đơn" description="Kết hợp tỷ lệ hoa hồng và phí cố định. Có thể đặt một trong hai bằng 0." />
        <div className="admin-finance-field-grid admin-finance-field-grid--two">
          <FinanceNumberField label="Hoa hồng nền tảng" hint="Tính trên doanh thu Owner sau phần voucher Owner chịu và tiền hoàn." suffix="%" max={100} optional={optional} value={form.commissionPercent} onChange={(value) => update({ commissionPercent: value })} />
          <FinanceNumberField label="Phí cố định mỗi đơn" hint="Khoản tiền cố định trừ thêm cho mỗi đơn hoàn tất." suffix="₫" optional={optional} value={form.fixedOrderFee} onChange={(value) => update({ fixedOrderFee: value })} />
        </div>
      </section>
      <section className="admin-finance-form-card">
        <FinanceFormIntro eyebrow="Thanh toán & hoàn tiền" title="Chi phí giao dịch" description="Tách phần trăm và phần cố định để khớp chính sách của cổng thanh toán." />
        <div className="admin-finance-field-grid admin-finance-field-grid--two">
          <FinanceNumberField label="Phí cổng thanh toán" hint="Tỷ lệ tính trên số tiền khách thực trả sau voucher." suffix="%" max={100} optional={optional} value={form.gatewayPercent} onChange={(value) => update({ gatewayPercent: value })} />
          <FinanceNumberField label="Phí gateway cố định" suffix="₫" optional={optional} value={form.gatewayFixed} onChange={(value) => update({ gatewayFixed: value })} />
          <FinanceNumberField label="Phí xử lý hoàn tiền" hint="Chỉ phát sinh khi đơn có số tiền hoàn." suffix="%" max={100} optional={optional} value={form.refundPercent} onChange={(value) => update({ refundPercent: value })} />
          <FinanceNumberField label="Phí hoàn cố định" suffix="₫" optional={optional} value={form.refundFixed} onChange={(value) => update({ refundFixed: value })} />
        </div>
      </section>
      <section className="admin-finance-form-card admin-finance-voucher-card">
        <FinanceFormIntro eyebrow="Chia sẻ khuyến mãi" title="Ai chịu chi phí voucher?" description="Nhập tỷ lệ nền tảng chịu; phần còn lại tự động thuộc Owner." />
        <FinanceNumberField label="Nền tảng chịu voucher" suffix="%" max={100} optional={optional} value={form.voucherPlatformPercent} onChange={(value) => update({ voucherPlatformPercent: value })} />
        {optional && !form.voucherPlatformPercent ? <p className="admin-finance-inherit-note">Ngoại lệ này sẽ dùng tỷ lệ voucher của biểu phí chung.</p> : <div className="admin-finance-voucher-split">
          <div><span style={{ width: `${platformShare}%` }} /><i style={{ width: `${100 - platformShare}%` }} /></div>
          <p><strong>Nền tảng {platformShare}%</strong><strong>Owner {100 - platformShare}%</strong></p>
        </div>}
      </section>
    </div>;
  };

  const renderSettlementFields = (
    form: VersionForm | OverrideForm,
    setForm: (next: never) => void,
    optional = false
  ) => {
    const update = (patch: Partial<VersionForm | OverrideForm>) =>
      setForm({ ...form, ...patch } as never);
    return <div className="admin-finance-form-stack">
      <section className="admin-finance-form-card">
        <FinanceFormIntro eyebrow="Lịch chuyển tiền" title="Chu kỳ đối soát" description="Xác định thời điểm số dư đủ điều kiện được gom và thanh toán cho Owner." />
        <div className="admin-finance-field-grid admin-finance-field-grid--two">
          <label className="admin-finance-select-field"><span className="admin-finance-field-label"><b>Chu kỳ</b>{optional ? <small>Chỉ áp dụng khi nhập ngày</small> : null}</span><select value={form.settlementCycle} onChange={(event) => update({ settlementCycle: event.target.value as FinanceSettlementCycle })}>{Object.entries(CYCLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <FinanceNumberField label="Ngày trong chu kỳ" hint="Hàng tuần: 1–7; hai tuần: 1–14; hàng tháng: 1–28." optional={optional} value={form.settlementDay} onChange={(value) => update({ settlementDay: value })} />
          <FinanceNumberField label="Mức thanh toán tối thiểu" hint="Số dư thấp hơn mức này sẽ được cộng dồn sang kỳ sau." suffix="₫" optional={optional} value={form.minimumPayout} onChange={(value) => update({ minimumPayout: value })} />
        </div>
      </section>
      <section className="admin-finance-form-card">
        <FinanceFormIntro eyebrow="Quản trị rủi ro" title="Khoản tạm giữ" description="Có thể tạm giữ theo tỷ lệ, số tiền cố định hoặc kết hợp cả hai." />
        <div className="admin-finance-field-grid admin-finance-field-grid--three">
          <FinanceNumberField label="Tỷ lệ tạm giữ" suffix="%" max={100} optional={optional} value={form.holdPercent} onChange={(value) => update({ holdPercent: value })} />
          <FinanceNumberField label="Tạm giữ cố định" suffix="₫" optional={optional} value={form.holdFixed} onChange={(value) => update({ holdFixed: value })} />
          <FinanceNumberField label="Thời gian giữ" suffix="ngày" max={365} optional={optional} value={form.holdDays} onChange={(value) => update({ holdDays: value })} />
        </div>
      </section>
    </div>;
  };

  const renderStepError = () => fieldError ? <Alert severity="error" className="admin-finance-step-error">{fieldError}</Alert> : null;

  const openVersionDialog = () => {
    setFieldError("");
    setVersionStep(0);
    setVersionOpen(true);
  };

  const openOverrideDialog = () => {
    setFieldError("");
    setOverrideStep(0);
    setOverrideOpen(true);
  };

  const closeVersionDialog = () => {
    if (isPending) return;
    setVersionOpen(false);
    setVersionStep(0);
    setFieldError("");
  };

  const closeOverrideDialog = () => {
    if (isPending) return;
    setOverrideOpen(false);
    setOverrideStep(0);
    setFieldError("");
  };

  return (
    <section className="admin-finance">
      <div className="admin-panel admin-finance-hero">
        <div className="admin-finance-heading">
          <div><p><AccountBalanceOutlinedIcon /> Chỉ Super Admin</p><h2>Cấu hình tài chính</h2><span>Biểu phí được phiên bản hóa; dữ liệu lịch sử không bị sửa đè.</span></div>
          <div><button type="button" className="admin-button" onClick={openOverrideDialog}><StorefrontOutlinedIcon /> Thêm ngoại lệ</button><button type="button" className="admin-button admin-button--primary" onClick={openVersionDialog}><AddRoundedIcon /> Tạo biểu phí</button></div>
        </div>

        <div className="admin-finance-formula"><InfoOutlinedIcon /><div><strong>Cách tính nhanh số tiền Owner nhận</strong><span>Giá trị món − voucher Owner chịu − hoàn tiền − phí nền tảng − thuế − tạm giữ</span></div></div>

        {activeVersion ? (
          <div className="admin-finance-current">
            <article><small>Phiên bản đang áp dụng</small><strong>v{activeVersion.version_number} · {activeVersion.name}</strong><span>{formatDate(activeVersion.effective_from)} → {formatDate(activeVersion.effective_to)}</span></article>
            <article><small>Hoa hồng</small><strong>{activeVersion.commission_percent}%</strong><span>+ {formatMoney(activeVersion.fixed_order_fee)} mỗi đơn</span></article>
            <article><small>Voucher</small><strong>{activeVersion.voucher_platform_percent}% nền tảng</strong><span>{100 - activeVersion.voucher_platform_percent}% Owner</span></article>
            <article><small>Đối soát</small><strong>{CYCLE_LABELS[activeVersion.settlement_cycle]}</strong><span>Tối thiểu {formatMoney(activeVersion.minimum_payout)}</span></article>
          </div>
        ) : <Alert severity="warning">Chưa có biểu phí đang hiệu lực. Hãy tạo phiên bản đầu tiên.</Alert>}
      </div>

      <div className="admin-finance-grid">
        <section className="admin-panel admin-finance-simulator">
          <div className="admin-panel__heading"><div><h2>Mô phỏng Owner nhận</h2><p>Tính theo biểu phí và ngoại lệ có hiệu lực tại thời điểm chọn.</p></div><CalculateOutlinedIcon /></div>
          <form onSubmit={submitSimulation} className="admin-finance-simulator-form">
            <label>Nhà hàng<select value={simulationRestaurant} onChange={(event) => setSimulationRestaurant(event.target.value)}><option value="">Không áp dụng ngoại lệ</option>{finance.restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}</select></label>
            <label>Thời điểm<input type="datetime-local" required value={simulationAt} onChange={(event) => setSimulationAt(event.target.value)} /></label>
            <label>Giá trị món <small>Tổng tiền món trước giảm giá</small><input type="number" min="0" required value={simulationSubtotal} onChange={(event) => setSimulationSubtotal(event.target.value)} /></label>
            <label>Voucher <small>Tổng ưu đãi của đơn</small><input type="number" min="0" required value={simulationVoucher} onChange={(event) => setSimulationVoucher(event.target.value)} /></label>
            <label>Tiền hoàn <small>Nhập 0 nếu không hoàn</small><input type="number" min="0" required value={simulationRefund} onChange={(event) => setSimulationRefund(event.target.value)} /></label>
            <button className="admin-button admin-button--primary" disabled={isPending} type="submit"><CalculateOutlinedIcon /> Tính thử</button>
          </form>
          {simulation ? <div className="admin-finance-result">
            <div><small>Owner dự kiến nhận</small><strong>{formatMoney(simulation.breakdown.owner_receivable)}</strong><span className={simulation.breakdown.payout_eligible ? "is-eligible" : "is-waiting"}>{simulation.breakdown.payout_eligible ? "Đủ mức thanh toán" : "Chờ cộng dồn đối soát"}</span></div>
            <dl>
              <div><dt>Giá trị món</dt><dd>{formatMoney(simulation.input.order_subtotal)}</dd></div>
              <div><dt>Owner chịu voucher</dt><dd>-{formatMoney(simulation.breakdown.owner_funded_voucher)}</dd></div>
              <div><dt>Tiền hoàn</dt><dd>-{formatMoney(simulation.input.refund_amount)}</dd></div>
              <div><dt>Hoa hồng</dt><dd>-{formatMoney(simulation.breakdown.commission_fee)}</dd></div>
              <div><dt>Phí cố định</dt><dd>-{formatMoney(simulation.breakdown.fixed_order_fee)}</dd></div>
              <div><dt>Phí gateway</dt><dd>-{formatMoney(simulation.breakdown.gateway_fee)}</dd></div>
              <div><dt>Phí xử lý hoàn</dt><dd>-{formatMoney(simulation.breakdown.refund_processing_fee)}</dd></div>
              <div><dt>Tổng thuế</dt><dd>-{formatMoney(simulation.breakdown.tax_total)}</dd></div>
              <div><dt>Tạm giữ ({simulation.settings.hold_days} ngày)</dt><dd>-{formatMoney(simulation.breakdown.hold_amount)}</dd></div>
            </dl>
            <p>Dùng biểu phí v{simulation.settings.base_version_number}{simulation.settings.override_name ? ` + ${simulation.settings.override_name}` : ""}.</p>
          </div> : null}
        </section>

        <section className="admin-panel admin-finance-history">
          <div className="admin-panel__heading"><div><h2>Lịch sử biểu phí</h2><p>{finance.versions.length} phiên bản gần nhất</p></div><PercentRoundedIcon /></div>
          <div>{finance.versions.length === 0 ? <p className="admin-finance-empty">Chưa có phiên bản.</p> : finance.versions.map((version) => <article key={version.id}>
            <span className={`admin-status admin-status--${version.status}`}>{STATUS_LABELS[version.status]}</span>
            <div><h3>v{version.version_number} · {version.name}</h3><p>{version.commission_percent}% hoa hồng · {version.taxes.length} loại thuế · {CYCLE_LABELS[version.settlement_cycle]}</p><small>{formatDate(version.effective_from)} → {formatDate(version.effective_to)}</small></div>
          </article>)}</div>
        </section>
      </div>

      <section className="admin-panel admin-finance-overrides">
        <div className="admin-panel__heading"><div><h2>Ngoại lệ theo nhà hàng</h2><p>Mỗi thay đổi tạo một phiên bản mới và kế thừa biểu phí chung.</p></div><StorefrontOutlinedIcon /></div>
        <div>{finance.overrides.length === 0 ? <p className="admin-finance-empty">Chưa có ngoại lệ.</p> : finance.overrides.map((override) => <article key={override.id}>
          <div><span className={`admin-status admin-status--${override.status}`}>{STATUS_LABELS[override.status]}</span><h3>{override.restaurant_name}</h3><p>{override.name} · v{override.version_number}</p></div>
          <div><strong>{override.commission_percent == null ? "Kế thừa hoa hồng" : `${override.commission_percent}% hoa hồng`}</strong><small>{formatDate(override.effective_from)} → {formatDate(override.effective_to)}</small></div>
        </article>)}</div>
      </section>

      <Dialog open={versionOpen} onClose={closeVersionDialog} fullWidth maxWidth="md" slotProps={{ paper: { className: "admin-dialog admin-finance-dialog" } }}>
        <form onSubmit={submitVersion}>
          <DialogTitle className="admin-dialog__title"><span className="admin-finance-dialog-title">Tạo phiên bản biểu phí<small>Bước {versionStep + 1}/4 · {FINANCE_FORM_STEPS[versionStep]}</small></span><IconButton onClick={closeVersionDialog} disabled={isPending}><CloseRoundedIcon /></IconButton></DialogTitle>
          <DialogContent>
            <FinanceStepper step={versionStep} />
            {versionStep === 0 ? <div className="admin-finance-form-stack">
              <FinanceFormIntro eyebrow="Bước 1" title="Phiên bản này áp dụng khi nào?" description="Đặt tên dễ nhận biết và chọn thời gian hiệu lực. Lịch sử cũ luôn được giữ nguyên." />
              <Alert severity="info">Nếu thời gian trùng, phiên bản đang mở sẽ tự đóng tại mốc bắt đầu mới.</Alert>
              <section className="admin-finance-form-card">
                <div className="admin-finance-meta-grid">
                  <label>Tên phiên bản<input required maxLength={120} placeholder="Ví dụ: Biểu phí quý 3/2026" value={versionForm.name} onChange={(event) => setVersionForm({ ...versionForm, name: event.target.value })} /></label>
                  <label>Bắt đầu<input required type="datetime-local" value={versionForm.effectiveFrom} onChange={(event) => setVersionForm({ ...versionForm, effectiveFrom: event.target.value })} /></label>
                  <label>Kết thúc <small>Tùy chọn</small><input type="datetime-local" value={versionForm.effectiveTo} onChange={(event) => setVersionForm({ ...versionForm, effectiveTo: event.target.value })} /></label>
                </div>
              </section>
            </div> : null}
            {versionStep === 1 ? renderFeeFields(versionForm, setVersionForm as (next: never) => void) : null}
            {versionStep === 2 ? renderSettlementFields(versionForm, setVersionForm as (next: never) => void) : null}
            {versionStep === 3 ? <div className="admin-finance-form-stack">
              <FinanceFormIntro eyebrow="Bước cuối" title="Thuế và xác nhận" description="Thiết lập các loại thuế, thêm ghi chú nội bộ rồi kiểm tra tóm tắt trước khi tạo." />
              <TaxEditor taxes={versionForm.taxes} onChange={(taxes) => setVersionForm({ ...versionForm, taxes })} />
              <label className="admin-finance-note">Ghi chú <small>Tùy chọn</small><textarea maxLength={1000} rows={3} placeholder="Lý do hoặc phạm vi áp dụng của biểu phí…" value={versionForm.note} onChange={(event) => setVersionForm({ ...versionForm, note: event.target.value })} /></label>
              <FinanceFormReview form={versionForm} />
            </div> : null}
            {renderStepError()}
          </DialogContent>
          <DialogActions className="admin-dialog__actions admin-finance-dialog-actions">
            <button type="button" className="admin-button" disabled={isPending} onClick={closeVersionDialog}>Hủy</button>
            <div>{versionStep > 0 ? <button type="button" className="admin-button" disabled={isPending} onClick={() => { setFieldError(""); setVersionStep((current) => current - 1); }}><ArrowBackRoundedIcon /> Quay lại</button> : null}{versionStep < 3 ? <button type="button" className="admin-button admin-button--primary" disabled={isPending} onClick={goToNextVersionStep}>Tiếp tục <ArrowForwardRoundedIcon /></button> : <button type="submit" className="admin-button admin-button--primary" disabled={isPending}><CheckCircleOutlineRoundedIcon /> Tạo phiên bản</button>}</div>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={overrideOpen} onClose={closeOverrideDialog} fullWidth maxWidth="md" slotProps={{ paper: { className: "admin-dialog admin-finance-dialog" } }}>
        <form onSubmit={submitOverride}>
          <DialogTitle className="admin-dialog__title"><span className="admin-finance-dialog-title">Tạo ngoại lệ nhà hàng<small>Bước {overrideStep + 1}/4 · {FINANCE_FORM_STEPS[overrideStep]}</small></span><IconButton onClick={closeOverrideDialog} disabled={isPending}><CloseRoundedIcon /></IconButton></DialogTitle>
          <DialogContent>
            <FinanceStepper step={overrideStep} />
            {overrideStep === 0 ? <div className="admin-finance-form-stack">
              <FinanceFormIntro eyebrow="Bước 1" title="Ngoại lệ dành cho nhà hàng nào?" description="Chọn phạm vi và khoảng hiệu lực. Mọi trường phí để trống ở bước sau sẽ kế thừa biểu phí chung." />
              <Alert severity="info">Ngoại lệ được phiên bản hóa, không sửa đè lịch sử đã áp dụng.</Alert>
              <section className="admin-finance-form-card">
                <div className="admin-finance-meta-grid admin-finance-meta-grid--override">
                  <label>Nhà hàng<select required value={overrideForm.restaurantId} onChange={(event) => setOverrideForm({ ...overrideForm, restaurantId: event.target.value })}><option value="">Chọn nhà hàng</option>{finance.restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}</select></label>
                  <label>Tên ngoại lệ<input required maxLength={120} placeholder="Ví dụ: Ưu đãi đối tác chiến lược" value={overrideForm.name} onChange={(event) => setOverrideForm({ ...overrideForm, name: event.target.value })} /></label>
                  <label>Bắt đầu<input required type="datetime-local" value={overrideForm.effectiveFrom} onChange={(event) => setOverrideForm({ ...overrideForm, effectiveFrom: event.target.value })} /></label>
                  <label>Kết thúc <small>Tùy chọn</small><input type="datetime-local" value={overrideForm.effectiveTo} onChange={(event) => setOverrideForm({ ...overrideForm, effectiveTo: event.target.value })} /></label>
                </div>
              </section>
            </div> : null}
            {overrideStep === 1 ? renderFeeFields(overrideForm, setOverrideForm as (next: never) => void, true) : null}
            {overrideStep === 2 ? renderSettlementFields(overrideForm, setOverrideForm as (next: never) => void, true) : null}
            {overrideStep === 3 ? <div className="admin-finance-form-stack">
              <FinanceFormIntro eyebrow="Bước cuối" title="Thuế và xác nhận ngoại lệ" description="Chỉ bật ghi đè thuế khi nhà hàng này có chính sách thực sự khác biểu phí chung." />
              <label className="admin-finance-tax-toggle"><input type="checkbox" checked={overrideForm.overrideTaxes} onChange={(event) => setOverrideForm({ ...overrideForm, overrideTaxes: event.target.checked, taxes: event.target.checked ? overrideForm.taxes : [] })} /><span><b>Ghi đè danh sách thuế</b><small>Tắt để tiếp tục kế thừa toàn bộ thuế từ biểu phí chung.</small></span></label>
              {overrideForm.overrideTaxes ? <TaxEditor taxes={overrideForm.taxes} onChange={(taxes) => setOverrideForm({ ...overrideForm, taxes })} /> : null}
              <label className="admin-finance-note">Ghi chú <small>Tùy chọn</small><textarea maxLength={1000} rows={3} placeholder="Lý do tạo ngoại lệ…" value={overrideForm.note} onChange={(event) => setOverrideForm({ ...overrideForm, note: event.target.value })} /></label>
              <FinanceFormReview form={overrideForm} override />
            </div> : null}
            {renderStepError()}
          </DialogContent>
          <DialogActions className="admin-dialog__actions admin-finance-dialog-actions">
            <button type="button" className="admin-button" disabled={isPending} onClick={closeOverrideDialog}>Hủy</button>
            <div>{overrideStep > 0 ? <button type="button" className="admin-button" disabled={isPending} onClick={() => { setFieldError(""); setOverrideStep((current) => current - 1); }}><ArrowBackRoundedIcon /> Quay lại</button> : null}{overrideStep < 3 ? <button type="button" className="admin-button admin-button--primary" disabled={isPending} onClick={goToNextOverrideStep}>Tiếp tục <ArrowForwardRoundedIcon /></button> : <button type="submit" className="admin-button admin-button--primary" disabled={isPending}><CheckCircleOutlineRoundedIcon /> Tạo ngoại lệ</button>}</div>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert></Snackbar>
    </section>
  );
}
