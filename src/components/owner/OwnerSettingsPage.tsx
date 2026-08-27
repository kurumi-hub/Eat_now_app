import AddIcon from "@mui/icons-material/Add";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";

import {
  ownerBusinessHours,
  ownerRestaurant,
  ownerStaffMembers,
} from "@/components/owner/ownerFlowData";

export default function OwnerSettingsPage() {
  return (
    <section className="owner-settings-page">
      <header className="owner-settings-topbar">
        <div>
          <h1>Cài đặt nhà hàng</h1>
          <p>Quản lý hồ sơ, vận hành và nhân sự của {ownerRestaurant.shortName}.</p>
        </div>
        <label className="owner-search-field">
          <SearchIcon />
          <input placeholder="Tìm kiếm cài đặt..." />
        </label>
        <button type="button" aria-label="Thông báo">
          <NotificationsNoneOutlinedIcon />
        </button>
      </header>

      <div className="owner-settings-content">
        <section className="owner-card owner-settings-section">
          <h2>Thông tin nhà hàng</h2>
          <div className="owner-settings-media">
            <div className="owner-cover-photo">
              <Image
                src="/images/home/hero.png"
                alt="Ảnh bìa nhà hàng"
                width={760}
                height={210}
              />
              <button type="button" aria-label="Đổi ảnh bìa">
                <CameraAltOutlinedIcon />
              </button>
            </div>
            <div className="owner-logo-photo">
              <Image
                src="/images/home/restaurant-com-tam.png"
                alt="Logo nhà hàng"
                width={126}
                height={126}
              />
              <button type="button" aria-label="Đổi logo">
                <EditOutlinedIcon />
              </button>
            </div>
          </div>

          <div className="owner-form-grid">
            <label className="owner-form-field">
              <span>Tên nhà hàng</span>
              <input defaultValue={ownerRestaurant.name} />
            </label>
            <label className="owner-form-field">
              <span>Loại ẩm thực</span>
              <select defaultValue={ownerRestaurant.category}>
                <option>{ownerRestaurant.category}</option>
                <option>Món Âu</option>
                <option>Món Á</option>
                <option>Thức uống</option>
              </select>
            </label>
            <label className="owner-form-field owner-form-field--wide">
              <span>Mô tả ngắn</span>
              <textarea defaultValue={ownerRestaurant.description} rows={2} />
            </label>
            <label className="owner-form-field owner-form-field--wide">
              <span>Địa chỉ</span>
              <input defaultValue={ownerRestaurant.address} />
            </label>
            <label className="owner-form-field">
              <span>Số điện thoại</span>
              <input defaultValue={ownerRestaurant.phone} />
            </label>
            <label className="owner-form-field">
              <span>Múi giờ</span>
              <input defaultValue="Asia/Ho_Chi_Minh" />
            </label>
          </div>
        </section>

        <section className="owner-card owner-settings-section">
          <div className="owner-section-header">
            <div>
              <h2>Giờ mở cửa</h2>
              <p>Thiết lập thời gian nhận đơn theo từng ngày.</p>
            </div>
            <button type="button">
              <AddIcon />
              Thêm khung giờ
            </button>
          </div>
          <div className="owner-hours-list">
            {ownerBusinessHours.map((item) => (
              <article key={item.day}>
                <div>
                  <strong>{item.day}</strong>
                  <span>{item.time}</span>
                </div>
                <button type="button" aria-label={`Sửa giờ ${item.day}`}>
                  <EditOutlinedIcon />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="owner-card owner-settings-section owner-operations-section">
          <div>
            <h2>Vận hành</h2>
            <p>Trạng thái nhận đơn và điều kiện hiển thị với khách hàng.</p>
          </div>
          <div className="owner-operation-row">
            <span>
              <CheckCircleOutlinedIcon />
              Đang nhận đơn
            </span>
            <label className="owner-switch">
              <input type="checkbox" defaultChecked />
              <span />
            </label>
          </div>
          <div className="owner-operation-row">
            <span>
              <CheckCircleOutlinedIcon />
              Nhà hàng đã xuất bản
            </span>
            <label className="owner-switch">
              <input type="checkbox" defaultChecked />
              <span />
            </label>
          </div>
        </section>

        <section className="owner-card owner-settings-section">
          <div className="owner-section-header">
            <div>
              <h2>Nhân sự</h2>
              <p>Phân quyền quản lý nhà hàng và lời mời đang chờ.</p>
            </div>
            <button type="button">
              <AddIcon />
              Mời nhân sự
            </button>
          </div>
          <div className="owner-staff-list">
            {ownerStaffMembers.map((member) => (
              <article key={member.name}>
                <div className="owner-letter-avatar">{member.name.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{member.name}</strong>
                  <p>{member.role}</p>
                </div>
                <mark>{member.status}</mark>
              </article>
            ))}
          </div>
        </section>

        <div className="owner-settings-actions">
          <button type="button">Hủy thay đổi</button>
          <button type="button">
            <SaveOutlinedIcon />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </section>
  );
}
