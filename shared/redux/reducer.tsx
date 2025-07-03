let initialState = {
    lang: "en",
    dir: "ltr",
    class: "light",
    dataMenuStyles: "light",
    dataNavLayout: "vertical",
    dataHeaderStyles: "light",
    dataVerticalStyle: "overlay",
    dataToggled: isMobileUserAgent() ? "close" : "",
    dataNavStyle: "",
    horStyle: "",
    dataPageStyle: "regular",
    dataWidth: "fullwidth",
    dataMenuPosition: "fixed",
    dataHeaderPosition: "fixed",
    loader: "disable",
    iconOverlay: "",
    colorPrimaryRgb: "",
    colorPrimary: "",
    bodyBg: "",
    Light: "",
    darkBg: "",
    inputBorder: "",
    bgImg: "",
    iconText: "",
    body: "",
};

function isMobileUserAgent() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default function reducer(state = initialState, action:any) {
    let { type, payload } = action;

    switch (type) {
        case "ThemeChanger":
            state = payload;
            return state;
        default:
            return state;
    }
}