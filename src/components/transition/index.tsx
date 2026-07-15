"use client";

import { ReactNode, useContext, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { clearSwappedPath, isSwappedPath } from "@/utils/swap-url";

/**
 * freezes the router context for the exiting subtree so the OLD page keeps
 * rendering its own content during its exit animation. without this, next
 * swaps the new route in instantly and the exit animation shows new content.
 */
function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  if (!frozen) return <>{children}</>;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

/**
 * page -> page transition: the outgoing page fades + scales out, then the
 * incoming page fades + scales in (AnimatePresence mode="wait"). keyed on the
 * pathname so hash links (e.g. /#apps) don't trigger it.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  //css kill switch can't reach motion's raf loop, so handle it here
  const reduce = useReducedMotion();

  //tools swap their url in place (swapUrl) as the user flips their switcher.
  //those pathname changes are not navigations - keep the key stable so the
  //page doesn't remount (which would reset tool state) or animate
  const [lastPathname, setLastPathname] = useState(pathname);
  const [navKey, setNavKey] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (!isSwappedPath(pathname)) {
      setNavKey(pathname);
      clearSwappedPath();
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={navKey}
        ref={ref}
        initial={"initial"}
        animate={"animate"}
        exit={"exit"}
        variants={{
          initial: { opacity: 0, scale: reduce ? 1 : 0.99 },
          animate: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: reduce ? 0 : 0.36,
              when: "beforeChildren",
            },
          },
          exit: {
            opacity: 0,
            scale: reduce ? 1 : 0.99,
            transition: {
              duration: reduce ? 0 : 0.36,
              when: "afterChildren",
            },
          },
        }}
        onAnimationComplete={() => {
          //drop the residual transform so position:sticky keeps working at rest
          if (ref.current) ref.current.style.transform = "";
        }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
