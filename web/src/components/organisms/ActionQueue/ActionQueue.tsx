"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Icon } from "@/components/atoms/Icon/Icon";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import type { Action } from "@/types/decision";
import styles from "./ActionQueue.module.css";

export function ActionQueue({ actions }: { actions: Action[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(actions.map((a) => [a.id, a.enabled])),
  );
  const [approvedRef, setApprovedRef] = useState<string | null>(null);

  const count = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  function approve() {
    const ref = `AUD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(
      Math.floor(Math.random() * 900) + 100,
    )}`;
    setApprovedRef(ref);
  }

  return (
    <Panel
      title="Action queue"
      caption="Controls proposed by the decision engine for the next shift. Approval is written to the ESG audit trail."
      aside={<Tag tone="brand">{count} selected</Tag>}
      padded={false}
    >
      <ul className={styles.list}>
        {actions.map((a) => {
          const on = selected[a.id] ?? false;
          return (
            <li key={a.id} className={styles.item}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={approvedRef !== null}
                  onChange={() => setSelected((s) => ({ ...s, [a.id]: !on }))}
                  className={styles.input}
                />
                <span className={styles.box} aria-hidden>
                  {on ? <Icon name="check" size={11} strokeWidth={2.4} /> : null}
                </span>
              </label>

              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <span className={styles.label}>{a.label}</span>
                  <Tag>{a.reference}</Tag>
                </div>
                <p className={styles.detail}>{a.detail}</p>
                <div className={styles.meta}>
                  <span>{a.owner}</span>
                  <span className={styles.sep} />
                  <span className={styles.window}>
                    <Icon name="clock" size={12} />
                    {a.window}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className={styles.foot}>
        {approvedRef ? (
          <div className={styles.approved}>
            <span className={styles.approvedIcon}>
              <Icon name="check" size={14} strokeWidth={2.2} />
            </span>
            <div>
              <span className={styles.approvedTitle}>{count} controls approved</span>
              <span className={styles.approvedRef}>
                Written to ESG audit trail · reference {approvedRef}
              </span>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.footNote}>
              Approval dispatches notifications and logs an immutable audit entry.
            </p>
            <Button variant="primary" onClick={approve} disabled={count === 0}>
              Approve {count} control{count === 1 ? "" : "s"}
            </Button>
          </>
        )}
      </footer>
    </Panel>
  );
}
