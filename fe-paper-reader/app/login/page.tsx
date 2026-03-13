"use client";

import React from "react";
import Image from "next/image";
import styles from "./login.module.css";
import Link from "next/link";
import { getApiUrl } from "@/app/config/env";

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = `${getApiUrl()}/oauth2/authorization/kakao`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}/oauth2/authorization/google`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Image
          src="/LoginLogo.svg"
          alt="Paperdot"
          width={314}
          height={110}
          className={styles.logo}
        />
        <div className={styles.buttonContainer}>
          <button onClick={handleGoogleLogin} className={styles.googleButton}>
            <Image src="/googleLogo.svg" alt="Google" width={20} height={20} />
            구글로 시작하기
          </button>
          <button onClick={handleKakaoLogin} className={styles.kakaoButton}>
            <Image src="/kakaoLogo.svg" alt="Kakao" width={20} height={20} />
            카카오로 시작하기
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
