"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";

import {
  applyFoodImageAction,
  createFoodImageUploadTicketAction,
  deleteFoodImageAction,
  discardFoodImageUploadAction,
  reorderOwnerFoodsAction,
  saveOwnerFoodAction,
  setOwnerFoodStateAction,
} from "@/app/owner/actions";
import type {
  OwnerActionResult,
  OwnerFood,
  OwnerFoodInput,
  OwnerMenuData,
  OwnerToppingGroup,
} from "@/types/owner";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "food-media";
const MAX_BYTES = 5 * 1024 * 1024;
const FILE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function emptyDraft(): OwnerFoodInput {
  return { name: "", description: "", basePrice: 0, isAvailable: true,
    categoryId: "", tagIds: [], sizes: [], toppingGroups: [] };
}

function foodDraft(food: OwnerFood): OwnerFoodInput {
  return { id: food.id, expectedUpdatedAt: food.updatedAt, name: food.name,
    description: food.description, basePrice: food.basePrice,
    isAvailable: food.isAvailable, categoryId: food.category?.id ?? "",
    tagIds: food.tags.map((tag) => tag.id), sizes: food.sizes.map((item) => ({ ...item })),
    toppingGroups: food.toppingGroups.map((group) => ({ ...group,
      toppings: group.toppings.map((item) => ({ ...item })) })) };
}

export default function OwnerMenuManager({
  restaurantId,
  data,
}: {
  restaurantId: string;
  data: OwnerMenuData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<OwnerActionResult | null>(null);
  const [foods, setFoods] = useState(data.foods);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<OwnerFoodInput | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => setFoods(data.foods), [data.foods]);

  const filtered = useMemo(() => foods.filter((food) => {
    const query = search.trim().toLocaleLowerCase("vi");
    return (!query || food.name.toLocaleLowerCase("vi").includes(query)) &&
      (category === "all" || food.category?.id === category) &&
      (status === "all" || (status === "visible" && food.isPublic && food.isAvailable) ||
        (status === "soldout" && food.isPublic && !food.isAvailable) ||
        (status === "hidden" && !food.isPublic));
  }), [foods, search, category, status]);
  const canReorder = !search.trim() && category === "all" && status === "all";

  const run = (task: () => Promise<OwnerActionResult>) => startTransition(async () => {
    const result = await task(); setNotice(result); if (result.ok) router.refresh();
  });

  const move = (index: number, direction: -1 | 1) => {
    if (!canReorder) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= foods.length) return;
    const reordered = [...foods];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setFoods(reordered);
    run(() => reorderOwnerFoodsAction(restaurantId,
      reordered.map((food, order) => ({ id: food.id, displayOrder: order * 10 }))));
  };

  const toggle = (food: OwnerFood, field: "public" | "stock") => {
    const isPublic = field === "public" ? !food.isPublic : food.isPublic;
    const isAvailable = field === "stock" ? !food.isAvailable : food.isAvailable;
    run(() => setOwnerFoodStateAction(food.id, isPublic, isAvailable));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const chosenFile = imageFile;
    if (chosenFile && (!FILE_TYPES[chosenFile.type] || chosenFile.size > MAX_BYTES)) {
      setNotice({ ok: false, message: "Ảnh phải là JPG/PNG/WebP/AVIF và không quá 5 MB." });
      return;
    }
    startTransition(async () => {
      try {
      let result = await saveOwnerFoodAction(restaurantId, editing);
      if (!result.ok || !result.foodId) { setNotice(result); return; }
      // Keep the newly created id in the editor. If Storage fails, retrying
      // updates this food instead of creating a duplicate row.
      if (!editing.id) setEditing((current) => current ? { ...current, id: result.foodId } : current);
      if (chosenFile) {
        const supabase = createClient();
        const ticket = await createFoodImageUploadTicketAction(result.foodId, chosenFile.type);
        if (!ticket.ok) {
          setNotice({ ok: false, message: `${result.message} ${ticket.message} Bấm “Lưu món ăn” để thử lại.` });
          router.refresh(); return;
        }
        const upload = await supabase.storage.from(BUCKET).uploadToSignedUrl(
          ticket.objectPath, ticket.token, chosenFile, {
          contentType: chosenFile.type, upsert: false,
        });
        if (upload.error) {
          console.error("[owner] Upload ảnh món thất bại", upload.error);
          setNotice({ ok: false, message: `${result.message} Không thể tải ảnh lên (${upload.error.message}). Bấm “Lưu món ăn” để thử lại.` });
          router.refresh(); return;
        }
        const imageResult = await applyFoodImageAction(result.foodId, ticket.objectPath, editing.name);
        if (!imageResult.ok) {
          await discardFoodImageUploadAction(result.foodId, ticket.objectPath);
          setNotice(imageResult); router.refresh(); return;
        }
        result = { ...result, message: `${result.message} Đã cập nhật ảnh chính.` };
      }
      setNotice(result); setEditing(null); setImageFile(null); router.refresh();
      } catch (error) {
        console.error("[owner] Luồng lưu món và tải ảnh bị gián đoạn", error);
        setNotice({ ok: false, message: "Kết nối bị gián đoạn khi lưu món hoặc tải ảnh. Dữ liệu món đã lưu (nếu có) sẽ được dùng lại khi thử lại." });
        router.refresh();
      }
    });
  };

  if (editing) {
    const existing = editing.id ? foods.find((food) => food.id === editing.id) : undefined;
    const currentImage = existing?.images.find((item) => item.isPrimary) ?? existing?.images[0];
    return <FoodEditor data={data} draft={editing} imageFile={imageFile}
      currentImage={currentImage}
      pending={pending} onChange={setEditing} onImage={setImageFile}
      onCancel={() => { setEditing(null); setImageFile(null); }} onSubmit={submit}
      onDeleteImage={currentImage ? () => run(() => deleteFoodImageAction(currentImage.id)) : undefined}
      notice={notice} />;
  }

  return <section className="owner-menu">
    <div className="owner-menu__heading"><div><p>Quản lý theo từng nhà hàng</p><h2>Thực đơn</h2><span>Mỗi món có một category chính và có thể gắn nhiều tag.</span></div><button disabled={pending} onClick={() => setEditing(emptyDraft())}>+ Thêm món</button></div>
    {notice && <div className={`owner-notice ${notice.ok ? "is-success" : "is-error"}`} role="status">{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}
    <div className="owner-menu__filters">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên món..." />
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Tất cả trạng thái</option><option value="visible">Đang bán</option><option value="soldout">Tạm hết</option><option value="hidden">Đang ẩn</option></select>
    </div>
    <div className="owner-menu__layout">
      <aside className="owner-menu__categories">
        <div><h3>Danh mục</h3><span>{foods.length} món</span></div>
        <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}><span>Tất cả món</span><b>{foods.length}</b></button>
        {data.categories.filter((item) => item.isActive).map((item) => <button type="button" key={item.id} className={category === item.id ? "is-active" : ""} onClick={() => setCategory(item.id)}><span>{item.name}</span><b>{foods.filter((food) => food.category?.id === item.id).length}</b></button>)}
      </aside>
      <div className="owner-menu__catalog">
        {!canReorder && <p className="owner-menu__reorder-note">Xóa bộ lọc để sắp xếp toàn bộ menu.</p>}
        <div className="owner-menu-list">
      {filtered.map((food) => {
        const originalIndex = foods.findIndex((item) => item.id === food.id);
        const image = food.images.find((item) => item.isPrimary) ?? food.images[0];
        const availableSizes = food.sizes.filter((size) => size.isAvailable);
        return <article className="owner-menu-item" key={food.id}>
          <div className="owner-menu-item__image">{image ? <img src={image.url} alt={image.altText || food.name} /> : <span>Chưa có ảnh</span>}</div>
          <div className="owner-menu-item__content"><div><h3>{food.name}</h3><p>{food.category?.name || "Chưa chọn category"}{food.tags.length ? ` · ${food.tags.map((tag) => tag.name).join(", ")}` : ""}</p></div><strong>{availableSizes.length ? `Từ ${money(Math.min(...availableSizes.map((size) => size.price)))}` : money(food.basePrice)}</strong><div className="owner-menu-item__badges"><span className={food.isPublic ? "is-visible" : "is-hidden"}>{food.isPublic ? "Đang hiển thị" : "Đang ẩn"}</span><span className={food.isAvailable ? "is-stock" : "is-soldout"}>{food.isAvailable ? "Còn hàng" : "Tạm hết"}</span></div></div>
          <div className="owner-menu-item__actions">
            <button disabled={pending} onClick={() => toggle(food, "public")}>{food.isPublic ? "Ẩn món" : "Bật món"}</button>
            <button disabled={pending} onClick={() => toggle(food, "stock")}>{food.isAvailable ? "Đánh dấu hết" : "Còn hàng"}</button>
            <button disabled={pending} onClick={() => setEditing(foodDraft(food))}>Sửa</button>
            <div><button aria-label="Đưa món lên" disabled={pending || !canReorder || originalIndex === 0} onClick={() => move(originalIndex, -1)}>↑</button><button aria-label="Đưa món xuống" disabled={pending || !canReorder || originalIndex === foods.length - 1} onClick={() => move(originalIndex, 1)}>↓</button></div>
          </div>
        </article>;
      })}
      {!filtered.length && <div className="owner-menu-empty"><strong>Chưa có món phù hợp</strong><span>Thêm món mới hoặc thay đổi bộ lọc.</span></div>}
        </div>
      </div>
    </div>
  </section>;
}

function FoodEditor({ data, draft, imageFile, currentImage, pending, notice, onChange, onImage, onCancel, onSubmit, onDeleteImage }: {
  data: OwnerMenuData; draft: OwnerFoodInput; imageFile: File | null;
  currentImage?: OwnerFood["images"][number]; pending: boolean; notice: OwnerActionResult | null;
  onChange: (value: OwnerFoodInput) => void; onImage: (value: File | null) => void;
  onCancel: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteImage?: () => void;
}) {
  const set = <K extends keyof OwnerFoodInput>(key: K, value: OwnerFoodInput[K]) => onChange({ ...draft, [key]: value });
  const updateGroup = (index: number, value: OwnerToppingGroup) => {
    const next = [...draft.toppingGroups]; next[index] = value; set("toppingGroups", next);
  };
  return <section className="owner-card owner-food-editor">
    <div className="owner-card__heading"><div><p>Thực đơn / {draft.id ? "Chỉnh sửa" : "Tạo mới"}</p><h2>{draft.id ? draft.name : "Thêm món ăn"}</h2><span>Món mới luôn được lưu ở trạng thái ẩn. Hãy thêm ảnh rồi bật món trong danh sách.</span></div><button type="button" onClick={onCancel}>Quay lại</button></div>
    {notice && <div className={`owner-notice ${notice.ok ? "is-success" : "is-error"}`}>{notice.message}</div>}
    <form onSubmit={onSubmit} className="owner-food-form">
      <fieldset><legend>Thông tin món</legend><div className="owner-form">
        <label>Tên món<input value={draft.name} onChange={(e) => set("name", e.target.value)} required maxLength={120} /></label>
        <label>Giá bán cơ bản<input type="number" min="0" max="100000000" step="1000" value={draft.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} required /></label>
        <label className="full">Mô tả<textarea rows={4} maxLength={1000} value={draft.description} onChange={(e) => set("description", e.target.value)} /></label>
        <label>Category chính<select value={draft.categoryId} onChange={(e) => set("categoryId", e.target.value)} required><option value="">Chọn category do Admin tạo</option>{data.categories.filter((item) => item.isActive || item.id === draft.categoryId).map((item) => <option key={item.id} value={item.id}>{item.name}{!item.isActive ? " (đã tắt)" : ""}</option>)}</select></label>
        <label className="owner-switch"><input type="checkbox" checked={draft.isAvailable} onChange={(e) => set("isAvailable", e.target.checked)} /> Món đang còn hàng</label>
      </div></fieldset>

      <fieldset><legend>Tag do Admin tạo</legend><div className="owner-tag-picker">{data.tags.filter((item) => item.isActive || draft.tagIds.includes(item.id)).map((item) => <label key={item.id} className={!item.isActive ? "is-disabled" : ""}><input type="checkbox" checked={draft.tagIds.includes(item.id)} disabled={!item.isActive && !draft.tagIds.includes(item.id)} onChange={(e) => set("tagIds", e.target.checked ? [...draft.tagIds, item.id] : draft.tagIds.filter((id) => id !== item.id))} />{item.name}{!item.isActive ? " (đã tắt)" : ""}</label>)}</div><p className="owner-field-note">Owner chỉ được chọn, không thể tạo category hoặc tag toàn hệ thống.</p></fieldset>

      <fieldset><legend>Ảnh món ăn</legend><div className="owner-food-image-editor">{currentImage && <div><img src={currentImage.url} alt={currentImage.altText || draft.name} />{onDeleteImage && <button type="button" disabled={pending} onClick={onDeleteImage}>Xóa ảnh</button>}</div>}<label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => onImage(e.target.files?.[0] ?? null)} />{imageFile ? imageFile.name : currentImage ? "Chọn ảnh mới để thay thế" : "Chọn ảnh chính (tối đa 5 MB)"}</label></div></fieldset>

      <fieldset><legend>Size và giá theo size</legend><button type="button" className="owner-add-row" onClick={() => set("sizes", [...draft.sizes, { name: "", price: draft.basePrice, isAvailable: true, displayOrder: draft.sizes.length * 10 }])}>+ Thêm size</button><div className="owner-option-list">{draft.sizes.map((size, index) => <div className={`owner-option-row ${!size.isAvailable ? "is-disabled" : ""}`} key={size.id ?? `size-${index}`}><input aria-label="Tên size" placeholder="S / M / L" value={size.name} onChange={(e) => { const next = [...draft.sizes]; next[index] = { ...size, name: e.target.value }; set("sizes", next); }} /><input aria-label="Giá size" type="number" min="0" step="1000" value={size.price} onChange={(e) => { const next = [...draft.sizes]; next[index] = { ...size, price: Number(e.target.value) }; set("sizes", next); }} /><label><input type="checkbox" checked={size.isAvailable} onChange={(e) => { const next = [...draft.sizes]; next[index] = { ...size, isAvailable: e.target.checked }; set("sizes", next); }} /> Còn hàng</label>{size.id ? <span className="owner-option-hint">Tắt “Còn hàng” để ngừng dùng</span> : <button type="button" onClick={() => set("sizes", draft.sizes.filter((_, itemIndex) => itemIndex !== index))}>Bỏ</button>}</div>)}</div></fieldset>

      <fieldset><legend>Nhóm topping</legend><button type="button" className="owner-add-row" onClick={() => set("toppingGroups", [...draft.toppingGroups, { name: "", description: "", minSelect: 0, maxSelect: 1, isAvailable: true, displayOrder: draft.toppingGroups.length * 10, toppings: [] }])}>+ Thêm nhóm topping</button><div className="owner-topping-groups">{draft.toppingGroups.map((group, groupIndex) => <div className={`owner-topping-group ${!group.isAvailable ? "is-disabled" : ""}`} key={group.id ?? `group-${groupIndex}`}><div className="owner-topping-group__heading"><input placeholder="Tên nhóm, ví dụ: Chọn loại sốt" value={group.name} onChange={(e) => updateGroup(groupIndex, { ...group, name: e.target.value })} /><label>Tối thiểu<input type="number" min="0" value={group.minSelect} onChange={(e) => updateGroup(groupIndex, { ...group, minSelect: Number(e.target.value) })} /></label><label>Tối đa<input type="number" min="1" value={group.maxSelect} onChange={(e) => updateGroup(groupIndex, { ...group, maxSelect: Number(e.target.value) })} /></label><label><input type="checkbox" checked={group.isAvailable} onChange={(e) => updateGroup(groupIndex, { ...group, isAvailable: e.target.checked })} /> Hoạt động</label>{!group.id && <button type="button" onClick={() => set("toppingGroups", draft.toppingGroups.filter((_, index) => index !== groupIndex))}>Bỏ nhóm</button>}</div><input className="owner-topping-description" placeholder="Mô tả nhóm (không bắt buộc)" value={group.description} onChange={(e) => updateGroup(groupIndex, { ...group, description: e.target.value })} /><div className="owner-option-list">{group.toppings.map((item, itemIndex) => <div className={`owner-option-row ${!item.isAvailable ? "is-disabled" : ""}`} key={item.id ?? `topping-${itemIndex}`}><input placeholder="Tên topping" value={item.name} onChange={(e) => { const toppings = [...group.toppings]; toppings[itemIndex] = { ...item, name: e.target.value }; updateGroup(groupIndex, { ...group, toppings }); }} /><input type="number" min="0" step="1000" value={item.price} onChange={(e) => { const toppings = [...group.toppings]; toppings[itemIndex] = { ...item, price: Number(e.target.value) }; updateGroup(groupIndex, { ...group, toppings }); }} /><label><input type="checkbox" checked={item.isAvailable} onChange={(e) => { const toppings = [...group.toppings]; toppings[itemIndex] = { ...item, isAvailable: e.target.checked }; updateGroup(groupIndex, { ...group, toppings }); }} /> Còn hàng</label>{item.id ? <span className="owner-option-hint">Tắt để ngừng dùng</span> : <button type="button" onClick={() => updateGroup(groupIndex, { ...group, toppings: group.toppings.filter((_, index) => index !== itemIndex) })}>Bỏ</button>}</div>)}<button type="button" className="owner-add-row" onClick={() => updateGroup(groupIndex, { ...group, toppings: [...group.toppings, { name: "", price: 0, isAvailable: true, displayOrder: group.toppings.length * 10 }] })}>+ Thêm topping</button></div></div>)}</div></fieldset>

      <div className="owner-food-form__actions"><button type="button" onClick={onCancel}>Hủy</button><button disabled={pending}>{pending ? "Đang lưu..." : "Lưu món ăn"}</button></div>
    </form>
  </section>;
}
