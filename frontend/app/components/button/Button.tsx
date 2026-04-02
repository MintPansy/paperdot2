import styles from "./button.module.css";

export default function Button({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${className ? className : styles.button} `}>
      {children}
    </button>
  );
}
