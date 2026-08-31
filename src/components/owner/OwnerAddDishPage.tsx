import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Link from "next/link";

import * as ownerStyles from "@/components/owner/tailwindClasses";

export default function OwnerAddDishPage() {
  return (
    <section className={ownerStyles.addDishPageClassName} aria-labelledby="owner-add-dish-title">
      <div className={ownerStyles.addDishBackgroundClassName} aria-hidden="true">
        <div className={ownerStyles.addDishFakeCardClassName} />
        <div className={ownerStyles.addDishFakeCardClassName} />
        <div className={ownerStyles.addDishFakeCardClassName} />
      </div>

      <article className={ownerStyles.addDishModalClassName}>
        <header className={ownerStyles.addDishModalHeaderClassName}>
          <h1 className={ownerStyles.addDishModalTitleClassName} id="owner-add-dish-title">
            Thêm món mới
          </h1>
          <Link className={ownerStyles.addDishModalCloseClassName} href="/owner/menu" aria-label="Đóng form thêm món">
            <CloseIcon />
          </Link>
        </header>

        <div className={ownerStyles.addDishModalBodyClassName}>
          <label className={ownerStyles.formLabelClassName}>Hình ảnh món ăn</label>
          <button className={ownerStyles.uploadBoxClassName} type="button">
            <span className={ownerStyles.uploadIconClassName}>
              <AddPhotoAlternateOutlinedIcon />
            </span>
            <strong>Kéo thả hoặc nhấp để tải ảnh lên</strong>
            <small className={ownerStyles.uploadHelpClassName}>
              Ảnh vuông hoặc tỷ lệ 4:3 được khuyến nghị (JPG, PNG)
            </small>
          </button>

          <div className={ownerStyles.formGridClassName}>
            <label className={ownerStyles.formFieldClassName}>
              <span>
                Tên món ăn <b className={ownerStyles.requiredMarkClassName}>*</b>
              </span>
              <input placeholder="Ví dụ: Cơm Tấm Sườn Bì" />
              <small className={ownerStyles.formErrorClassName}>Vui lòng nhập tên món</small>
            </label>
            <label className={ownerStyles.formFieldClassName}>
              <span>
                Danh mục <b className={ownerStyles.requiredMarkClassName}>*</b>
              </span>
              <select defaultValue="">
                <option value="" disabled>
                  Chọn danh mục
                </option>
                <option>Cơm Tấm</option>
                <option>Phở</option>
                <option>Bánh Mì</option>
                <option>Đồ uống</option>
              </select>
            </label>
          </div>

          <label className={ownerStyles.formFieldClassName}>
            <span>
              Giá cơ bản <b className={ownerStyles.requiredMarkClassName}>*</b>
            </span>
            <div className={ownerStyles.withSuffixClassName}>
              <input defaultValue="65.000" />
              <em className={ownerStyles.suffixClassName}>đ</em>
            </div>
          </label>

          <label className={ownerStyles.formFieldClassName}>
            <span>Mô tả món ăn</span>
            <textarea placeholder="Mô tả chi tiết nguyên liệu, hương vị..." rows={3} />
          </label>

          <div className={ownerStyles.optionHeaderClassName}>
            <h2>Tuỳ chọn món</h2>
            <button type="button">
              <AddIcon />
              Thêm nhóm tuỳ chọn
            </button>
          </div>

          <section className={ownerStyles.optionGroupClassName}>
            <div className={ownerStyles.optionGroupSummaryClassName}>
              <div>
                <strong>Size</strong>
                <span className={ownerStyles.optionSummaryMetaClassName}>Bắt buộc • Chọn một</span>
              </div>
              <ExpandLessIcon />
            </div>
            {["Nhỏ (+0đ)", "Vừa (+10.000đ)", "Lớn (+20.000đ)"].map((option) => (
              <div className={ownerStyles.optionRowClassName} key={option}>
                <span>{option}</span>
                <div className={ownerStyles.optionRowActionsClassName}>
                  <EditOutlinedIcon />
                  <DeleteOutlinedIcon />
                </div>
              </div>
            ))}
            <button className={ownerStyles.optionGroupAddClassName} type="button">
              <AddIcon />
              Thêm lựa chọn
            </button>
          </section>

          <section className={ownerStyles.optionGroupClassName}>
            <div className={ownerStyles.optionGroupSummaryClassName}>
              <div>
                <strong>Topping</strong>
                <span className={ownerStyles.optionSummaryMetaClassName}>3 lựa chọn • Tùy chọn</span>
              </div>
              <ExpandMoreIcon />
            </div>
          </section>

          <label className={ownerStyles.sellToggleClassName}>
            <span>
              <strong>Sẵn sàng bán</strong>
              <small className={ownerStyles.sellToggleHelpClassName}>
                Món ăn sẽ hiển thị với khách hàng khi cửa hàng đang mở.
              </small>
            </span>
            <span className={ownerStyles.switchLabelClassName}>
              <input className={ownerStyles.switchInputClassName} type="checkbox" defaultChecked />
              <span className={ownerStyles.switchTrackClassName} />
            </span>
          </label>
        </div>

        <footer className={ownerStyles.addDishFooterClassName}>
          <Link className={ownerStyles.addDishCancelClassName} href="/owner/menu">
            Huỷ
          </Link>
          <button className={ownerStyles.addDishSaveClassName} type="button">
            <SaveOutlinedIcon />
            Lưu món ăn
          </button>
        </footer>
      </article>
    </section>
  );
}
