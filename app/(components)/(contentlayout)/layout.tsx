"use client"
import PrelineScript from "@/app/PrelineScript"
import Backtotop from "@/shared/layout-components/backtotop/backtotop"
import Footer from "@/shared/layout-components/footer/footer"
import Header from "@/shared/layout-components/header/header"
import Sidebar from "@/shared/layout-components/sidebar/sidebar"
import Switcher from "@/shared/layout-components/switcher/switcher"
import { ThemeChanger } from "@/shared/redux/action"
import store from "@/shared/redux/store"
import { Fragment,  useState } from "react"
import {  connect } from "react-redux"

const Layout = ({children,}:any) => {

  const [MyclassName, setMyClass] = useState("");

  const Bodyclickk = () => {
    const theme = store.getState();
    if (localStorage.getItem("ynexverticalstyles") == "icontext") {
      setMyClass("");
    }
    if (window.innerWidth > 992) {
      if (theme.iconOverlay === 'open') {
        ThemeChanger({ ...theme, iconOverlay: "" });
      }
    }
  }

  return (
    <>

      
    <Fragment>
        <Switcher/>
      <div className='page'>
        <Header/>
        <Sidebar/>
        <div className='content'>
          <div className='main-content'  
          onClick={Bodyclickk}
          >
            {children}
          </div>
        </div>
        <Footer/>
      </div>
      <Backtotop/>
      <PrelineScript/>
    </Fragment>
    </>
  )
}

const mapStateToProps = (state: any) => ({
  local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger})(Layout);
