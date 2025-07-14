import React from "react";

const DashboardIcon = <i className="bx bx-grid-alt side-menu__icon"></i>;

const PagesIcon = <i className="ti ti-wallet side-menu__icon"></i>;

const TaskIcon = <i className="bx bx-transfer-alt side-menu__icon"></i>;

const AuthenticationIcon = (

  <img
    src="../../assets/images/apps/Ownplot.svg"
    className="side-menu__icon"

  />

);

const ErrorIcon = <i className="bx bx-sort-down side-menu__icon"></i>;

const UiElementsIcon = <i className="bx bx-trophy side-menu__icon"></i>;

const Utilities = <i className="bx bx-calculator side-menu__icon"></i>;

const FormsIcon = <i className="bx bx-file  side-menu__icon"></i>;

const AdvancedUiIcon = <i className="bx bx-party side-menu__icon"></i>;

const WidgetsIcon = <i className="bx bx-coin-stack side-menu__icon"></i>;

const AppsIcon = <i className="bx bx-grid-alt side-menu__icon"></i>;

const NestedmenuIcon = <i className="bx bx-layer side-menu__icon"></i>;

const TablesIcon = <i className="bx bx-table side-menu__icon"></i>;

const ChartsIcon = <i className="bx bx-bar-chart-square side-menu__icon"></i>;

const MapsIcon = <i className="bx bx-map side-menu__icon"></i>;

const Icons = <i className="bx bx-store-alt side-menu__icon"></i>;

const badge = (
  <span className="badge !bg-warning/10 !text-warning !py-[0.25rem] !px-[0.45rem] !text-[0.75em] ms-1">
    12
  </span>
);
const badge1 = (
  <span className="text-secondary text-[0.75em] rounded-sm !py-[0.25rem] !px-[0.45rem] badge !bg-secondary/10 ms-1">
    assets
  </span>
);
const badge2 = (
  <span className="text-danger text-[0.75em] rounded-sm badge !py-[0.25rem] !px-[0.45rem] !bg-danger/10 ms-1">
    Gitbook
  </span>
);
const badge4 = (
  <span className="text-primary text-[0.75em] badge !py-[0.25rem] !px-[0.45rem] rounded-sm bg-camel10 ms-1">
    Soon
  </span>
);

export const MenuItems: any = [
  {
    menutitle: "MAIN",
  },

  {
    icon: DashboardIcon,
    title: "Dashboard",
    path: "/dashboard?tab=overview",
    type: "sub",
    active: false,
    selected: false,
    children: [
      {
        path: "/dashboard?tab=overview",
        type: "link",
        title: "Overview",
        selected: false
      },
      {
        path: "/dashboard?tab=market",
        type: "link",
        title: "Market",
        selected: false
      },
    ],
  },


  {
    icon: PagesIcon,
    badgetxt: badge1,
    path: "/portfolio",
    title: "Portfolio",
    type: "link",
    active: false,
    selected: false,

  },


  {
    title: "Leaderboard",
    icon: UiElementsIcon,
    badgetxt: badge4,
    path: "",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,


  },

  {
    menutitle: "UTILITIES",
  },
  {
    title: "Swap",
    icon: TaskIcon,
    path: "/swap",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,


  },
  {
    title: "Own plot",
    icon: AuthenticationIcon,
    path: "/ownplot/standard",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,


  },
  {
    title: "Staking",
    icon: WidgetsIcon,
    path: "https://staking.bitgrass.com",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    target: "_blank",



  },
  {
    menutitle: "EXPLORER",
  },

  {
    title: "Projects",
    icon: NestedmenuIcon,
    path: "/projects/project-list",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,


  },
  {
    title: "Retirements",
    badgetxt: badge4,
    icon: ErrorIcon,
    path: "",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,


  },
  {
    title: "Calculator",
    icon: Utilities,
    badgetxt: badge4,

    path: "",
    type: "link",
    active: false,
    selected: false,
    dirchange: false,


  },


];
