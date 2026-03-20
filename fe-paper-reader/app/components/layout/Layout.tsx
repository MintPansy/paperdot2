"use client";

import React from "react";
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

  if (protectedRoutes && !userInfo) {
    toast.error("로그인 상태가 아닙니다. 다시 로그인해주세요.");
    router.push("/login");
    return <ToastContainer autoClose={1000} />;
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
