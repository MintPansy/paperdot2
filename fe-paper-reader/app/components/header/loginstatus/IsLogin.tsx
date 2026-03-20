"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderModal from "../../modal/HeaderModal";
import Link from "next/link";
import styles from "../../modal/headerModal.module.css";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { getApiUrl } from "@/app/config/env";

const AUTH_ERROR_MESSAGE = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";

export default function IsLogin() {
  const [isLogin, setIsLogin] = useState<{ accessToken: string } | null>(null);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setUserInfoState = useLoginStore((state) => state.setUserInfo);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/token`, {
          method: "POST",
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.accessToken) {
          setIsLogin(data);
          setAccessToken(data.accessToken);
        } else {
          setIsLogin(null);
          setAccessToken(null);
        }
      } catch {
        setIsLogin(null);
        setAccessToken(null);
        toast.error(AUTH_ERROR_MESSAGE);
      }
    };
    fetchToken();
  }, [setAccessToken]);

  useEffect(() => {
    if (!isLogin?.accessToken) {
      setUserInfoState({
        profileImageUrl: "",
        nickname: "",
        email: "",
      });
      setAccessToken(null);
      return;
    }
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${isLogin.accessToken}`,
          },
        });
        if (!response.ok) throw new Error("User fetch failed");
        const data = await response.json();
        setUserInfoState(data);
      } catch {
        setIsLogin(null);
        setUserInfoState({
          profileImageUrl: "",
          nickname: "",
          email: "",
        });
        setAccessToken(null);
        toast.error(AUTH_ERROR_MESSAGE);
      }
    };
    fetchUserInfo();
  }, [isLogin?.accessToken, setUserInfoState, setAccessToken]);

  return (
    <>
      {isLogin?.accessToken ? (
        <HeaderModal
          accessToken={isLogin?.accessToken}
          onLogout={() => {
            setIsLogin(null);
            setUserInfoState({
              profileImageUrl: "",
              nickname: "",
              email: "",
            });
          }}
        />
      ) : (
        <Link href="/login" className={styles.loginLink}>
          로그인/회원가입
        </Link>
      )}
    </>
  );
}
