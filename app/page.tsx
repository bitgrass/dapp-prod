"use client"
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);



  const router = useRouter();
  const RouteChange = () => {
    let path = "/dashboard?tab=overview";
    router.push(path);
  };
  RouteChange()

}
