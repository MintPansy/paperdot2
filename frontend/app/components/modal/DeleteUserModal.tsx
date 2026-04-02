"use client";

import styles from "@/app/components/modal/DeleteUserModal.module.css";
import { DELETE_REASON_OPTIONS } from "@/app/consts/deleteConsts";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../button/Button";
import { useClickOutSide } from "@/app/hooks/useClickOutSide";
import { toast, ToastContainer } from "react-toastify";
import { withdraw } from "@/app/services/withdraw";

export default function DeleteUserModal({
  accessToken,
  userInfo,
  setShowDeleteModal,
}: {
  setShowDeleteModal: (show: boolean) => void;
  accessToken: string;
  userInfo: {
    email: string;
    nickname: string;
    profileImageUrl: string;
  };
}) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [agreeChecked, setAgreeChecked] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>("");
  const customOptionsRef = useRef<HTMLUListElement>(null);

  useClickOutSide(
    customOptionsRef as React.RefObject<HTMLElement>,
    setShowDropdown
  );

  const handleConfirmDelete = async () => {
    try {
      if (!accessToken) {
        toast.error("로그인 상태가 아닙니다. 다시 로그인해주세요.");
        return;
      }

      const response = await withdraw(
        userInfo?.email?.includes("gmail.com") ? "google" : "kakao",
        accessToken
      );
      if (response.ok) {
        setShowDeleteModal(false);
        window.location.href = "/";
      } else {
        toast.error("회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className={styles.deleteModal}>
      <ToastContainer position="top-right" theme="colored" autoClose={1500} />

      <div className={styles.deleteModalContent}>
        <div className={styles.deleteModalTitleRow}>
          <span className={styles.deleteModalIcon} aria-hidden>
            <AlertTriangle size={18} />
          </span>
          <h2 className={styles.deleteModalTitle}>회원 탈퇴</h2>
        </div>

        <p className={styles.deleteModalMessage}>
          탈퇴 시 번역 기록과 계정 정보가 모두 삭제됩니다.
          <br />
          삭제된 데이터는 복구할 수 없습니다.
        </p>

        <label className={styles.agreeCheckboxWrap}>
          <span className={styles.agreeCheckboxTitle}>최종 확인</span>
          <span className={styles.agreeCheckbox}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={agreeChecked}
            onChange={() => setAgreeChecked((prev) => !prev)}
            aria-label="탈퇴 동의 체크박스"
          />
            <span className={styles.checkboxLabel}>
              위 내용을 이해했으며 탈퇴에 동의합니다
            </span>
          </span>
        </label>

        <div className={styles.deleteReasonSection}>
          <label className={styles.deleteReasonLabel}>
            탈퇴 이유를 선택해주세요 (선택사항)
          </label>

          {/* 🔥 커스텀 드롭다운 */}
          <div className={styles.selectWrapper}>
            <div
              className={
                showDropdown
                  ? styles.customSelectValueHidden
                  : styles.customSelectValue
              }
              onClick={() => setShowDropdown((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label="탈퇴 사유 선택"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowDropdown((prev) => !prev);
                }
              }}>
              <p className={styles.customSelectValueText}>
                {selectedReason || "선택해주세요"}
              </p>
              <ChevronDown className={styles.dropdownIcon} />
            </div>

            {showDropdown && (
              <ul className={styles.customOptions} ref={customOptionsRef}>
                {DELETE_REASON_OPTIONS.map((option) => (
                  <li
                    key={option.value}
                    className={styles.customOption}
                    onClick={() => {
                      setSelectedReason(option.label);
                      setShowDropdown(false);
                    }}>
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 기타 선택 시 textarea */}
          {selectedReason === "기타(직접입력)" && (
            <div className={styles.customReasonWrapper}>
              <textarea
                placeholder="직접 입력해주세요"
                className={styles.customReasonTextarea}
                maxLength={80}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
              <div className={styles.charCountWrapper}>
                <span className={styles.charCountCurrent}>
                  {customReason.length}
                </span>
                <span className={styles.charCountMax}> / 80</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.deleteModalButtons}>
          <Button
            className={styles.deleteModalCancelBtn}
            onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className={
              agreeChecked
                ? styles.deleteModalConfirmBtn
                : styles.deleteModalConfirmBtnDisabled
            }>
            회원 탈퇴
          </Button>
        </div>
      </div>
    </div>
  );
}
