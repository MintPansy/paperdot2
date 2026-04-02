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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("fileName", "sample_test.pdf");
    }
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
          src="/svglogo.svg"
          alt="ScholarDot"
          width={420}
          height={148}
          className={styles.logo}
        />
        <div className={styles.buttonContainer}>
          {/* 카카오 로그인 (메인 CTA) */}
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

          {/* 체험 버튼 (기존 구글 버튼 대체) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.demoButton}
            disabled={!!redirecting}
            aria-label="로그인 없이 체험하기"
          >
            {redirecting === "google" ? (
              <span className={styles.buttonLoading}>이동 중...</span>
            ) : (
              <>
                로그인 없이 체험해보기
              </>
            )}
          </button>
        </div>
        <div className={styles.termsContainer}>
          <p className={styles.termsText}>
            로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </p>
          <p className={styles.demoHint}>
            (로그인 없이 일부 기능을 체험할 수 있습니다.)
          </p>

          <Link
            href="https://www.notion.so/ScholarDot-32d844e3f94680faa215c1bcae9c889b?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.termsLinkText}>
            이용약관
          </Link>

          <Link
            href="https://www.notion.so/ScholarDot-32d844e3f946802eb7b5dd734df178f6?source=copy_link"
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
