"use client";

import { useApp } from "@/app/(main)/context";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode } from "react";

export default function (props: { children?: ReactNode; socials?: ReactNode }) {
  const { children, socials } = props;

  const app = useApp();
  const isOpen = app((x) => x.isMenuOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.menu
          className="fixed top-0 left-0 w-full bg-[black] text-[white] z-[30] flex flex-col items-center overflow-hidden"
          initial="inital"
          animate="animate"
          exit="exit"
          variants={{
            initial: { height: "0%" },
            animate: {
              height: "100%",
              transition: {
                when: "beforeChildren",
                staggerDirection: 1,
                staggerChildren: 0.1,
              },
            },
            exit: {
              height: "0%",
              transition: {
                when: "afterChildren",
                staggerDirection: -1,
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.nav
            className="flex-1 flex flex-col items-center justify-center gap-4 pt-[80px]"
            variants={{
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.9 },
            }}
          >
            {children}
          </motion.nav>
          <motion.ul
            className="p-10"
            variants={{
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.9 },
            }}
          >
            {socials}
          </motion.ul>
        </motion.menu>
      )}
    </AnimatePresence>
  );
}
