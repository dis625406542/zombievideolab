"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Clapperboard, Film } from "lucide-react";
import styles from "./video-generators-nav.module.css";

const generators = [
  { href: "/", title: "Zombie Couple Video Generator", description: "Two-photo zombie love story · 8 seconds", Icon: Film },
  { href: "/video/tiptoeing-in-my-jordans", title: "Tiptoeing In My Jordans AI Video Generator", description: "Dancer + seated observer · 15 seconds", Icon: Clapperboard },
] as const;

/** Ordinary navigation links, server-rendered even while the disclosure is closed. */
export function VideoGeneratorsNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const openedByHover = useRef(false);

  function close() {
    openedByHover.current = false;
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        openedByHover.current = false;
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <div ref={root} className={`video-generators-nav ${styles.root}`}
    onPointerEnter={event => {
      if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !open) {
        openedByHover.current = true;
        setOpen(true);
      }
    }}
    onPointerLeave={event => {
      if (event.pointerType === "mouse" && !root.current?.contains(document.activeElement)) close();
    }}
    onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }}
    onKeyDown={event => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        close();
        trigger.current?.focus();
      }
    }}>
    <button ref={trigger} className={styles.trigger} type="button" aria-expanded={open} aria-controls={panelId}
      onClick={() => {
        if (openedByHover.current) {
          openedByHover.current = false;
          setOpen(true);
        } else setOpen(value => !value);
      }}>
      Video Generators <ChevronDown size={14} aria-hidden="true" className={styles.chevron}/>
    </button>
    <div id={panelId} className={styles.panel} hidden={!open}>
      <p className={styles.eyebrow}>CHOOSE YOUR VIDEO TEMPLATE</p>
      {generators.map(({ href, title, description, Icon }) => <a key={href} href={href} className={styles.link}
        aria-current={pathname === href ? "page" : undefined} onClick={close}>
        <span className={styles.icon}><Icon size={19} aria-hidden="true"/></span>
        <span className={styles.copy}><span className={styles.title}>{title}</span><span className={styles.description}>{description}</span></span>
        <ArrowUpRight size={15} aria-hidden="true" className={styles.arrow}/>
      </a>)}
      <p className={styles.footnote}>One-time purchase · No account needed</p>
    </div>
  </div>;
}
