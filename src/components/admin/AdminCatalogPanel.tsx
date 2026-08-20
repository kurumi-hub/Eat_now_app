"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  TextField,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";

import {
  applyCategoryMediaAction,
  createCategoryAction,
  createTagAction,
  deleteCategoryAction,
  deleteTagAction,
  removeCategoryMediaAction,
  reorderCategoriesAction,
  reorderTagsAction,
  setCategoryActiveAction,
  setTagActiveAction,
  updateCategoryAction,
  updateTagAction,
} from "@/app/admin/actions";
import type {
  AdminActionResult,
  AdminCatalogKind,
  AdminCategory,
  AdminCategoryList,
  AdminTag,
  AdminTagList,
} from "@/types/admin";
import { signalNavigationStart } from "@/utils/navigationFeedback";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

const CATALOG_MEDIA_BUCKET = "catalog-media";
const CATALOG_MEDIA_MAX_BYTES = 2 * 1024 * 1024;
const CATALOG_MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

type CatalogItem = AdminCategory | AdminTag;
type CatalogDialog =
  | { mode: "create" }
  | { mode: "edit"; target: CatalogItem }
  | { mode: "delete"; target: CatalogItem };

type AdminCatalogPanelProps = {
  kind: AdminCatalogKind;
  categories: AdminCategoryList;
  tags: AdminTagList;
  searchTerm: string;
  statusFilter: string;
};

function isCategory(item: CatalogItem): item is AdminCategory {
  return "icon_url" in item;
}

function catalogUrl(
  kind: AdminCatalogKind,
  search = "",
  status = "",
  page = 1
) {
  const params = new URLSearchParams({ tab: "catalog", catalog: kind });
  if (search) params.set("q", search);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return `/admin?${params.toString()}`;
}

export default function AdminCatalogPanel({
  kind,
  categories,
  tags,
  searchTerm,
  statusFilter,
}: AdminCatalogPanelProps) {
  const router = useRouter();
  const list = kind === "categories" ? categories : tags;
  const items: CatalogItem[] = list.items;
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchTerm);
  const [dialog, setDialog] = useState<CatalogDialog | null>(null);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [fieldError, setFieldError] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const notify = (result: AdminActionResult) => {
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.ok ? "success" : "error",
    });
  };

  const runAction = (
    action: () => Promise<AdminActionResult>,
    onSuccess?: () => void
  ) => {
    startTransition(async () => {
      try {
        const result = await action();
        notify(result);
        if (result.ok) {
          onSuccess?.();
          router.refresh();
        }
      } catch {
        notify({ ok: false, message: "Kết nối bị gián đoạn. Vui lòng thử lại." });
      }
    });
  };

  const navigate = (url: string) => {
    signalNavigationStart();
    startTransition(() => router.push(url));
  };

  const openCreate = () => {
    const nextOrder = items.length
      ? Math.max(...items.map((item) => item.display_order)) + 10
      : list.offset + 10;
    setName("");
    setDisplayOrder(String(nextOrder));
    setIsActive(true);
    setFieldError("");
    setDialog({ mode: "create" });
  };

  const openEdit = (target: CatalogItem) => {
    setName(target.name);
    setDisplayOrder(String(target.display_order));
    setIsActive(target.is_active);
    setFieldError("");
    setDialog({ mode: "edit", target });
  };

  const submitEditor = () => {
    if (!dialog || dialog.mode === "delete") return;
    const normalizedName = name.trim();
    const normalizedOrder = Number(displayOrder);
    const maxLength = kind === "categories" ? 120 : 80;
    if (!normalizedName || normalizedName.length > maxLength) {
      setFieldError(`Tên phải từ 1 đến ${maxLength} ký tự.`);
      return;
    }
    if (!Number.isInteger(normalizedOrder) || normalizedOrder < 0) {
      setFieldError("Thứ tự hiển thị phải là số nguyên lớn hơn hoặc bằng 0.");
      return;
    }

    let action: () => Promise<AdminActionResult>;
    if (dialog.mode === "create") {
      action = kind === "categories"
        ? () => createCategoryAction(normalizedName, normalizedOrder, isActive)
        : () => createTagAction(normalizedName, normalizedOrder, isActive);
    } else {
      const targetId = dialog.target.id;
      action = kind === "categories"
        ? () => updateCategoryAction(targetId, normalizedName, normalizedOrder)
        : () => updateTagAction(targetId, normalizedName, normalizedOrder);
    }
    runAction(action, () => setDialog(null));
  };

  const confirmDelete = () => {
    if (!dialog || dialog.mode !== "delete") return;
    const action = kind === "categories"
      ? () => deleteCategoryAction(dialog.target.id)
      : () => deleteTagAction(dialog.target.id);
    runAction(action, () => setDialog(null));
  };

  const toggleItem = (item: CatalogItem) => {
    runAction(() => kind === "categories"
      ? setCategoryActiveAction(item.id, !item.is_active)
      : setTagActiveAction(item.id, !item.is_active));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (searchTerm || statusFilter) {
      notify({
        ok: false,
        message: "Hãy bỏ tìm kiếm và bộ lọc trước khi sắp xếp.",
      });
      return;
    }
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    const orderItems = reordered.map((item, itemIndex) => ({
      id: item.id,
      display_order: (list.offset + itemIndex + 1) * 10,
    }));
    runAction(() => kind === "categories"
      ? reorderCategoriesAction(orderItems)
      : reorderTagsAction(orderItems));
  };

  const uploadCategoryImage = async (
    event: ChangeEvent<HTMLInputElement>,
    category: AdminCategory
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const extension = CATALOG_MEDIA_TYPES[file.type];
    if (!extension) {
      notify({ ok: false, message: "Chỉ hỗ trợ JPG, PNG, WebP hoặc AVIF." });
      input.value = "";
      return;
    }
    if (file.size > CATALOG_MEDIA_MAX_BYTES) {
      notify({ ok: false, message: "Ảnh danh mục không được lớn hơn 2 MB." });
      input.value = "";
      return;
    }

    setUploadingId(category.id);
    const supabase = createBrowserClient();
    const objectPath = `categories/${category.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(CATALOG_MEDIA_BUCKET)
      .upload(objectPath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) {
      notify({ ok: false, message: "Không thể tải ảnh lên Supabase Storage." });
      setUploadingId(null);
      input.value = "";
      return;
    }

    try {
      const result = await applyCategoryMediaAction(
        category.id,
        objectPath,
        category.icon_alt_text || `Danh mục ${category.name}`
      );
      if (!result.ok) {
        await supabase.storage.from(CATALOG_MEDIA_BUCKET).remove([objectPath]);
      }
      notify(result);
      if (result.ok) router.refresh();
    } catch {
      await supabase.storage.from(CATALOG_MEDIA_BUCKET).remove([objectPath]);
      notify({ ok: false, message: "Không thể áp dụng ảnh danh mục." });
    } finally {
      setUploadingId(null);
      input.value = "";
    }
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(catalogUrl(kind, search.trim(), statusFilter));
  };

  const dialogTitle = dialog?.mode === "create"
    ? `Tạo ${kind === "categories" ? "danh mục" : "tag"}`
    : dialog?.mode === "edit"
      ? `Cập nhật ${kind === "categories" ? "danh mục" : "tag"}`
      : `Xóa ${kind === "categories" ? "danh mục" : "tag"}`;

  return (
    <section className="admin-panel admin-catalog-panel">
      <div className="admin-catalog-heading">
        <div>
          <h2>Admin Catalog</h2>
          <p>Quản lý taxonomy dùng chung cho món ăn và giao diện khách hàng.</p>
        </div>
        <button type="button" className="admin-button admin-button--primary" onClick={openCreate}>
          <AddRoundedIcon /> Thêm {kind === "categories" ? "danh mục" : "tag"}
        </button>
      </div>

      <div className="admin-catalog-switch" role="tablist" aria-label="Loại catalog">
        <button
          type="button"
          role="tab"
          aria-selected={kind === "categories"}
          className={kind === "categories" ? "is-active" : ""}
          onClick={() => navigate(catalogUrl("categories"))}
        >
          <CategoryOutlinedIcon /> Danh mục
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === "tags"}
          className={kind === "tags" ? "is-active" : ""}
          onClick={() => navigate(catalogUrl("tags"))}
        >
          <LabelOutlinedIcon /> Tag món ăn
        </button>
      </div>

      <form className="admin-search" onSubmit={submitSearch}>
        <SearchOutlinedIcon />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={kind === "categories" ? "Tìm danh mục" : "Tìm tag"}
          maxLength={80}
        />
        <button type="submit">Tìm</button>
      </form>

      <div className="admin-filters">
        {[["", "Tất cả"], ["active", "Đang bật"], ["inactive", "Đã tắt"]].map(
          ([value, label]) => (
            <button
              key={value || "all"}
              type="button"
              className={statusFilter === value ? "is-active" : ""}
              onClick={() => navigate(catalogUrl(kind, search.trim(), value))}
            >
              {label}
            </button>
          )
        )}
      </div>

      {searchTerm || statusFilter ? null : (
        <Alert severity="info" className="admin-catalog-order-note">
          Dùng nút mũi tên để sắp xếp trong trang, hoặc nhập thứ tự chính xác khi chỉnh sửa.
        </Alert>
      )}

      <div className="admin-catalog-list">
        {items.length === 0 ? (
          <div className="admin-empty">
            <CategoryOutlinedIcon />
            <h3>Không tìm thấy dữ liệu catalog</h3>
            <p>Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
          </div>
        ) : items.map((item, index) => (
          <article className="admin-catalog-row" key={item.id}>
            <div className="admin-catalog-row__media">
              {isCategory(item) && item.icon_url ? (
                <Image
                  src={item.icon_url}
                  alt={item.icon_alt_text || item.name}
                  width={52}
                  height={52}
                  unoptimized
                />
              ) : kind === "categories" ? (
                <CategoryOutlinedIcon />
              ) : (
                <LabelOutlinedIcon />
              )}
            </div>
            <div className="admin-catalog-row__body">
              <div className="admin-row-title">
                <h3>{item.name}</h3>
                <span className={`admin-status admin-status--${item.is_active ? "active" : "suspended"}`}>
                  {item.is_active ? "Đang bật" : "Đã tắt"}
                </span>
              </div>
              <p>
                Thứ tự <strong>{item.display_order}</strong> · Đang dùng cho{" "}
                <strong>{item.usage_count}</strong> món
              </p>
            </div>
            <div className="admin-catalog-row__order" aria-label={`Sắp xếp ${item.name}`}>
              <IconButton
                aria-label="Đưa lên"
                disabled={isPending || index === 0 || Boolean(searchTerm || statusFilter)}
                onClick={() => moveItem(index, -1)}
              >
                <ArrowUpwardRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Đưa xuống"
                disabled={isPending || index === items.length - 1 || Boolean(searchTerm || statusFilter)}
                onClick={() => moveItem(index, 1)}
              >
                <ArrowDownwardRoundedIcon />
              </IconButton>
            </div>
            <div className="admin-row-actions admin-catalog-row__actions">
              {isCategory(item) ? (
                <>
                  <label className="admin-catalog-upload">
                    {uploadingId === item.id ? <CircularProgress size={15} /> : <CloudUploadOutlinedIcon />}
                    <span>Ảnh</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={isPending || uploadingId !== null}
                      onChange={(event) => uploadCategoryImage(event, item)}
                    />
                  </label>
                  {item.icon_url ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => runAction(() => removeCategoryMediaAction(item.id))}
                    >
                      <ImageNotSupportedOutlinedIcon /> Gỡ ảnh
                    </button>
                  ) : null}
                </>
              ) : null}
              <button type="button" disabled={isPending} onClick={() => openEdit(item)}>
                <EditOutlinedIcon /> Sửa
              </button>
              <button type="button" disabled={isPending} onClick={() => toggleItem(item)}>
                {item.is_active ? "Tắt" : "Bật"}
              </button>
              <button
                type="button"
                className="is-danger"
                disabled={isPending || item.usage_count > 0}
                title={item.usage_count > 0 ? `Đang được ${item.usage_count} món sử dụng` : undefined}
                onClick={() => setDialog({ mode: "delete", target: item })}
              >
                <DeleteOutlineRoundedIcon /> Xóa
              </button>
            </div>
          </article>
        ))}
      </div>

      <CatalogPagination
        total={list.total}
        limit={list.limit}
        offset={list.offset}
        disabled={isPending}
        onPage={(page) => navigate(catalogUrl(kind, searchTerm, statusFilter, page))}
      />

      <Dialog
        open={Boolean(dialog)}
        onClose={isPending ? undefined : () => setDialog(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "admin-dialog" } }}
      >
        {dialog ? (
          <>
            <DialogTitle className="admin-dialog__title">
              <span>{dialogTitle}</span>
              <IconButton aria-label="Đóng" onClick={() => setDialog(null)} disabled={isPending}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {dialog.mode === "delete" ? (
                <Alert severity="warning">
                  Xóa vĩnh viễn <strong>{dialog.target.name}</strong>? Thao tác chỉ thành công
                  khi chưa có món ăn nào sử dụng.
                </Alert>
              ) : (
                <div className="admin-catalog-editor">
                  <TextField
                    autoFocus
                    fullWidth
                    label={kind === "categories" ? "Tên danh mục" : "Tên tag"}
                    value={name}
                    error={Boolean(fieldError)}
                    helperText={fieldError || `${name.trim().length}/${kind === "categories" ? 120 : 80} ký tự`}
                    slotProps={{
                      htmlInput: { maxLength: kind === "categories" ? 120 : 80 },
                    }}
                    onChange={(event) => {
                      setName(event.target.value);
                      setFieldError("");
                    }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Thứ tự hiển thị"
                    value={displayOrder}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    onChange={(event) => {
                      setDisplayOrder(event.target.value);
                      setFieldError("");
                    }}
                  />
                  {dialog.mode === "create" ? (
                    <FormControlLabel
                      control={
                        <Checkbox checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                      }
                      label="Bật ngay sau khi tạo"
                    />
                  ) : null}
                </div>
              )}
            </DialogContent>
            <DialogActions className="admin-dialog__actions">
              <button className="admin-button" type="button" disabled={isPending} onClick={() => setDialog(null)}>
                Hủy
              </button>
              <button
                className={`admin-button admin-button--primary${dialog.mode === "delete" ? " is-danger" : ""}`}
                type="button"
                disabled={isPending}
                onClick={dialog.mode === "delete" ? confirmDelete : submitEditor}
              >
                {isPending ? <CircularProgress size={17} color="inherit" /> : null}
                {dialog.mode === "delete" ? "Xóa vĩnh viễn" : "Lưu thay đổi"}
              </button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  );
}

function CatalogPagination({
  total,
  limit,
  offset,
  disabled,
  onPage,
}: {
  total: number;
  limit: number;
  offset: number;
  disabled: boolean;
  onPage: (page: number) => void;
}) {
  if (total <= limit && offset === 0) return null;
  const current = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <nav className="admin-pagination" aria-label="Phân trang catalog">
      <button type="button" disabled={disabled || current <= 1} onClick={() => onPage(current - 1)}>
        Trang trước
      </button>
      <span>Trang <strong>{current}</strong> / {pages}</span>
      <button type="button" disabled={disabled || current >= pages} onClick={() => onPage(current + 1)}>
        Trang sau
      </button>
    </nav>
  );
}
