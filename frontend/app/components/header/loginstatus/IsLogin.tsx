"use client";

import React from "react";
import HeaderModal from "../../modal/HeaderModal";
import Link from "next/link";
import styles from "../../modal/headerModal.module.css";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";

export default function IsLogin() {
  const authHydrated = useLoginStore((state) => state.authHydrated);
  const userInfo = useLoginStore((state) => state.userInfo);
  const setUserInfoState = useLoginStore((state) => state.setUserInfo);
  const setLogin = useLoginStore((state) => state.setLogin);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);

  if (!authHydrated) {
    return (
      <span
        className={styles.loginLink}
        style={{ visibility: "hidden", width: 72, display: "inline-block" }}
        aria-hidden
      />
    );
  }

  if (userInfo?.userId) {
    return (
      <HeaderModal
        onLogout={() => {
          setUserInfoState(null);
          setAccessToken(null);
          setLogin(false);
        }}
      />
    );
  }

  return (
    <Link href="/login" className={styles.loginLink}>
      로그인/회원가입
    </Link>
  );
}
