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
import * as ownerStyles from "@/components/owner/tailwindClasses";

export default function OwnerMenuPage() {
  return (
    <section className={ownerStyles.pageClassName}>
      <header className={ownerStyles.splitPageHeaderClassName}>
        <div>
          <h1>Quản lý Thực đơn</h1>
          <p>Quản lý món ăn, danh mục và trạng thái đang bán.</p>
        </div>
        <Link href="/owner/menu/new" className={ownerStyles.primaryPillButtonClassName}>
          <AddIcon />
          Thêm món mới
        </Link>
      </header>

      <section className={ownerStyles.menuToolbarClassName}>
        <label className={ownerStyles.menuSearchFieldClassName}>
          <SearchIcon />
          <input placeholder="Tìm kiếm món ăn..." />
        </label>
        <div className={ownerStyles.tabListClassName}>
          <button className={ownerStyles.tabButtonClassName(true)} type="button">
            Tất cả
          </button>
          <button type="button">Đang bán</button>
          <button type="button">Hết món</button>
        </div>
      </section>

      <div className={ownerStyles.menuLayoutClassName}>
        <aside className={ownerStyles.menuCategoriesClassName}>
          <div className={ownerStyles.rowBetweenClassName}>
            <h2 className={ownerStyles.menuSectionTitleClassName}>Danh mục</h2>
            <button type="button" aria-label="Thêm danh mục">
              <AddCircleOutlinedIcon />
            </button>
          </div>
          <div className={ownerStyles.categoryListClassName}>
            {ownerCategories.map((category) => (
              <button
                className={ownerStyles.categoryButtonClassName(category.active)}
                type="button"
                key={category.id}
              >
                <span className={ownerStyles.categoryLabelClassName}>
                  <DragIndicatorIcon />
                  {category.label}
                </span>
                <mark className={ownerStyles.categoryCountClassName}>{category.count}</mark>
              </button>
            ))}
          </div>
        </aside>

        <section className={ownerStyles.menuItemsClassName}>
          <h2 className={ownerStyles.menuSectionTitleClassName}>Tất cả món</h2>
          {ownerMenuItems.map((item) => (
            <article
              className={ownerStyles.menuItemCardClassName(item.isAvailable)}
              key={item.id}
            >
              <Image className={ownerStyles.menuItemImageClassName} src={item.image} alt={item.name} width={150} height={150} />
              <div className={ownerStyles.menuItemContentClassName}>
                <div className={ownerStyles.menuItemTopClassName}>
                  <div className={ownerStyles.iconButtonGroupClassName}>
                    {item.isPopular ? (
                      <mark className={ownerStyles.hotBadgeClassName}>
                        <LocalFireDepartmentIcon />
                        Bán chạy
                      </mark>
                    ) : null}
                    <h3 className={ownerStyles.menuItemNameClassName}>{item.name}</h3>
                  </div>
                  <strong className={ownerStyles.menuItemPriceClassName}>{item.price}</strong>
                </div>
                <p className={ownerStyles.menuItemDescriptionClassName}>{item.description}</p>
                <div className={ownerStyles.menuItemFooterClassName}>
                  <label className={ownerStyles.switchLabelClassName}>
                    <input className={ownerStyles.switchInputClassName} type="checkbox" defaultChecked={item.isAvailable} />
                    <span className={ownerStyles.switchTrackClassName} />
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
