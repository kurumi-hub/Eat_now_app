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
import * as ownerStyles from "@/components/owner/tailwindClasses";

export default function OwnerSettingsPage() {
  return (
    <section className={ownerStyles.settingsPageClassName}>
      <header className={ownerStyles.settingsTopbarClassName}>
        <div className={ownerStyles.settingsTopbarTitleWrapClassName}>
          <h1>Cài đặt nhà hàng</h1>
          <p>Quản lý hồ sơ, vận hành và nhân sự của {ownerRestaurant.shortName}.</p>
        </div>
        <label className={ownerStyles.settingsSearchFieldClassName}>
          <SearchIcon />
          <input placeholder="Tìm kiếm cài đặt..." />
        </label>
        <button className={ownerStyles.roundButtonClassName} type="button" aria-label="Thông báo">
          <NotificationsNoneOutlinedIcon />
        </button>
      </header>

      <div className={ownerStyles.settingsContentClassName}>
        <section className={ownerStyles.settingsSectionClassName}>
          <h2 className={ownerStyles.settingsSectionTitleClassName}>Thông tin nhà hàng</h2>
          <div className={ownerStyles.settingsMediaClassName}>
            <div className={ownerStyles.coverPhotoClassName}>
              <Image
                src="/images/home/hero.png"
                alt="Ảnh bìa nhà hàng"
                width={760}
                height={210}
              />
              <button className={ownerStyles.mediaOverlayButtonClassName} type="button" aria-label="Đổi ảnh bìa">
                <CameraAltOutlinedIcon />
              </button>
            </div>
            <div className={ownerStyles.logoPhotoClassName}>
              <Image
                src="/images/home/restaurant-com-tam.png"
                alt="Logo nhà hàng"
                width={126}
                height={126}
              />
              <button className={ownerStyles.mediaOverlayButtonClassName} type="button" aria-label="Đổi logo">
                <EditOutlinedIcon />
              </button>
            </div>
          </div>

          <div className={ownerStyles.formGridClassName}>
            <label className={ownerStyles.formFieldClassName}>
              <span>Tên nhà hàng</span>
              <input defaultValue={ownerRestaurant.name} />
            </label>
            <label className={ownerStyles.formFieldClassName}>
              <span>Loại ẩm thực</span>
              <select defaultValue={ownerRestaurant.category}>
                <option>{ownerRestaurant.category}</option>
                <option>Món Âu</option>
                <option>Món Á</option>
                <option>Thức uống</option>
              </select>
            </label>
            <label className={ownerStyles.formFieldWideClassName}>
              <span>Mô tả ngắn</span>
              <textarea defaultValue={ownerRestaurant.description} rows={2} />
            </label>
            <label className={ownerStyles.formFieldWideClassName}>
              <span>Địa chỉ</span>
              <input defaultValue={ownerRestaurant.address} />
            </label>
            <label className={ownerStyles.formFieldClassName}>
              <span>Số điện thoại</span>
              <input defaultValue={ownerRestaurant.phone} />
            </label>
            <label className={ownerStyles.formFieldClassName}>
              <span>Múi giờ</span>
              <input defaultValue="Asia/Ho_Chi_Minh" />
            </label>
          </div>
        </section>

        <section className={ownerStyles.settingsSectionClassName}>
          <div className={ownerStyles.sectionHeaderClassName}>
            <div>
              <h2 className={ownerStyles.menuSectionTitleClassName}>Giờ mở cửa</h2>
              <p className={ownerStyles.sectionDescriptionClassName}>
                Thiết lập thời gian nhận đơn theo từng ngày.
              </p>
            </div>
            <button type="button">
              <AddIcon />
              Thêm khung giờ
            </button>
          </div>
          <div className={ownerStyles.hoursListClassName}>
            {ownerBusinessHours.map((item) => (
              <article className={ownerStyles.hoursRowClassName} key={item.day}>
                <div>
                  <strong>{item.day}</strong>
                  <span className={ownerStyles.hoursMetaClassName}>{item.time}</span>
                </div>
                <button type="button" aria-label={`Sửa giờ ${item.day}`}>
                  <EditOutlinedIcon />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className={ownerStyles.operationsSectionClassName}>
          <div>
            <h2 className={ownerStyles.menuSectionTitleClassName}>Vận hành</h2>
            <p className={ownerStyles.sectionDescriptionClassName}>
              Trạng thái nhận đơn và điều kiện hiển thị với khách hàng.
            </p>
          </div>
          <div className={ownerStyles.operationRowClassName}>
            <span className={ownerStyles.operationStatusClassName}>
              <CheckCircleOutlinedIcon />
              Đang nhận đơn
            </span>
            <label className={ownerStyles.switchLabelClassName}>
              <input className={ownerStyles.switchInputClassName} type="checkbox" defaultChecked />
              <span className={ownerStyles.switchTrackClassName} />
            </label>
          </div>
          <div className={ownerStyles.operationRowClassName}>
            <span className={ownerStyles.operationStatusClassName}>
              <CheckCircleOutlinedIcon />
              Nhà hàng đã xuất bản
            </span>
            <label className={ownerStyles.switchLabelClassName}>
              <input className={ownerStyles.switchInputClassName} type="checkbox" defaultChecked />
              <span className={ownerStyles.switchTrackClassName} />
            </label>
          </div>
        </section>

        <section className={ownerStyles.settingsSectionClassName}>
          <div className={ownerStyles.sectionHeaderClassName}>
            <div>
              <h2 className={ownerStyles.menuSectionTitleClassName}>Nhân sự</h2>
              <p className={ownerStyles.sectionDescriptionClassName}>
                Phân quyền quản lý nhà hàng và lời mời đang chờ.
              </p>
            </div>
            <button type="button">
              <AddIcon />
              Mời nhân sự
            </button>
          </div>
          <div className={ownerStyles.staffListClassName}>
            {ownerStaffMembers.map((member) => (
              <article className={ownerStyles.staffRowClassName} key={member.name}>
                <div className={ownerStyles.letterAvatarClassName}>{member.name.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{member.name}</strong>
                  <p>{member.role}</p>
                </div>
                <mark className={ownerStyles.staffStatusClassName}>{member.status}</mark>
              </article>
            ))}
          </div>
        </section>

        <div className={ownerStyles.settingsActionsClassName}>
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
