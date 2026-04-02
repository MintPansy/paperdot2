"use client";

import { useState } from "react";
import styles from "@/app/mypage/account/account.module.css";
import Button from "@/app/components/button/Button";
import Image from "next/image";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { logout } from "@/app/services/logout";
import { useHttps } from "@/app/utils/useHttps";
import DeleteUserModal from "@/app/components/modal/DeleteUserModal";

export default function MyAccount() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const userInfo = useLoginStore((state) => state.userInfo);
  const setUserInfoState = useLoginStore((state) => state.setUserInfo);
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const isGoogleUser = userInfo?.email?.includes("gmail.com");
  const loginProviderText = isGoogleUser
    ? "구글 연동 로그인"
    : "카카오톡 연동 로그인";
  const profileSubInfo = `${isGoogleUser ? "구글 로그인" : "카카오 로그인"} · 최근 활동 없음`;

  const handleLogoutClick = async () => {
    try {
      if (accessToken) {
        await logout(accessToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 상태 완전히 초기화 (에러가 발생해도 초기화)
      setAccessToken(null);
      // userInfo를 null로 설정하여 로그인 전 상태로 복귀
      setUserInfoState({
        profileImageUrl: "",
        nickname: "",
        email: "",
      });
      // 완전히 새로고침하여 로그인 전 헤더 상태로 복귀
      window.location.href = "/";
    }
  };

  return (
    <main className={styles.accountSection}>
      <section className={styles.profileSummaryCard}>
        <div className={styles.profileSummaryLeft}>
          <div className={styles.accountProfileImageSmallContainer}>
            {userInfo?.profileImageUrl?.includes("http") ? (
              <Image
                src={useHttps(userInfo.profileImageUrl)}
                alt="profile"
                width={80}
                height={80}
                className={styles.accountProfileImage}
                unoptimized
              />
            ) : (
              <Image
                src={userInfo?.profileImageUrl || "/userImage.svg"}
                alt="profile"
                width={80}
                height={80}
                className={styles.accountProfileImage}
              />
            )}
          </div>
          <div className={styles.profileSummaryText}>
            <p className={styles.profileEyebrow}>내 계정</p>
            <h2 className={styles.accountProfileNameSmall}>
              {userInfo?.nickname || "김유저"}
            </h2>
            <p className={styles.profileEmail}>{userInfo?.email || "-"}</p>
            <p className={styles.profileSubInfo}>{profileSubInfo}</p>
          </div>
        </div>
        <Button
          className={styles.accountLogoutBtnTop}
          onClick={handleLogoutClick}>
          로그아웃
        </Button>
      </section>

      <section className={styles.infoCard}>
        <h3 className={styles.cardTitle}>계정 정보</h3>
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <p className={styles.accountFormLabel}>이름</p>
            <p className={styles.infoValue}>{userInfo?.nickname || "김유저"}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.accountFormLabel}>이메일</p>
            <p className={styles.infoValue}>{userInfo?.email || "-"}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.accountFormLabel}>소셜 로그인</p>
            <div className={styles.accountSocialLoginRight}>
              <Image
                src={isGoogleUser ? "/googleLogo.svg" : "/kakaoIcon.svg"}
                alt={isGoogleUser ? "google" : "kakao"}
                width={20}
                height={20}
                className={isGoogleUser ? styles.googleLogo : ""}
              />
              <p className={styles.accountSocialLoginText}>{loginProviderText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.dangerCard}>
        <h3 className={styles.dangerTitle}>위험 영역</h3>
        <p className={styles.dangerDescription}>
          계정 삭제 시 번역 기록과 계정 정보가 모두 삭제되며 복구할 수 없습니다.
        </p>
        <Button
          onClick={() => setShowDeleteModal(true)}
          className={styles.deleteAccountButton}>
          회원 탈퇴
        </Button>
      </section>
      {showDeleteModal && (
        <DeleteUserModal
          setShowDeleteModal={setShowDeleteModal}
          accessToken={accessToken as string}
          userInfo={
            userInfo as {
              email: string;
              nickname: string;
              profileImageUrl: string;
            }
          }
        />
      )}
    </main>
  );
}
