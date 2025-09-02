let initialState = {
    lang: "en",
    dir: "ltr",
    class: "dark",
    dataMenuStyles: "dark",
    dataNavLayout: "vertical",
    dataHeaderStyles: "dark",
    dataVerticalStyle: "overlay",
    dataToggled:  "close",
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