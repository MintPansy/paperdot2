"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./readHeader.module.css";
import HeaderModal from "../modal/HeaderModal";
import HeaderToggle from "./toggle/headerToggle";
import Button from "../button/Button";

interface ReadHeaderProps {
  fileName: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleSidebar: () => void;
  filterMode: "all" | "korean" | "english";
  onFilterChange: (mode: "all" | "korean" | "english") => void;
}

export default function ReadHeader({
  fileName,
  currentPage,
  totalPages,
  onToggleSidebar,
  filterMode,
  onFilterChange,
}: ReadHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href={"/"} className={styles.link}>
          <Image src="/svglogo.svg" alt="PaperDot" width={180} height={60} />
        </Link>
        <div className={styles.readHeaderLeftControls}>
          <Button
            className={styles.readHeaderUserImageButton}
            onClick={onToggleSidebar}>
            <Image src="/slide.svg" alt="slide" width={24} height={24} />
          </Button>
          <div
            className={styles.readHeaderPageNumber}
            role="status"
            aria-live="polite"
            aria-label={`현재 ${currentPage}페이지, 전체 ${totalPages}페이지`}>
            <span className={styles.readHeaderPageNumberCurrent}>
              {currentPage}
            </span>
            <span className={styles.readHeaderPageNumberSeparator}>/</span>
            <span className={styles.readHeaderPageNumberTotal}>
              {totalPages}
            </span>
            <span className={styles.readHeaderPageNumberUnit}>페이지</span>
          </div>
        </div>
        {fileName && <p className={styles.readHeaderFileName}>{fileName}</p>}
        <div className={styles.readHeaderRightSection}>
          <HeaderToggle
            filterMode={filterMode}
            onFilterChange={onFilterChange}
          />
          <HeaderModal isReadHeader={true} className={styles.readHeaderModal} />
        </div>
      </div>
    </header>
  );
}
