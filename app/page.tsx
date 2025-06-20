"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  useEffect(() => {

  }, []);

 

  const router = useRouter();
  const RouteChange = () => {
    let path = "/dashboard?tab=overview";
    router.push(path);
  };
  RouteChange()

}
