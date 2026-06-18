"use client";

import { useApp } from "@/app/(main)/context";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export default function Menu(props: { links: NavLink[]; socials?: ReactNode }) {
  const { links, socials } = props;

  const app = useApp();
  const isOpen = app((x) => x.isMenuOpen);
  const close = () =>
    app.setState((x) => {
      x.isMenuOpen = false;
    });

  //lock body scroll while the menu is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 left-0 w-full md:hidden bg-background text-foreground z-30 overflow-hidden border-b border-foreground/10"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { height: 0 },
            animate: {
              height: "100%",
              transition: { duration: 0.45, ease: "easeOut", when: "beforeChildren" },
            },
            exit: {
              height: 0,
              transition: { duration: 0.35, ease: "easeIn", when: "afterChildren" },
            },
          }}
        >
          <div className="h-dvh flex flex-col pt-[88px]">
            <motion.nav
              aria-label="Mobile menu"
              className="flex-1 flex flex-col justify-center gap-1 px-6"
              variants={{
                animate: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.12 },
                },
                exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              }}
            >
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  variants={{
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 16 },
                  }}
                >
                  <Link
                    href={l.href}
                    onClick={close}
                    className="group flex flex-row items-baseline gap-5 py-2 font-title"
                  >
                    <span className="w-6 text-sm tabular-nums opacity-40">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-4xl sm:text-5xl leading-none opacity-90 transition-opacity group-active:opacity-50">
                      {l.label}
                    </span>
                    <i className="icon-[ri--arrow-right-up-line] self-center ml-auto text-2xl opacity-25 transition-opacity duration-200 group-hover:opacity-60 group-active:opacity-60" />
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <motion.div
              className="flex items-center justify-between gap-4 px-6 py-8 border-t border-foreground/10"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { delay: 0.22 } },
                exit: { opacity: 0 },
              }}
            >
              <div className="flex flex-row items-center gap-1">{socials}</div>
              <Link
                href="mailto:sfrady20@gmail.com"
                onClick={close}
                className="font-title text-sm underline underline-offset-4 opacity-70"
              >
                Get in touch
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
