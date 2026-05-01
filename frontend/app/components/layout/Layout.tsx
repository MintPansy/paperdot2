"use client";

import React, { useEffect, useRef } from "react";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import AuthBootstrap from "@/app/components/auth/AuthBootstrap";
import Sidebar from "@/app/mypage/sidebar/page";
import mypageLayout from "@/app/mypage/mypageLayout.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useLoginStore } from "@/app/store/useLogin";
import { toast, ToastContainer } from "react-toastify";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userInfo = useLoginStore((state) => state.userInfo);
  const authHydrated = useLoginStore((state) => state.authHydrated);
  const router = useRouter();

  const protectedRoutes =
    pathname.includes("/mypage") || pathname.includes("/read");

  const hasShownAuthToast = useRef(false);
  useEffect(() => {
    if (!authHydrated || !protectedRoutes || userInfo?.userId) {
      hasShownAuthToast.current = false;
      return;
    }

    if (!hasShownAuthToast.current) {
      toast.error("로그인 상태가 아닙니다. 다시 로그인해주세요.");
      hasShownAuthToast.current = true;
    }
    router.replace("/login");
  }, [protectedRoutes, userInfo?.userId, authHydrated, router]);

  const isMypage =
    pathname === "/mypage/mydocument" || pathname === "/mypage/account";

  const showLegalPage = pathname === "/terms" || pathname === "/privacy";
  const showHeaderFooter = pathname === "/" || isMypage || showLegalPage;
  const showHeaderOnly = pathname === "/newdocument";

  let main: React.ReactNode;
  if (protectedRoutes && !authHydrated) {
    main = (
      <>
        <ToastContainer position="top-center" autoClose={1000} />
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "0.95rem",
          }}>
          세션 확인 중…
        </div>
      </>
    );
  } else if (protectedRoutes && authHydrated && !userInfo?.userId) {
    main = <ToastContainer position="top-center" autoClose={1000} />;
  } else {
    main = (
      <>
        <ToastContainer position="top-center" autoClose={4000} />
        {(showHeaderFooter || showHeaderOnly) && <Header />}
        {isMypage ? (
          <div className={mypageLayout.root}>
            <Sidebar />
            <div className={mypageLayout.main}>{children}</div>
          </div>
        ) : (
          <>{children}</>
        )}
        {showHeaderFooter && <Footer />}
      </>
    );
  }

  return (
    <>
      <AuthBootstrap />
      {main}
    </>
  );
}
