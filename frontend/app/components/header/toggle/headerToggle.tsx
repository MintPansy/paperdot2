"use client";

import Button from "../../button/Button";
import styles from "../readHeader.module.css";

interface HeaderToggleProps {
  filterMode: "all" | "korean" | "english";
  onFilterChange: (mode: "all" | "korean" | "english") => void;
}

export default function HeaderToggle({
  filterMode,
  onFilterChange,
}: HeaderToggleProps) {
  const buttonList = [
    { id: 1, mode: "all" as const, text: "전체" },
    { id: 2, mode: "korean" as const, text: "한글" },
    { id: 3, mode: "english" as const, text: "영어" },
  ];

  return (
    <div className={styles.readHeaderFileNameContainer}>
      {buttonList.map((item) => (
        <Button
          className={
            filterMode === item.mode
              ? styles.readHeaderFileNameButtonActive
              : styles.readHeaderFileNameButton
          }
          key={item.id}
          onClick={() => onFilterChange(item.mode)}>
          {item.text}
        </Button>
      ))}
    </div>
  );
}
