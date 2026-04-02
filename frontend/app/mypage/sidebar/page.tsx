"use client";

import styles from "@/app/mypage/sidebar/sidebar.module.css";
import { SIDEBAR_ITEMS } from "@/app/consts/sideBarConsts";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.buttonGroup}>
          {SIDEBAR_ITEMS.map((item) => (
            <div className={styles.tabButtonContainer} key={item.label}>
              <Link
                href={item.href}
                className={`${styles.tabButton} ${
                  pathname === item.href ? styles.tabButtonActive : ""
                }`}>
                <Image
                  src={pathname === item.href ? item.activeIcon : item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={styles.tabButtonIcon}
                />
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
