import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import Link from "next/link";

import {
  ownerCategories,
  ownerMenuItems,
} from "@/components/owner/ownerFlowData";

export default function OwnerMenuPage() {
  return (
    <section className="owner-page owner-menu-page">
      <header className="owner-page-header owner-page-header--split">
        <div>
          <h1>Quản lý Thực đơn</h1>
          <p>Quản lý món ăn, danh mục và trạng thái đang bán.</p>
        </div>
        <Link href="/owner/menu/new" className="owner-primary-button owner-primary-button--pill">
          <AddIcon />
          Thêm món mới
        </Link>
      </header>

      <section className="owner-card owner-menu-toolbar">
        <label className="owner-search-field owner-search-field--large">
          <SearchIcon />
          <input placeholder="Tìm kiếm món ăn..." />
        </label>
        <div className="owner-tabs">
          <button className="is-active" type="button">
            Tất cả
          </button>
          <button type="button">Đang bán</button>
          <button type="button">Hết món</button>
        </div>
      </section>

      <div className="owner-menu-layout">
        <aside className="owner-card owner-menu-categories">
          <div className="owner-menu-categories__header">
            <h2>Danh mục</h2>
            <button type="button" aria-label="Thêm danh mục">
              <AddCircleOutlinedIcon />
            </button>
          </div>
          <div className="owner-menu-categories__list">
            {ownerCategories.map((category) => (
              <button
                className={category.active ? "is-active" : ""}
                type="button"
                key={category.id}
              >
                <span>
                  <DragIndicatorIcon />
                  {category.label}
                </span>
                <mark>{category.count}</mark>
              </button>
            ))}
          </div>
        </aside>

        <section className="owner-menu-items">
          <h2>Tất cả món</h2>
          {ownerMenuItems.map((item) => (
            <article
              className={`owner-card owner-menu-item${
                item.isAvailable ? "" : " is-disabled"
              }`}
              key={item.id}
            >
              <Image src={item.image} alt={item.name} width={150} height={150} />
              <div className="owner-menu-item__content">
                <div className="owner-menu-item__top">
                  <div>
                    {item.isPopular ? (
                      <mark className="owner-hot-badge">
                        <LocalFireDepartmentIcon />
                        Bán chạy
                      </mark>
                    ) : null}
                    <h3>{item.name}</h3>
                  </div>
                  <strong>{item.price}</strong>
                </div>
                <p>{item.description}</p>
                <div className="owner-menu-item__footer">
                  <label className="owner-switch">
                    <input type="checkbox" defaultChecked={item.isAvailable} />
                    <span />
                    {item.isAvailable ? "Đang bán" : "Hết món"}
                  </label>
                  <div>
                    <button type="button" aria-label={`Sửa ${item.name}`}>
                      <EditOutlinedIcon />
                    </button>
                    <button type="button" aria-label={`Mở thêm thao tác ${item.name}`}>
                      <MoreVertIcon />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}
