"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/app/config/env";
import { toast } from "react-toastify";
import { useLoginStore } from "@/app/store/useLogin";

export default function LoginPage() {
  const [redirecting, setRedirecting] = useState<"google" | "kakao" | null>(null);
  const router = useRouter();
  const setLogin = useLoginStore((s) => s.setLogin);
  const setUserInfoState = useLoginStore((s) => s.setUserInfo);

  const handleGoogleLogin = () => {
    // UI 데모만 필요할 때: 백엔드 OAuth를 타지 않고 화면만 데모 유저처럼 진입
    setRedirecting("google");
    setLogin(true);
    setUserInfoState({
      userId: "demo-user",
      profileImageUrl: "/userImage.svg",
      nickname: "데모유저",
      email: "demo@example.com",
    });
    router.push("/read");
  };

  const handleKakaoLogin = () => {
    setRedirecting("kakao");
    window.location.href = `${getApiUrl()}/oauth2/authorization/kakao`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      toast.error("로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Image
          src="/newlogo.png"
          alt="ScholarDot"
          width={420}
          height={148}
          className={styles.logo}
        />
        <div className={styles.buttonContainer}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            disabled={!!redirecting}
            aria-label="구글로 로그인"
          >
            {redirecting === "google" ? (
              <span className={styles.buttonLoading}>이동 중...</span>
            ) : (
              <>
                <Image src="/googleLogo.svg" alt="" width={20} height={20} aria-hidden />
                구글로 시작하기
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleKakaoLogin}
            className={styles.kakaoButton}
            disabled={!!redirecting}
            aria-label="카카오로 로그인"
          >
            {redirecting === "kakao" ? (
              <span className={styles.buttonLoading}>이동 중...</span>
            ) : (
              <>
                <Image src="/kakaoLogo.svg" alt="" width={20} height={20} aria-hidden />
                카카오로 시작하기
              </>
            )}
          </button>
        </div>
        <div className={styles.termsContainer}>
          <p className={styles.termsText}>
            로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </p>
          <Link
            href="https://www.notion.so/2fbeb2f40de780c5b996fc19312ca446?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.termsLinkText}>
            이용약관
          </Link>
          <Link
            href="https://www.notion.so/2f4eb2f40de7802f8539e4762234b41d?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.termsLinkText}>
            개인정보처리방침
          </Link>
        </div>
      </div>
    </div>
  );
}
