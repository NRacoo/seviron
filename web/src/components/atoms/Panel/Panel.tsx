import styles from "./Panel.module.css";

export function Panel({
  title,
  caption,
  aside,
  padded = true,
  children,
}: {
  title?: string;
  caption?: string;
  aside?: React.ReactNode;
  padded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.panel}>
      {title ? (
        <header className={styles.head}>
          <div>
            <h3 className={styles.title}>{title}</h3>
            {caption ? <p className={styles.caption}>{caption}</p> : null}
          </div>
          {aside ? <div className={styles.aside}>{aside}</div> : null}
        </header>
      ) : null}
      <div className={padded ? styles.body : undefined}>{children}</div>
    </section>
  );
}
