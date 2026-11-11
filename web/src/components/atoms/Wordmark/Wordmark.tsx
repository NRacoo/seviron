import Image from "next/image";
import styles from "./Wordmark.module.css";

export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className={`${styles.root} ${tone === "light" ? styles.light : ""}`}>
      <Image src={"/images/SEV.png"} className="object-cover" width={40} height={40} alt="logo seviron"/>
      <span className={styles.word}>Seviron</span>
    </span>
  );
}
