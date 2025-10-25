"use client";

import { Provider } from "react-redux";
import store from "@/shared/redux/store";
import PrelineScript from "./PrelineScript";
import { useState } from "react";
import { Initialload } from "@/shared/contextapi";
import dynamic from "next/dynamic";
import { ThirdwebProvider } from "thirdweb/react";

// Dynamically import OnchainProviders to handle blockchain-specific functionality
const MiniKitContextProvider = dynamic(
  () => import("./(components)/MiniKitContextProvider"),
  {
    ssr: false,
  }
);

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [pageloading, setpageloading] = useState(false);

  return (
    <Provider store={store}>
      <Initialload.Provider value={{ pageloading, setpageloading }}>
        <MiniKitContextProvider>
          <ThirdwebProvider>
            {children}
          </ThirdwebProvider>
        </MiniKitContextProvider>
      </Initialload.Provider>
      <PrelineScript />
    </Provider>
  );
}
