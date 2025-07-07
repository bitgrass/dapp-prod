"use client";

import "./globals.scss";
import { Provider } from "react-redux";
import store from "@/shared/redux/store";
import PrelineScript from "./PrelineScript";
import { useState } from "react";
import { Initialload } from "@/shared/contextapi";
import dynamic from "next/dynamic";

// Dynamically import OnchainProviders to handle blockchain-specific functionality
const MiniKitContextProvider = dynamic(
  () => import("./(components)/MiniKitContextProvider"),
  {
    ssr: false,
  }
);

const RootLayout = ({ children }: any) => {
  const [pageloading, setpageloading] = useState(false);

  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <Initialload.Provider value={{ pageloading, setpageloading }}>
            {/* Wrap blockchain-specific components with OnchainProviders */}
            <MiniKitContextProvider >
              {children}
            </MiniKitContextProvider >
          </Initialload.Provider>
        </Provider>
        <PrelineScript />
      </body>
    </html>
  );
};

export default RootLayout;
