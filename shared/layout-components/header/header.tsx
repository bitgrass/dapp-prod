"use client"
import Link from 'next/link'
import React, {
  Fragment,
  useEffect,
  useState,
} from 'react';
import { ThemeChanger } from "../../redux/action";
import { connect } from 'react-redux';
import store from '@/shared/redux/store';
import Modalsearch from '../modal-search/modalsearch';
import { basePath } from '@/next.config';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';


const WalletMenu = dynamic(() => import('./WalletMenu'), {
  ssr: false,
});


const Header = ({ local_varaiable, ThemeChanger }: any) => {

  //full screen
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
    };
  }, []);

  useEffect(() => {
    const isDark = local_varaiable?.class === 'dark';
    const root = document.documentElement;

    // Tailwind dark mode toggle
    root.classList.toggle('dark', isDark);

    // If your layout relies on these data-* attrs, keep them consistent
    root.setAttribute('data-header-styles', isDark ? 'dark' : 'light');
    root.setAttribute('data-menu-styles', isDark ? 'dark' : 'light');
  }, [local_varaiable?.class]);





  useEffect(() => {
    const handleResize = () => {
      const windowObject = window;
      if (windowObject.innerWidth <= 991) {
      } else {
      }
    };
    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  function menuClose() {
    const theme = store.getState();
    if (window.innerWidth <= 992) {
      ThemeChanger({ ...theme, dataToggled: "close" });
    }
    if (window.innerWidth >= 992) {
      ThemeChanger({ ...theme, dataToggled: local_varaiable.dataToggled ? local_varaiable.dataToggled : '' });
    }
  }



  const toggleSidebar = () => {
    const theme = store.getState();
    let sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        let verticalStyle = theme.dataVerticalStyle;
        const navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          // closed
          case "closed":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "close-menu-close") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "close-menu-close" });
            }
            break;
          // icon-overlay
          case "overlay":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "icon-overlay-close") {
              ThemeChanger({ ...theme, "dataToggled": "", "iconOverlay": '' });
            } else {
              if (window.innerWidth >= 992) {
                ThemeChanger({ ...theme, "dataToggled": "icon-overlay-close", "iconOverlay": '' });
              }
            }
            break;
          // icon-text
          case "icontext":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "icon-text-close") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "icon-text-close" });
            }
            break;
          // doublemenu
          case "doublemenu":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.dataToggled === "double-menu-open") {
              ThemeChanger({ ...theme, "dataToggled": "double-menu-close" });
            } else {
              let sidemenu = document.querySelector(".side-menu__item.active");
              if (sidemenu) {
                ThemeChanger({ ...theme, "dataToggled": "double-menu-open" });
                if (sidemenu.nextElementSibling) {
                  sidemenu.nextElementSibling.classList.add("double-menu-active");
                } else {

                  ThemeChanger({ ...theme, "dataToggled": "double-menu-close" });
                }
              }
            }
            break;
          // detached
          case "detached":
            if (theme.dataToggled === "detached-close") {
              ThemeChanger({ ...theme, "dataToggled": "", "iconOverlay": '' });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "detached-close", "iconOverlay": '' });
            }

            break;

          // default
          case "default":
            ThemeChanger({ ...theme, "dataToggled": "" });
        }
        switch (navStyle) {
          case "menu-click":
            if (theme.dataToggled === "menu-click-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            }
            else {
              ThemeChanger({ ...theme, "dataToggled": "menu-click-closed" });
            }
            break;
          // icon-overlay
          case "menu-hover":
            if (theme.dataToggled === "menu-hover-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "menu-hover-closed" });

            }
            break;
          case "icon-click":
            if (theme.dataToggled === "icon-click-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "icon-click-closed" });

            }
            break;
          case "icon-hover":
            if (theme.dataToggled === "icon-hover-closed") {
              ThemeChanger({ ...theme, "dataToggled": "" });
            } else {
              ThemeChanger({ ...theme, "dataToggled": "icon-hover-closed" });

            }
            break;

        }
      }
    }
    else {
      if (theme.dataToggled === "close") {
        ThemeChanger({ ...theme, "dataToggled": "open" });

        setTimeout(() => {
          if (theme.dataToggled == "open") {
            const overlay = document.querySelector("#responsive-overlay");

            if (overlay) {
              overlay.classList.add("active");
              overlay.addEventListener("click", () => {
                const overlay = document.querySelector("#responsive-overlay");

                if (overlay) {
                  overlay.classList.remove("active");
                  menuClose();
                }
              });
            }
          }

          window.addEventListener("resize", () => {
            if (window.screen.width >= 992) {
              const overlay = document.querySelector("#responsive-overlay");

              if (overlay) {
                overlay.classList.remove("active");
              }
            }
          });
        }, 100);
      } else {
        ThemeChanger({ ...theme, "dataToggled": "close" });
      }
    }



  };
  //Dark Model

  const ToggleDark = () => {

    ThemeChanger({
      ...local_varaiable,
      "class": local_varaiable.class == 'dark' ? 'light' : 'dark',
      "dataHeaderStyles": local_varaiable.class == 'dark' ? 'light' : 'dark',
      "dataMenuStyles": local_varaiable.class == 'dark' ? 'light' : 'dark'

    });
    const theme = store.getState();

    if (theme.class != 'dark') {

      ThemeChanger({
        ...theme,
        "bodyBg": '',
        "Light": '',
        "darkBg": '',
        "inputBorder": '',
      });
      localStorage.setItem("ynexlighttheme", "light");
      localStorage.removeItem("ynexdarktheme");
      localStorage.removeItem("ynexMenu");
      localStorage.removeItem("ynexHeader");
    }
    else {
      localStorage.setItem("ynexdarktheme", "dark");
      localStorage.removeItem("ynexlighttheme");
      localStorage.removeItem("ynexMenu");
      localStorage.removeItem("ynexHeader");
    }

  };

  const { ready, authenticated } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated

  useEffect(() => {
    const navbar = document?.querySelector(".header");
    const navbar1 = document?.querySelector(".app-sidebar");
    const sticky: any = navbar?.clientHeight;
    // const sticky1 = navbar1.clientHeight;

    function stickyFn() {
      if (window.pageYOffset >= sticky) {
        navbar?.classList.add("sticky-pin");
        navbar1?.classList.add("sticky-pin");
      } else {
        navbar?.classList.remove("sticky-pin");
        navbar1?.classList.remove("sticky-pin");
      }
    }

    window.addEventListener("scroll", stickyFn);
    window.addEventListener("DOMContentLoaded", stickyFn);

    // Cleanup event listeners when the component unmounts
    return () => {
      window.removeEventListener("scroll", stickyFn);
      window.removeEventListener("DOMContentLoaded", stickyFn);
    };
  }, []);

  return (
    <Fragment>
      <div className="app-header">
        <nav className="main-header !h-[3.75rem]" aria-label="Global">
          <div className="main-header-container ps-[0.725rem] ">

            <div className="header-content-left">
              <div className="header-element">
                <div className="horizontal-logo">
                  <Link href="/dashboard?tab=overview" className="header-logo">
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/desktop-logo.png`} alt="logo" className="desktop-logo" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/BitgrassIcon.svg`} alt="logo" className="toggle-logo" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/desktop-dark.png`} alt="logo" className="desktop-dark" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/BitgrassIcon.svg`} alt="logo" className="toggle-dark" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/desktop-white.png`} alt="logo" className="desktop-white" />
                    <img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/brand-logos/BitgrassIcon.svg`} alt="logo" className="toggle-white" />
                  </Link>
                </div>
              </div>
              <div className="header-element md:px-[0.325rem] !items-center" onClick={() => toggleSidebar()}>
                <Link aria-label="Hide Sidebar"
                  className="sidemenu-toggle animated-arrow  hor-toggle horizontal-navtoggle inline-flex items-center" href="#!" scroll={false}><span></span></Link>
              </div>
            </div>
            <div className="header-content-right">

              <div className="header-element py-[1rem] md:px-[0.65rem] px-2 header-search">
                <button aria-label="button" type="button" data-hs-overlay="#search-modal"
                  className="inline-flex flex-shrink-0 justify-center items-center gap-2  rounded-full font-medium focus:ring-offset-0 focus:ring-offset-white transition-all text-xs dark:bg-bgdark dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10">
                  <i className="bx bx-search-alt-2 header-link-icon"></i>
                </button>
              </div>

              <div className="header-element header-theme-mode hidden !items-center sm:block !py-[1rem] md:!px-[0.65rem] px-2">
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={ToggleDark}
                  className="flex flex-shrink-0 justify-center items-center gap-2 rounded-full font-medium text-xs dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                >
                  {local_varaiable?.class === 'dark' ? (
                    <i className="bx bx-sun header-link-icon" />
                  ) : (
                    <i className="bx bx-moon header-link-icon" />
                  )}
                </button>
              </div>



              <div className="header-element header-fullscreen py-[1rem] md:px-[0.65rem] px-2">
                <button
                  aria-label="anchor"
                  onClick={() => toggleFullscreen()}
                  className="inline-flex flex-shrink-0 justify-center items-center gap-2  !rounded-full font-medium dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                >
                  {isFullscreen ? (
                    <i className="bx bx-exit-fullscreen full-screen-close header-link-icon"></i>
                  ) : (
                    <i className="bx bx-fullscreen full-screen-open header-link-icon"></i>
                  )}
                </button>
              </div>

              <div className="header-element py-[1rem] md:px-[0.65rem] px-2  header-country hs-dropdown ti-dropdown  hidden sm:block [--placement:bottom-left]">

                <WalletMenu />

              </div>

            </div>
          </div>
        </nav>
      </div>
      <Modalsearch />
    </Fragment>
  )
}

const mapStateToProps = (state: any) => ({
  local_varaiable: state
});
export default connect(mapStateToProps, { ThemeChanger })(Header);