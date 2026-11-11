import styles from "./Button.module.css";

export function Button({
  children,
  variant = "secondary",
  size = "md",
  full = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  size?: "sm" | "md";
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[styles.btn, styles[variant], styles[size], full ? styles.full : ""].join(" ")}
    >
      {children}
    </button>
  );
}
