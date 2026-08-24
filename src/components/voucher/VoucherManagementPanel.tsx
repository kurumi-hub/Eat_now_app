"use client";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { assignVoucherByEmailAction, saveAdminVoucherAction, setAdminVoucherStatusAction } from "@/app/admin/actions";
import { saveOwnerVoucherAction, setOwnerVoucherStatusAction } from "@/app/owner/actions";
import type {
  VoucherManagementData,
  VoucherManagementItem,
  VoucherSaveInput,
  VoucherStoredStatus,
  VoucherTargetScope,
} from "@/types/voucher";

type Props = {
  mode: "admin" | "owner";
  data: VoucherManagementData;
  restaurantId?: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Bản nháp", scheduled: "Đã lên lịch", active: "Đang hoạt động",
  paused: "Tạm dừng", exhausted: "Đã hết ngân sách/lượt", ended: "Đã kết thúc",
  archived: "Đã lưu trữ",
};

const TARGET_LABEL: Record<VoucherTargetScope, string> = {
  system: "Toàn hệ thống", restaurant: "Nhà hàng", category: "Category", food: "Món ăn",
};

function dateInput(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function blank(mode: Props["mode"]): VoucherSaveInput {
  return {
    code: "", name: "", description: "", terms: "",
    benefitScope: "items", targetScope: mode === "admin" ? "system" : "restaurant",
    discountType: "fixed", discountValue: 10_000, maxDiscount: null,
    minOrderValue: 0, usageLimitTotal: 100, usageLimitUser: 1,
    totalBudget: mode === "owner" ? 1_000_000 : null,
    distributionMode: "auto", claimLimitTotal: null,
    startAt: dateInput(new Date()), expiredAt: dateInput(new Date(Date.now() + 7 * 86_400_000)),
    targetIds: [], status: "draft",
  };
}

function fromItem(item: VoucherManagementItem): VoucherSaveInput {
  return {
    id: item.id, code: item.code, name: item.name, description: item.description,
    terms: item.terms, benefitScope: item.benefitScope, targetScope: item.targetScope,
    discountType: item.discountType, discountValue: item.discountValue,
    maxDiscount: item.maxDiscount, minOrderValue: item.minOrderValue,
    usageLimitTotal: item.usageLimitTotal, usageLimitUser: item.usageLimitUser,
    totalBudget: item.totalBudget, startAt: dateInput(item.startAt),
    distributionMode: item.distributionMode, claimLimitTotal: item.claimLimitTotal,
    expiredAt: dateInput(item.expiredAt), targetIds: item.targets.map((target) => target.id),
    status: item.status,
  };
}

function money(value: number | null) {
  if (value === null) return "Không giới hạn";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

export default function VoucherManagementPanel({ mode, data, restaurantId }: Props) {
  const router = useRouter();
  const [editor, setEditor] = useState<VoucherSaveInput>(() => blank(mode));
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [assignTarget, setAssignTarget] = useState<VoucherManagementItem | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const options = editor.targetScope === "restaurant" ? data.options.restaurants
    : editor.targetScope === "category" ? data.options.categories
      : editor.targetScope === "food" ? data.options.foods : [];
  const needsTargets = editor.targetScope === "category" || editor.targetScope === "food" ||
    (mode === "admin" && editor.targetScope === "restaurant");
  const filtered = useMemo(() => data.items.filter((item) => filter === "all" || item.effectiveStatus === filter), [data.items, filter]);
  const spent = data.items.reduce((sum, item) => sum + item.spentBudget, 0);

  const set = <K extends keyof VoucherSaveInput>(key: K, value: VoucherSaveInput[K]) =>
    setEditor((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = mode === "admin"
        ? await saveAdminVoucherAction(editor)
        : await saveOwnerVoucherAction(restaurantId || "", editor);
      setNotice(result);
      if (result.ok) { setEditor(blank(mode)); setShowForm(false); router.refresh(); }
    });
  };

  const changeStatus = (id: string, status: VoucherStoredStatus) => {
    startTransition(async () => {
      const result = mode === "admin"
        ? await setAdminVoucherStatusAction(id, status)
        : await setOwnerVoucherStatusAction(restaurantId || "", id, status);
      setNotice(result);
      if (result.ok) router.refresh();
    });
  };

  const assignVoucher = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignTarget) return;
    startTransition(async () => {
      const result = await assignVoucherByEmailAction(assignTarget.id, assignEmail);
      setNotice(result);
      if (result.ok) { setAssignTarget(null); setAssignEmail(""); router.refresh(); }
    });
  };

  const toggleTarget = (id: string) => set("targetIds", editor.targetIds.includes(id)
    ? editor.targetIds.filter((value) => value !== id)
    : [...editor.targetIds, id]);

  return <section className="voucher-management">
    <header className="voucher-management__heading">
      <div><span>{mode === "admin" ? "Voucher nền tảng" : "Ưu đãi nhà hàng"}</span><h2>Quản lý voucher</h2><p>Phân biệt tiền món và phí giao hàng, kiểm soát lượt dùng và ngân sách theo thời gian thực.</p></div>
      <button type="button" className="voucher-management__primary" onClick={() => { setNotice(null); setEditor(blank(mode)); setShowForm(true); }}>+ Tạo voucher</button>
    </header>

    {notice && <div className={`voucher-management__notice ${notice.ok ? "is-success" : "is-error"}`}>{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}

    <div className="voucher-management__metrics">
      <article><span>Tổng chiến dịch</span><strong>{data.items.length}</strong></article>
      <article><span>Đang hoạt động</span><strong>{data.items.filter((item) => item.effectiveStatus === "active").length}</strong></article>
      <article><span>Lượt đã dùng</span><strong>{data.items.reduce((sum, item) => sum + item.usedCount, 0)}</strong></article>
      <article><span>Ngân sách đã dùng</span><strong>{money(spent)}</strong></article>
    </div>

    <div className="voucher-management__filters">
      {["all", "active", "scheduled", "draft", "paused", "exhausted", "ended", "archived"].map((status) =>
        <button key={status} type="button" className={filter === status ? "is-active" : ""} onClick={() => setFilter(status)}>{status === "all" ? "Tất cả" : STATUS_LABEL[status]}</button>)}
    </div>

    <Dialog
      open={showForm}
      onClose={pending ? undefined : () => setShowForm(false)}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{ paper: { className: "voucher-editor-dialog" } }}
    >
      <DialogTitle className="voucher-editor-dialog__title">
        <div><span>{mode === "admin" ? "Voucher nền tảng" : "Voucher nhà hàng"}</span><h3>{editor.id ? "Cập nhật voucher" : "Tạo voucher mới"}</h3><p>Thiết lập quyền lợi, phạm vi, thời gian và giới hạn ngân sách.</p></div>
        <IconButton aria-label="Đóng form voucher" onClick={() => setShowForm(false)} disabled={pending}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent className="voucher-editor-dialog__content">
        <form className="voucher-editor" onSubmit={submit}>
          {notice && !notice.ok && <div className="voucher-editor__error" role="alert">{notice.message}</div>}
          <section className="voucher-editor__section"><h4>Thông tin cơ bản</h4><div className="voucher-editor__grid">
            <label>Mã voucher<input autoFocus value={editor.code} maxLength={30} required placeholder="VD: FREESHIP15" onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))} /></label>
            <label>Tên voucher<input value={editor.name} maxLength={120} required placeholder="Tên hiển thị với khách hàng" onChange={(e) => set("name", e.target.value)} /></label>
          </div><label className="voucher-editor__wide">Mô tả<textarea rows={2} maxLength={500} value={editor.description} placeholder="Mô tả ngắn về ưu đãi" onChange={(e) => set("description", e.target.value)} /></label></section>

          <section className="voucher-editor__section"><h4>Quyền lợi và phạm vi</h4><div className="voucher-editor__grid">
            <label>Giảm vào<select value={editor.benefitScope} onChange={(e) => set("benefitScope", e.target.value as VoucherSaveInput["benefitScope"])}><option value="items">Tiền món</option><option value="shipping">Phí giao hàng / Freeship</option></select></label>
            <label>Phạm vi<select value={editor.targetScope} onChange={(e) => { set("targetScope", e.target.value as VoucherTargetScope); set("targetIds", []); }}><option value={mode === "admin" ? "system" : "restaurant"}>{mode === "admin" ? "Toàn hệ thống" : "Toàn nhà hàng"}</option>{mode === "admin" && <option value="restaurant">Nhà hàng được chọn</option>}<option value="category">Category được chọn</option><option value="food">Món được chọn</option></select></label>
            <label>Kiểu giảm<select value={editor.discountType} onChange={(e) => set("discountType", e.target.value as VoucherSaveInput["discountType"])}><option value="fixed">Số tiền cố định</option><option value="percent">Phần trăm</option></select></label>
            <label>Giá trị giảm<input type="number" min="1" max={editor.discountType === "percent" ? 100 : undefined} value={editor.discountValue} onChange={(e) => set("discountValue", Number(e.target.value))} /></label>
            {editor.discountType === "percent" && <label>Giảm tối đa<input type="number" min="1" value={editor.maxDiscount ?? ""} placeholder="Không giới hạn" onChange={(e) => set("maxDiscount", e.target.value ? Number(e.target.value) : null)} /></label>}
            <label>Giá trị đơn tối thiểu<input type="number" min="0" value={editor.minOrderValue} onChange={(e) => set("minOrderValue", Number(e.target.value))} /></label>
          </div>{needsTargets && <fieldset className="voucher-target-picker"><legend>Chọn {TARGET_LABEL[editor.targetScope].toLocaleLowerCase("vi")}</legend><div>{options.map((option) => <label key={option.id}><input type="checkbox" checked={editor.targetIds.includes(option.id)} onChange={() => toggleTarget(option.id)} /><span>{option.name}{option.restaurantName ? <small>{option.restaurantName}</small> : null}</span></label>)}</div>{options.length === 0 && <p>Chưa có đối tượng phù hợp.</p>}</fieldset>}</section>

          <section className="voucher-editor__section"><h4>Ngân sách và lượt sử dụng</h4><div className="voucher-editor__grid">
            <label>Cách phân phối<select value={editor.distributionMode} onChange={(e) => { set("distributionMode", e.target.value as VoucherSaveInput["distributionMode"]); if (e.target.value === "auto") set("claimLimitTotal", null); }}><option value="auto">Tự động khả dụng</option><option value="claim">Khách bấm nhận vào kho</option>{mode === "admin" && <option value="assigned">Tặng riêng cho khách</option>}</select></label>
            {editor.distributionMode !== "auto" && <label>Tổng lượt có thể cấp<input type="number" min="1" value={editor.claimLimitTotal ?? ""} placeholder="Để trống nếu không giới hạn" onChange={(e) => set("claimLimitTotal", e.target.value ? Number(e.target.value) : null)} /></label>}
            <label>Tổng ngân sách<input type="number" min="1" required={mode === "owner"} value={editor.totalBudget ?? ""} placeholder={mode === "admin" ? "Để trống nếu không giới hạn" : "Bắt buộc"} onChange={(e) => set("totalBudget", e.target.value ? Number(e.target.value) : null)} /></label>
            <label>Tổng lượt sử dụng<input type="number" min="1" value={editor.usageLimitTotal ?? ""} placeholder="Để trống nếu không giới hạn" onChange={(e) => set("usageLimitTotal", e.target.value ? Number(e.target.value) : null)} /></label>
            <label>Lượt tối đa mỗi khách<input type="number" min="1" max="100" value={editor.usageLimitUser} onChange={(e) => set("usageLimitUser", Number(e.target.value))} /></label>
            <label>Trạng thái khi lưu<select value={editor.status} onChange={(e) => set("status", e.target.value as VoucherStoredStatus)}><option value="draft">Lưu bản nháp</option><option value="active">Kích hoạt</option><option value="paused">Tạm dừng</option></select></label>
          </div></section>

          <section className="voucher-editor__section"><h4>Thời gian và điều khoản</h4><div className="voucher-editor__grid">
            <label>Bắt đầu<input type="datetime-local" required value={editor.startAt} onChange={(e) => set("startAt", e.target.value)} /></label>
            <label>Kết thúc<input type="datetime-local" required value={editor.expiredAt} onChange={(e) => set("expiredAt", e.target.value)} /></label>
          </div><label className="voucher-editor__wide">Điều khoản<textarea rows={3} maxLength={1000} value={editor.terms} placeholder="Điều kiện sử dụng hiển thị cho khách hàng" onChange={(e) => set("terms", e.target.value)} /></label></section>

          <div className="voucher-editor__actions"><button type="button" onClick={() => setShowForm(false)} disabled={pending}>Hủy</button><button className="voucher-management__primary" disabled={pending}>{pending ? "Đang lưu..." : editor.id ? "Lưu thay đổi" : "Tạo voucher"}</button></div>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={Boolean(assignTarget)} onClose={pending ? undefined : () => setAssignTarget(null)} fullWidth maxWidth="xs" slotProps={{ paper: { className: "voucher-editor-dialog" } }}>
      <DialogTitle className="voucher-editor-dialog__title"><div><span>Tặng voucher</span><h3>{assignTarget?.code}</h3><p>Cấp một voucher trực tiếp vào kho của khách hàng.</p></div><IconButton aria-label="Đóng form tặng voucher" onClick={() => setAssignTarget(null)} disabled={pending}><CloseRoundedIcon /></IconButton></DialogTitle>
      <DialogContent className="voucher-editor-dialog__content"><form className="voucher-editor" onSubmit={assignVoucher}><section className="voucher-editor__section"><label>Email khách hàng<input autoFocus type="email" required value={assignEmail} placeholder="customer@example.com" onChange={(event) => setAssignEmail(event.target.value)} /></label><p className="voucher-editor__helper">Voucher sẽ xuất hiện ngay trong “Kho của tôi” và khách hàng nhận được thông báo.</p></section><div className="voucher-editor__actions"><button type="button" onClick={() => setAssignTarget(null)} disabled={pending}>Hủy</button><button className="voucher-management__primary" disabled={pending}>{pending ? "Đang tặng..." : "Tặng voucher"}</button></div></form></DialogContent>
    </Dialog>

    <div className="voucher-campaign-list">
      {filtered.map((item) => {
        const budgetPercent = item.totalBudget ? Math.min(100, (item.spentBudget + item.reservedBudget) / item.totalBudget * 100) : 0;
        return <article className="voucher-campaign" key={item.id}>
          <div className={`voucher-campaign__icon is-${item.benefitScope}`}>{item.benefitScope === "shipping" ? <LocalShippingOutlinedIcon /> : <LocalOfferOutlinedIcon />}</div>
          <div className="voucher-campaign__body"><div className="voucher-campaign__title"><div><code>{item.code}</code><h3>{item.name}</h3></div><span className={`is-${item.effectiveStatus}`}>{STATUS_LABEL[item.effectiveStatus]}</span></div>
            <p>{item.description || `${item.benefitScope === "shipping" ? "Giảm phí giao hàng" : "Giảm tiền món"} · ${TARGET_LABEL[item.targetScope]}`}</p>
            <div className="voucher-campaign__chips"><span>{item.discountType === "percent" ? `${item.discountValue}%${item.maxDiscount ? ` · tối đa ${money(item.maxDiscount)}` : ""}` : money(item.discountValue)}</span><span>Đơn từ {money(item.minOrderValue)}</span><span>{TARGET_LABEL[item.targetScope]}{item.targets.length ? ` (${item.targets.length})` : ""}</span><span>{item.distributionMode === "auto" ? "Tự động" : item.distributionMode === "claim" ? `Đã nhận ${item.claimedCount}/${item.claimLimitTotal ?? "∞"}` : `Đã tặng ${item.claimedCount}/${item.claimLimitTotal ?? "∞"}`}</span></div>
            <div className="voucher-campaign__progress"><div><span style={{ width: `${budgetPercent}%` }} /></div><small>{item.totalBudget ? `${money(item.spentBudget + item.reservedBudget)} / ${money(item.totalBudget)}` : "Ngân sách không giới hạn"} · {item.usedCount}/{item.usageLimitTotal ?? "∞"} lượt</small></div>
          </div>
          <div className="voucher-campaign__actions">{mode === "admin" && item.distributionMode === "assigned" && item.effectiveStatus === "active" && <button type="button" disabled={pending} onClick={() => { setAssignEmail(""); setAssignTarget(item); }}>Tặng</button>}<button type="button" onClick={() => { setNotice(null); setEditor(fromItem(item)); setShowForm(true); }}>Sửa</button>{item.status === "active" ? <button type="button" disabled={pending} onClick={() => changeStatus(item.id, "paused")}>Tạm dừng</button> : item.status !== "archived" && <button type="button" disabled={pending} onClick={() => changeStatus(item.id, "active")}>Kích hoạt</button>}<button type="button" disabled={pending || item.status === "archived"} onClick={() => changeStatus(item.id, "archived")}>Lưu trữ</button></div>
        </article>;
      })}
      {filtered.length === 0 && <div className="voucher-management__empty"><LocalOfferOutlinedIcon /><strong>Chưa có voucher trong nhóm này</strong><span>Tạo chiến dịch đầu tiên để bắt đầu.</span></div>}
    </div>
  </section>;
}
