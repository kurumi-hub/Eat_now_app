import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Link from "next/link";

export default function OwnerAddDishPage() {
  return (
    <section className="owner-add-dish-page" aria-labelledby="owner-add-dish-title">
      <div className="owner-add-dish-page__background" aria-hidden="true">
        <div className="owner-add-dish-page__fake-card" />
        <div className="owner-add-dish-page__fake-card" />
        <div className="owner-add-dish-page__fake-card" />
      </div>

      <article className="owner-add-dish-modal">
        <header>
          <h1 id="owner-add-dish-title">Thêm món mới</h1>
          <Link href="/owner/menu" aria-label="Đóng form thêm món">
            <CloseIcon />
          </Link>
        </header>

        <div className="owner-add-dish-modal__body">
          <label className="owner-form-label">Hình ảnh món ăn</label>
          <button className="owner-upload-box" type="button">
            <span>
              <AddPhotoAlternateOutlinedIcon />
            </span>
            <strong>Kéo thả hoặc nhấp để tải ảnh lên</strong>
            <small>Ảnh vuông hoặc tỷ lệ 4:3 được khuyến nghị (JPG, PNG)</small>
          </button>

          <div className="owner-form-grid">
            <label className="owner-form-field">
              <span>
                Tên món ăn <b>*</b>
              </span>
              <input placeholder="Ví dụ: Cơm Tấm Sườn Bì" />
              <small>Vui lòng nhập tên món</small>
            </label>
            <label className="owner-form-field">
              <span>
                Danh mục <b>*</b>
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

          <label className="owner-form-field">
            <span>
              Giá cơ bản <b>*</b>
            </span>
            <div className="owner-form-field__with-suffix">
              <input defaultValue="65.000" />
              <em>đ</em>
            </div>
          </label>

          <label className="owner-form-field">
            <span>Mô tả món ăn</span>
            <textarea placeholder="Mô tả chi tiết nguyên liệu, hương vị..." rows={3} />
          </label>

          <div className="owner-option-header">
            <h2>Tuỳ chọn món</h2>
            <button type="button">
              <AddIcon />
              Thêm nhóm tuỳ chọn
            </button>
          </div>

          <section className="owner-option-group">
            <div className="owner-option-group__summary">
              <div>
                <strong>Size</strong>
                <span>Bắt buộc • Chọn một</span>
              </div>
              <ExpandLessIcon />
            </div>
            {["Nhỏ (+0đ)", "Vừa (+10.000đ)", "Lớn (+20.000đ)"].map((option) => (
              <div className="owner-option-row" key={option}>
                <span>{option}</span>
                <div>
                  <EditOutlinedIcon />
                  <DeleteOutlinedIcon />
                </div>
              </div>
            ))}
            <button className="owner-option-group__add" type="button">
              <AddIcon />
              Thêm lựa chọn
            </button>
          </section>

          <section className="owner-option-group owner-option-group--collapsed">
            <div className="owner-option-group__summary">
              <div>
                <strong>Topping</strong>
                <span>3 lựa chọn • Tùy chọn</span>
              </div>
              <ExpandMoreIcon />
            </div>
          </section>

          <label className="owner-sell-toggle">
            <span>
              <strong>Sẵn sàng bán</strong>
              <small>Món ăn sẽ hiển thị với khách hàng khi cửa hàng đang mở.</small>
            </span>
            <input type="checkbox" defaultChecked />
          </label>
        </div>

        <footer>
          <Link href="/owner/menu">Huỷ</Link>
          <button type="button">
            <SaveOutlinedIcon />
            Lưu món ăn
          </button>
        </footer>
      </article>
    </section>
  );
}
