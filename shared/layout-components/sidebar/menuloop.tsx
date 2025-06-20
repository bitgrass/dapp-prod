import { ThemeChanger } from "@/shared/redux/action";
import Link from "next/link";
import { Fragment } from "react";
import { connect } from "react-redux";

function Menuloop({ local_varaiable, MenuItems, toggleSidemenu, level, HoverToggleInnerMenuFn , activeTab }: any) {
  const handleClick = (event: any) => {
    event.preventDefault();
    // Add your logic here
  };

  return (
    <Fragment>
      {/* Top-level Menu Item */}
      <Link 
        href="#!" 
        scroll={false}
        className={`side-menu__item ${MenuItems?.selected ? "active" : ""}`}
        onClick={(event) => {
          event.preventDefault();
          toggleSidemenu(event, MenuItems);
        }}
        onMouseEnter={(event) => HoverToggleInnerMenuFn(event, MenuItems)}
      >
        <span 
          className={`hs-tooltip inline-block [--placement:right] leading-none ${
            local_varaiable?.dataVerticalStyle === "doublemenu" ? "" : "hidden"
          }`}
        >
          <button
            type="button"
            className="hs-tooltip-toggle inline-flex justify-center items-center"
          >
            {MenuItems.icon}
            <span
              className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-black text-xs font-medium text-white rounded shadow-sm dark:bg-neutral-700"
              role="tooltip"
            >
              {MenuItems.title}
            </span>
          </button>
        </span>
        {local_varaiable?.dataVerticalStyle !== "doublemenu" ? MenuItems.icon : ""}
        <span className={`${level === 1 ? "side-menu__label" : ""}`}>
          {MenuItems.title}{" "}
          {MenuItems.badgetxt && (
            <span className={MenuItems.class}>{MenuItems.badgetxt}</span>
          )}
        </span>
        <i className="fe fe-chevron-right side-menu__angle"></i>
      </Link>

      {/* Submenu */}
      <ul
        className={`slide-menu child${level} ${
          MenuItems.active ? "double-menu-active" : ""
        } ${MenuItems?.dirchange ? "force-left" : ""}`}
        style={{ display: MenuItems.active ? "block" : "none" }}
      >
        {level <= 1 && (
          <li className="slide side-menu__label1">
            <Link href="#!" scroll={false}>{MenuItems.title}</Link>
          </li>
        )}
        {MenuItems.children.map((firstlevel: any, index: any) => (
          <li
            key={index}
            className={`${firstlevel.menutitle ? "slide__category" : ""} ${
              firstlevel?.type === "empty" ? "slide" : ""
            } ${firstlevel?.type === "link" ? "slide" : ""} ${
              firstlevel?.type === "sub" ? "slide has-sub" : ""
            } ${firstlevel?.active ? "open" : ""} ${
              firstlevel?.selected ? "active" : ""
            }`}
          >
            {firstlevel.type === "link" && (
              <Link
                href={firstlevel.path || "#!"}
                className={`side-menu__item ${firstlevel.title.toLowerCase() == activeTab.toLowerCase() ? "active" : ""}`}
              >
                {firstlevel.icon}
                <span>
                  {firstlevel.title}
                  {firstlevel.badgetxt && (
                    <span className={firstlevel.class}>
                      {firstlevel.badgetxt}
                    </span>
                  )}
                </span>
              </Link>
            )}
            {firstlevel.type === "empty" && (
              <button className="side-menu__item" onClick={handleClick}>
                {firstlevel.icon}
                <span>
                  {firstlevel.title}
                  {firstlevel.badgetxt && (
                    <span className={firstlevel.class}>
                      {firstlevel.badgetxt}
                    </span>
                  )}
                </span>
              </button>
            )}
            {firstlevel.type === "sub" && (
              <Menuloop
                MenuItems={firstlevel}
                toggleSidemenu={toggleSidemenu}
                HoverToggleInnerMenuFn={HoverToggleInnerMenuFn}
                level={level + 1}
              />
            )}
          </li>
        ))}
      </ul>
    </Fragment>
  );
}

const mapStateToProps = (state: any) => ({
  local_varaiable: state,
});

export default connect(mapStateToProps, { ThemeChanger })(Menuloop);
