"use client";

import React, { useEffect, useRef } from "react";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import Sidebar from "@/app/mypage/sidebar/page";
import { usePathname, useRouter } from "next/navigation";
import { useLoginStore } from "@/app/store/useLogin";
import { toast, ToastContainer } from "react-toastify";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userInfo = useLoginStore((state) => state.userInfo);
  const router = useRouter();

  const protectedRoutes =
    pathname.includes("/mypage") || pathname.includes("/read");

  const hasShownAuthToast = useRef(false);
  useEffect(() => {
    if (!protectedRoutes || userInfo) {
      hasShownAuthToast.current = false;
      return;
    }

    if (!hasShownAuthToast.current) {
      toast.error("로그인 상태가 아닙니다. 다시 로그인해주세요.");
      hasShownAuthToast.current = true;
    }
    router.replace("/login");
  }, [protectedRoutes, userInfo, router]);

  if (protectedRoutes && !userInfo) {
    return <ToastContainer position="top-center" autoClose={1000} />;
  }

  const isMypage =
    pathname === "/mypage/mydocument" || pathname === "/mypage/account";

  const showHeaderFooter = pathname === "/" || isMypage;
  const showHeaderOnly = pathname === "/newdocument";

  return (
    <>
      <ToastContainer position="top-center" autoClose={4000} />
      {(showHeaderFooter || showHeaderOnly) && <Header />}
      {isMypage ? (
        <div style={{ display: "flex", width: "100%", height: "100vh" }}>
          <Sidebar />
          {children}
        </div>
      ) : (
        <>{children}</>
      )}
      {showHeaderFooter && <Footer />}
    </>
  );
}
