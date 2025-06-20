
"use client"
import React, { Fragment } from 'react'
import { connect } from 'react-redux';
import { ThemeChanger } from '@/shared/redux/action';
import Themeprimarycolor, * as switcherdata from '../../data/switcherdata/switcherdata';


const Switcher = ({ local_varaiable, ThemeChanger }:any) => {

  return (
    <Fragment>
        <div id="hs-overlay-switcher" className="hs-overlay hidden ti-offcanvas ti-offcanvas-right">
          <div className="ti-offcanvas-header z-10 relative">
            <h5 className="ti-offcanvas-title !text-[1.25rem]">
              Switcher
            </h5>
            <button type="button"
              className="ti-btn flex-shrink-0 p-0  transition-none text-defaulttextcolor dark:text-defaulttextcolor/70 hover:text-gray-700 focus:ring-gray-400 focus:ring-offset-white  dark:hover:text-white/80 dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
              data-hs-overlay="#hs-overlay-switcher">
              <span className="sr-only">Close modal</span>
              <i className="ri-close-circle-line leading-none text-lg"></i>
            </button>
          </div>
          <div className="ti-offcanvas-body !p-0 !border-b dark:border-white/10 z-10 relative !h-auto">
            <div className="flex rtl:space-x-reverse" aria-label="Tabs" role="tablist">
              <button type="button"
                className="hs-tab-active:bg-success/20 w-full !py-2 !px-4 hs-tab-active:border-b-transparent text-defaultsize border-0 hs-tab-active:text-success dark:hs-tab-active:bg-success/20 dark:hs-tab-active:border-b-white/10 dark:hs-tab-active:text-success -mb-px bg-white font-semibold text-center  text-defaulttextcolor dark:text-defaulttextcolor/70 rounded-none hover:text-gray-700 dark:bg-bodybg dark:border-white/10  active"
                id="switcher-item-1" data-hs-tab="#switcher-1" aria-controls="switcher-1" role="tab">
                Theme Style
              </button>
              <button type="button"
                className="hs-tab-active:bg-success/20 w-full !py-2 !px-4 hs-tab-active:border-b-transparent text-defaultsize border-0 hs-tab-active:text-success dark:hs-tab-active:bg-success/20 dark:hs-tab-active:border-b-white/10 dark:hs-tab-active:text-success -mb-px  bg-white font-semibold text-center  text-defaulttextcolor dark:text-defaulttextcolor/70 rounded-none hover:text-gray-700 dark:bg-bodybg dark:border-white/10  dark:hover:text-gray-300"
                id="switcher-item-2" data-hs-tab="#switcher-2" aria-controls="switcher-2" role="tab">
                Theme Colors
              </button>
            </div>
          </div>
          <div className="ti-offcanvas-body !px-0" id="switcher-body">
            <div id="switcher-1" role="tabpanel" aria-labelledby="switcher-item-1" className="">
              <div className="">
                <p className="switcher-style-head">Theme Color Mode:</p>
                <div className="grid grid-cols-3 switcher-style">
                  <div className="flex items-center">
                    <input type="radio" name="theme-style" className="ti-form-radio" id="switcher-light-theme" checked={local_varaiable.class != "dark"} onChange={_e => { }}
                      onClick={() => switcherdata.Light(ThemeChanger) } />
                    <label htmlFor="switcher-light-theme"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Light</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" name="theme-style" className="ti-form-radio" id="switcher-dark-theme" checked={local_varaiable.class == "dark"} onChange={_e => { }}
                      onClick={() => switcherdata.Dark(ThemeChanger) } />
                    <label htmlFor="switcher-dark-theme"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Dark</label>
                  </div>
                </div>
              </div>
              <div>
                <p className="switcher-style-head">Directions:</p>
                <div className="grid grid-cols-3  switcher-style">
                  <div className="flex items-center">
                    <input type="radio" name="direction" className="ti-form-radio" id="switcher-ltr" checked={local_varaiable.dir == "ltr"} onChange={_e => { }}
                      onClick={() =>  switcherdata.Ltr(ThemeChanger)} />
                    <label htmlFor="switcher-ltr" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">LTR</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" name="direction" className="ti-form-radio" id="switcher-rtl" checked={local_varaiable.dir == "rtl"} onChange={_e => { }}
                      onClick={() => switcherdata.Rtl(ThemeChanger)} />
                    <label htmlFor="switcher-rtl" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">RTL</label>
                  </div>
                </div>
              </div>
              <div>
                <p className="switcher-style-head">Navigation Styles:</p>
                <div className="grid grid-cols-3  switcher-style">
                  <div className="flex items-center">
                    <input type="radio" name="navigation-style" className="ti-form-radio" id="switcher-vertical" checked={local_varaiable.dataNavLayout == "vertical"} onChange={_e => { }}
                      onClick={() => switcherdata.Vertical(ThemeChanger)} />
                    <label htmlFor="switcher-vertical"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Vertical</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" name="navigation-style" className="ti-form-radio" id="switcher-horizontal" checked={local_varaiable.dataNavLayout == "horizontal"} onChange={_e => { }}
                      onClick={() => switcherdata.HorizontalClick(ThemeChanger)} />
                    <label htmlFor="switcher-horizontal"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Horizontal</label>
                  </div>
                </div>
              </div>
              <div>
                <p className="switcher-style-head">Navigation Menu Style:</p>
                <div className="grid grid-cols-2 gap-2 switcher-style">
                  <div className="flex">
                    <input type="radio" name="navigation-data-menu-styles" className="ti-form-radio" id="switcher-menu-click"
                      checked={local_varaiable.dataNavStyle == "menu-click"} onChange={_e => { }}
                      onClick={() => switcherdata.Menuclick(ThemeChanger)} />
                    <label htmlFor="switcher-menu-click" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Menu
                      Click</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="navigation-data-menu-styles" className="ti-form-radio" id="switcher-menu-hover" checked={local_varaiable.dataNavStyle == "menu-hover"} onChange={_e => { }}
                      onClick={() => switcherdata.MenuHover(ThemeChanger)} />
                    <label htmlFor="switcher-menu-hover" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Menu
                      Hover</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="navigation-data-menu-styles" className="ti-form-radio" id="switcher-icon-click" checked={local_varaiable.dataNavStyle == "icon-click"} onChange={_e => { }}
                      onClick={() => switcherdata.IconClick(ThemeChanger)} />
                    <label htmlFor="switcher-icon-click" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Icon
                      Click</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="navigation-data-menu-styles" className="ti-form-radio" id="switcher-icon-hover" checked={local_varaiable.dataNavStyle == "icon-hover"} onChange={_e => { }}
                      onClick={() => switcherdata.IconHover(ThemeChanger)} />
                    <label htmlFor="switcher-icon-hover" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Icon
                      Hover</label>
                  </div>
                </div>
                <div className="px-4 text-secondary text-xs"><b className="me-2">Note:</b>Works same for both Vertical and
                  Horizontal
                </div>
              </div>
              <div className=" sidemenu-layout-styles">
                <p className="switcher-style-head">Sidemenu Layout Syles:</p>
                <div className="grid grid-cols-2 gap-2 switcher-style">
                  <div className="flex">
                    <input type="radio" name="sidemenu-layout-styles" className="ti-form-radio" id="switcher-default-menu" defaultChecked
                      onClick={() => switcherdata.Defaultmenu(ThemeChanger) } />
                    <label htmlFor="switcher-default-menu"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold ">Default
                      Menu</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="sidemenu-layout-styles" className="ti-form-radio" id="switcher-closed-menu" checked={local_varaiable.dataToggled == "close-menu-close"} onChange={_e => { }}
                      onClick={() => switcherdata.Closedmenu(ThemeChanger)} />
                    <label htmlFor="switcher-closed-menu" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold ">
                      Closed
                      Menu</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="sidemenu-layout-styles" className="ti-form-radio" id="switcher-icontext-menu" checked={local_varaiable.dataToggled == "icon-text-close"} onChange={(_e) => { }}
                      onClick={() => switcherdata.iconText(ThemeChanger)} />
                    <label htmlFor="switcher-icontext-menu" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold ">Icon
                      Text</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="sidemenu-layout-styles" className="ti-form-radio" id="switcher-icon-overlay" 
                      onClick={() => switcherdata.iconOverayFn(ThemeChanger)} />
                    <label htmlFor="switcher-icon-overlay" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold ">Icon Overlay</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="sidemenu-layout-styles" className="ti-form-radio" id="switcher-detached" checked={local_varaiable.dataToggled == "detached-close"} onChange={(_e) => { }}
                      onClick={() => switcherdata.DetachedFn(ThemeChanger)}/>
                    <label htmlFor="switcher-detached"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold ">Detached</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="sidemenu-layout-styles" className="ti-form-radio" id="switcher-double-menu" checked={local_varaiable.dataVerticalStyle == "doublemenu"} onChange={(_e) => { }}
                      onClick={() => switcherdata.DoubletFn(ThemeChanger)}  />
                    <label htmlFor="switcher-double-menu" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Double
                      Menu</label>
                  </div>
                </div>
                <div className="px-4 text-secondary text-xs"><b className="me-2">Note:</b>Navigation menu styles won't work
                  here.</div>
              </div>
              <div>
                <p className="switcher-style-head">Page Styles:</p>
                <div className="grid grid-cols-3  switcher-style">
                  <div className="flex">
                    <input type="radio" name="data-page-styles" className="ti-form-radio" id="switcher-regular" checked={local_varaiable.dataPageStyle == "regular"} onChange={_e => { }}
                      onClick={() => switcherdata.Regular(ThemeChanger)} />
                    <label htmlFor="switcher-regular"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Regular</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="data-page-styles" className="ti-form-radio" id="switcher-classic" checked={local_varaiable.dataPageStyle == "classic"} onChange={_e => { }}
                      onClick={() => switcherdata.Classic(ThemeChanger)} />
                    <label htmlFor="switcher-classic"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Classic</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="data-page-styles" className="ti-form-radio" id="switcher-modern" checked={local_varaiable.dataPageStyle == "modern"} onChange={_e => { }} 
                    onClick={() => switcherdata.Modern(ThemeChanger)} />
                    <label htmlFor="switcher-modern"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold"> Modern</label>
                  </div>
                </div>
              </div>
              <div>
                <p className="switcher-style-head">Layout Width Styles:</p>
                <div className="grid grid-cols-3 switcher-style">
                  <div className="flex">
                    <input type="radio" name="layout-width" className="ti-form-radio" id="switcher-full-width" checked={local_varaiable.dataWidth == "fullwidth"} onChange={_e => { }}
                      onClick={() => switcherdata.Fullwidth(ThemeChanger)} />
                    <label htmlFor="switcher-full-width"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">FullWidth</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="layout-width" className="ti-form-radio" id="switcher-boxed" checked={local_varaiable.dataWidth == "boxed"} onChange={_e => { }}
                      onClick={() => switcherdata.Boxed(ThemeChanger)} />
                    <label htmlFor="switcher-boxed" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Boxed</label>
                  </div>
                </div>
              </div>
              <div>
                <p className="switcher-style-head">Menu Positions:</p>
                <div className="grid grid-cols-3  switcher-style">
                  <div className="flex">
                    <input type="radio" name="data-menu-positions" className="ti-form-radio" id="switcher-menu-fixed" checked={local_varaiable.dataMenuPosition == "fixed"} onChange={_e => { }}
                      onClick={() => switcherdata.FixedMenu(ThemeChanger)} />
                    <label htmlFor="switcher-menu-fixed"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Fixed</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="data-menu-positions" className="ti-form-radio" id="switcher-menu-scroll" checked={local_varaiable.dataMenuPosition == "scrollable"} onChange={_e => { }}
                      onClick={() => switcherdata.scrollMenu(ThemeChanger)} />
                    <label htmlFor="switcher-menu-scroll"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Scrollable </label>
                  </div>
                </div>
              </div>
              <div>
                <p className="switcher-style-head">Header Positions:</p>
                <div className="grid grid-cols-3 switcher-style">
                  <div className="flex">
                    <input type="radio" name="data-header-positions" className="ti-form-radio" id="switcher-header-fixed" checked={local_varaiable.dataHeaderPosition == "fixed"} onChange={_e => { }}
                      onClick={() => switcherdata.Headerpostionfixed(ThemeChanger)} />
                    <label htmlFor="switcher-header-fixed" className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">
                      Fixed</label>
                  </div>
                  <div className="flex">
                    <input type="radio" name="data-header-positions" className="ti-form-radio" id="switcher-header-scroll" checked={local_varaiable.dataHeaderPosition == "scrollable"} onChange={_e => { }}
                      onClick={() => switcherdata.Headerpostionscroll(ThemeChanger)} />
                    <label htmlFor="switcher-header-scroll"
                      className="text-defaultsize text-defaulttextcolor dark:text-defaulttextcolor/70 ms-2  font-semibold">Scrollable
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div id="switcher-2" className="hidden" role="tabpanel" aria-labelledby="switcher-item-2">
              <div className="theme-colors">
                <p className="switcher-style-head">Menu Colors:</p>
                <div className="flex switcher-style space-x-3 rtl:space-x-reverse">
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-white" type="radio" name="menu-colors"
                    checked={local_varaiable.dataMenuStyles == "light"} onChange={_e => { }}
                      id="switcher-menu-light" onClick={() => switcherdata.lightMenu(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Light Menu
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-dark" type="radio" name="menu-colors"
                    checked={local_varaiable.dataMenuStyles == "dark"} onChange={_e => { }}
                      id="switcher-menu-dark" onClick={() => switcherdata.darkMenu(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Dark Menu
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-primary" type="radio" name="menu-colors"
                    checked={local_varaiable.dataMenuStyles == "color"} onChange={_e => { }}
                      id="switcher-menu-primary" onClick={() => switcherdata.colorMenu(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Color Menu
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-gradient" type="radio" name="menu-colors"
                    checked={local_varaiable.dataMenuStyles == "gradient"} onChange={_e => { }}
                      id="switcher-menu-gradient" onClick={() => switcherdata.gradientMenu(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Gradient Menu
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-transparent" type="radio" name="menu-colors"
                    checked={local_varaiable.dataMenuStyles == "transparent"} onChange={_e => { }}
                      id="switcher-menu-transparent" onClick={() => switcherdata.transparentMenu(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Transparent Menu
                    </span>
                  </div>
                </div>
                <div className="px-4 text-[#8c9097] dark:text-white/50 text-[.6875rem]"><b className="me-2">Note:</b>If you want to change color Menu
                  dynamically
                  change from below Theme Primary color picker.</div>
              </div>
              <div className="theme-colors">
                <p className="switcher-style-head">Header Colors:</p>
                <div className="flex switcher-style space-x-3 rtl:space-x-reverse">
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-white !border" type="radio" name="header-colors"
                     checked={local_varaiable.dataHeaderStyles == "light"} onChange={_e => { }}
                      id="switcher-header-light" onClick={() => switcherdata.lightHeader(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Light Header
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-dark" type="radio" name="header-colors"
                     checked={local_varaiable.dataHeaderStyles == "dark"} onChange={_e => { }}
                      id="switcher-header-dark" onClick={() => switcherdata.darkHeader(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Dark Header
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-primary" type="radio" name="header-colors"
                     checked={local_varaiable.dataHeaderStyles == "color"} onChange={_e => { }}
                      id="switcher-header-primary" onClick={() => switcherdata.colorHeader(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Color Header
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-gradient" type="radio" name="header-colors"
                     checked={local_varaiable.dataHeaderStyles == "gradient"} onChange={_e => { }}
                      id="switcher-header-gradient" onClick={() => switcherdata.gradientHeader(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Gradient Header
                    </span>
                  </div>
                  <div className="hs-tooltip ti-main-tooltip ti-form-radio switch-select ">
                    <input className="hs-tooltip-toggle ti-form-radio color-input color-transparent" type="radio"
                      name="header-colors" id="switcher-header-transparent"  checked={local_varaiable.dataHeaderStyles == "transparent"} onChange={_e => { }} 
                      onClick={() => switcherdata.transparentHeader(ThemeChanger)} />
                    <span
                      className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-black text-xs font-medium !text-white shadow-sm dark:!bg-black"
                      role="tooltip">
                      Transparent Header
                    </span>
                  </div>
                </div>
                <div className="px-4 text-[#8c9097] dark:text-white/50 text-[.6875rem]"><b className="me-2">Note:</b>If you want to change color
                  Header dynamically
                  change from below Theme Primary color picker.</div>
              </div>
              <div className="theme-colors">
                <p className="switcher-style-head">Theme Primary:</p>
                <div className="flex flex-wrap switcher-style gap-y-2 gap-x-5 rtl:gap-x-reverse">
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-primary-1" type="radio" name="theme-primary"
                    checked={local_varaiable.colorPrimaryRgb == '58, 88, 146'} onChange={(_e) => { }}
                      id="switcher-primary" onClick={() => switcherdata.primaryColor1(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-primary-2" type="radio" name="theme-primary"
                    checked={local_varaiable.colorPrimaryRgb == '92, 144 ,163'} onChange={(_e) => { }}
                      id="switcher-primary1" onClick={() => switcherdata.primaryColor2(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-primary-3" type="radio" name="theme-primary"
                     checked={local_varaiable.colorPrimaryRgb == '161, 90 ,223'} onChange={(_e) => { }}
                      id="switcher-primary2" onClick={() => switcherdata.primaryColor3(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-primary-4" type="radio" name="theme-primary"
                    checked={local_varaiable.colorPrimaryRgb == '78, 172, 76'} onChange={(_e) => { }}
                      id="switcher-primary3" onClick={() => switcherdata.primaryColor4(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-primary-5" type="radio" name="theme-primary"
                    checked={local_varaiable.colorPrimaryRgb == '223, 90, 90'} onChange={(_e) => { }}
                      id="switcher-primary4" onClick={() => switcherdata.primaryColor5(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select ps-0 mt-1 color-primary-light">
                  <div className='theme-container-primary'>
                    <button className="">nano</button>
                  </div>
                  <div className='pickr-container-primary'>
                    <div className='pickr'>
                      <button className='pcr-button' onClick={(ele: any) => {
                        if (ele.target.querySelector("input")) {
                          ele.target.querySelector("input").click();
                        }
                      }}>
                        <Themeprimarycolor theme={local_varaiable} actionfunction={ThemeChanger} />
                      </button>

                    </div>
                  </div>
                </div>
                </div>
              </div>
              <div className="theme-colors">
                <p className="switcher-style-head">Theme Background:</p>
                <div className="flex flex-wrap switcher-style gap-y-2 gap-x-5 rtl:gap-x-reverse">
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-bg-1" type="radio" name="theme-background"
                    checked={local_varaiable.bodyBg == '34 44 110'} onChange={(_e) => { }}
                      id="switcher-background" onClick={() =>  switcherdata.backgroundColor1(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-bg-2" type="radio" name="theme-background"
                    checked={local_varaiable.bodyBg == '22 92 129'} onChange={(_e) => { }}
                      id="switcher-background1" onClick={() =>  switcherdata.backgroundColor2(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-bg-3" type="radio" name="theme-background"
                    checked={local_varaiable.bodyBg == '104 51 149'} onChange={(_e) => { }}
                      id="switcher-background2" onClick={() =>  switcherdata.backgroundColor3(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-bg-4" type="radio" name="theme-background"
                    checked={local_varaiable.bodyBg == '29 106 56'} onChange={(_e) => { }}
                      id="switcher-background3" onClick={() =>  switcherdata.backgroundColor4(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio color-input color-bg-5" type="radio" name="theme-background"
                    checked={local_varaiable.bodyBg == '134 80 34'} onChange={(_e) => { }}
                      id="switcher-background4" onClick={() =>  switcherdata.backgroundColor5(ThemeChanger)} />
                  </div>
                  <div className="ti-form-radio switch-select ps-0 mt-1 color-bg-transparent">
                  <div className='theme-container-background' >
                    <button className="">nano</button>
                  </div>
                  <div className='pickr-container-background'>
                    <div className='pickr'>
                      <button className='pcr-button' onClick={(ele: any) => {
                        if (ele.target.querySelector("input")) {
                          ele.target.querySelector("input").click();
                        }
                      }}>
                        <switcherdata.Themebackgroundcolor theme={local_varaiable} actionfunction={ThemeChanger} />
                      </button>

                    </div>
                  </div>
                </div>
                </div>
              </div>
              <div className="menu-image theme-colors">
                <p className="switcher-style-head">Menu With Background Image:</p>
                <div className="flex switcher-style space-x-3 rtl:space-x-reverse flex-wrap gap-3">
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio bgimage-input bg-img1" type="radio" name="theme-images" id="switcher-bg-img" onClick={() =>  switcherdata.bgImage1(ThemeChanger)}  checked={local_varaiable.colorPrimaryRgb == 'bg-img'} onChange={(_e) => { }}/>
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio bgimage-input bg-img2" type="radio" name="theme-images" id="switcher-bg-img1" onClick={() =>  switcherdata.bgImage2(ThemeChanger)} checked={local_varaiable.colorPrimaryRgb == 'bg-img1'} onChange={(_e) => { }}/>
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio bgimage-input bg-img3" type="radio" name="theme-images" id="switcher-bg-img2" onClick={() =>  switcherdata.bgImage3(ThemeChanger)} checked={local_varaiable.colorPrimaryRgb == 'bg-img2'} onChange={(_e) => { }}/>
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio bgimage-input bg-img4" type="radio" name="theme-images" id="switcher-bg-img3" onClick={() => switcherdata.bgImage4(ThemeChanger)} checked={local_varaiable.colorPrimaryRgb == 'bg-img3'} onChange={(_e) => { }}/>
                  </div>
                  <div className="ti-form-radio switch-select">
                    <input className="ti-form-radio bgimage-input bg-img5" type="radio" name="theme-images" id="switcher-bg-img4" onClick={() =>  switcherdata.bgImage5(ThemeChanger)} checked={local_varaiable.colorPrimaryRgb == 'bg-img4'} onChange={(_e) => { }}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ti-offcanvas-footer sm:flex justify-between">
            <a href="#!" onClick={() => switcherdata.Reset(ThemeChanger)} id="reset-all" className="w-full ti-btn ti-btn-danger-full m-1">Reset</a> </div>
        </div>
    </Fragment>
  )
}

const mapStateToProps = (state: any) => ({
  local_varaiable: state
})

export default connect(mapStateToProps, { ThemeChanger })(Switcher);