"use client";

import {
  ReactNode,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useContext,
  useCallback,
  useMemo,
  createContext,
  HTMLAttributes,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Badge } from "earthling-ui/badge";
import { Button } from "earthling-ui/button";
import Link from "next/link";
import { cn } from "@/utils/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

//useLayoutEffect warns during SSR; fall back to useEffect on the server
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface RouterLinkProps extends HTMLAttributes<HTMLDivElement> {
  href: string;
  scroll?: boolean;
}

export function RouterLink(props: RouterLinkProps) {
  const { href, scroll, ...rest } = props;
  const router = useRouter();
  return (
    <div
      {...rest}
      onClick={() => {
        router.push(href, { scroll });
      }}
    />
  );
}

//giant ghost-type ticker. decorative only, hence aria-hidden
export function Marquee(props: { items: string[]; reverse?: boolean }) {
  const { items, reverse } = props;
  const row = items.map((x) => `${x} · `).join("");
  return (
    <div
      aria-hidden
      className="overflow-hidden whitespace-nowrap py-[20px] sm:py-[28px] xl:py-[36px] select-none bg-surface duration-500 ease-in-out transition-colors"
    >
      <div
        className="inline-block animate-[marquee_40s_linear_infinite] font-title uppercase text-3xl sm:text-5xl xl:text-6xl opacity-[0.1] leading-none"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

const platformIcons: Record<string, { icon: string; label: string }> = {
  web: { icon: "icon-[ri--global-fill]", label: "Web" },
  desktop: { icon: "icon-[ri--computer-fill]", label: "Desktop" },
  mobile: { icon: "icon-[ri--smartphone-fill]", label: "Mobile" },
};

interface ProjectData {
  id: string;
  label: string;
  year: string;
  description: string;
  platforms: string[];
  languages: string[];
  frameworks: string[];
  hasVideo?: boolean;
  links?: { link: string; icon: string }[];
}

function ProjectMedia(props: { project: ProjectData; className?: string }) {
  const { project: p, className } = props;
  return (
    <>
      <img
        src={`/projects/${p.id}.webp`}
        width={400}
        height={400}
        alt={`${p.label}`}
        className={cn(
          "absolute left-0 top-0 w-full h-full z-[1] object-cover",
          className,
        )}
      />
      {p.hasVideo && (
        <video
          muted
          autoPlay
          playsInline
          loop
          src={`/projects/${p.id}.webm`}
          className={cn(
            "absolute left-0 top-0 w-full h-full z-[2] object-cover",
            className,
          )}
        />
      )}
    </>
  );
}

//the shared floating thumbnail card
const CARD_W = 360;
const CARD_H = 280;
const CARD_GAP = 48;
//each row flies the card to its own rotation, cycled by registration order
const ROTATIONS = [-7, 5, -4, 8, -5, 6, -3, 7];

type CardTarget = {
  id: string;
  project: ProjectData;
  x: number;
  y: number;
  rotate: number;
};

type Registered = { el: HTMLElement; project: ProjectData };

type ShowcaseCtx = {
  openId: string | null;
  setOpen: (id: string | null) => void;
  hover: (id: string) => void;
  unhover: (id: string) => void;
  register: (project: ProjectData, el: HTMLElement | null) => void;
};

const ShowcaseContext = createContext<ShowcaseCtx | null>(null);

/**
 * wraps all the project subsections and owns ONE flying thumbnail card shared
 * across them. the card crossfades its art between rows, parks on whichever row
 * is open when nothing is hovered, and only animates in/out on first/last show.
 */
export function ProjectShowcase({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rows = useRef(new Map<string, Registered>());
  const order = useRef<string[]>([]);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [target, setTarget] = useState<CardTarget | null>(null);

  //hovered wins; falls back to the open row so the card parks there on leave
  const activeId = hoveredId ?? openId;

  const register = useCallback(
    (project: ProjectData, el: HTMLElement | null) => {
      if (el) {
        rows.current.set(project.id, { el, project });
        if (!order.current.includes(project.id)) order.current.push(project.id);
      } else {
        rows.current.delete(project.id);
      }
    },
    [],
  );

  //measure the active row relative to the wrapper, place the card to its left.
  //runs before paint + on resize so the card never flashes at a stale spot.
  useIsoLayoutEffect(() => {
    if (!activeId) {
      setTarget(null);
      return;
    }
    const compute = () => {
      const wrap = wrapperRef.current;
      const reg = rows.current.get(activeId);
      if (!wrap || !reg) return;
      const w = wrap.getBoundingClientRect();
      const r = reg.el.getBoundingClientRect();
      //r is the whole item, so an open row centers the card on its full height
      const x = Math.max(16, r.left - w.left - CARD_W - CARD_GAP);
      const y = r.top - w.top + r.height / 2 - CARD_H / 2;
      const idx = order.current.indexOf(activeId);
      const rotate = reduce
        ? 0
        : ROTATIONS[
            ((idx % ROTATIONS.length) + ROTATIONS.length) % ROTATIONS.length
          ];
      setTarget({ id: activeId, project: reg.project, x, y, rotate });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [activeId, openId, reduce]);

  const hover = useCallback((id: string) => setHoveredId(id), []);
  const unhover = useCallback(
    (id: string) => setHoveredId((prev) => (prev === id ? null : prev)),
    [],
  );

  //memoized so a hover only re-renders the card, not every section + its refs
  const ctx = useMemo<ShowcaseCtx>(
    () => ({ openId, setOpen: setOpenId, hover, unhover, register }),
    [openId, hover, unhover, register],
  );

  return (
    <ShowcaseContext.Provider value={ctx}>
      <div ref={wrapperRef} className="relative">
        {children}

        {/* one shared card - art crossfades, position springs between rows */}
        <AnimatePresence>
          {target && (
            <motion.div
              aria-hidden
              className="hidden lg:block absolute top-0 left-0 z-20 pointer-events-none"
              style={{ width: CARD_W, height: CARD_H }}
              initial={
                reduce
                  ? { opacity: 0, x: target.x, y: target.y }
                  : {
                      opacity: 0,
                      scale: 0.82,
                      x: target.x - 40,
                      y: target.y,
                      rotate: target.rotate - 8,
                    }
              }
              animate={
                reduce
                  ? { opacity: 1, x: target.x, y: target.y }
                  : {
                      opacity: 1,
                      scale: 1,
                      x: target.x,
                      y: target.y,
                      rotate: target.rotate,
                    }
              }
              exit={{
                opacity: 0,
                scale: 0.82,
                transition: { duration: 0.22, ease: "easeIn" },
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 28,
                mass: 0.7,
              }}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden ring-1 ring-foreground/10 shadow-2xl shadow-black/40 bg-foreground/5">
                <AnimatePresence>
                  <motion.div
                    key={target.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectMedia project={target.project} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ShowcaseContext.Provider>
  );
}

export function ProjectCategorySection(props: {
  index: number;
  id: string;
  title: string;
  intro: ReactNode;
  projects: ProjectData[];
}) {
  const { index, id, title, intro, projects } = props;
  const ctx = useContext(ShowcaseContext);

  return (
    <section className="py-[60px] reveal" id={id}>
      <div className="max-lg:container md:px-14 flex flex-col lg:grid grid-cols-12 gap-10">
        <div className="col-span-5 xl:col-span-4 xl:col-start-2 row-start-1">
          <div className="sticky top-[120px] flex flex-col gap-6">
            <div className="font-title text-xs uppercase tracking-widest opacity-50">
              {index.toString().padStart(2, "0")} / {projects.length}{" "}
              {projects.length === 1 ? "project" : "projects"}
            </div>
            <h2 className="text-2xl md:text-3xl font-title">{title}</h2>
            <div className="text-sm md:text-md lg:leading-relaxed opacity-80 text-balance">
              {intro}
            </div>
          </div>
        </div>
        <Accordion
          type="single"
          collapsible={true}
          value={ctx?.openId ?? ""}
          onValueChange={(v) => ctx?.setOpen(v || null)}
          className="max-xl:col-span-6 col-span-5 max-xl:col-start-7 col-start-7 row-start-1"
        >
          {projects.map((p, j) => (
            <AccordionItem
              value={p.id}
              key={p.id}
              ref={(el) => ctx?.register(p, el)}
              className="border-b border-foreground/10 last:border-b-0"
            >
              <div className="relative w-full aspect-square md:hidden rounded-lg overflow-hidden">
                <ProjectMedia project={p} />
              </div>
              <AccordionTrigger
                className="group text-left justify-start flex-1 flex flex-row gap-5 hover:bg-foreground/5 rounded-md items-center p-4 -mx-4 cursor-pointer"
                onPointerEnter={() => ctx?.hover(p.id)}
                onPointerLeave={() => ctx?.unhover(p.id)}
              >
                <div className="flex flex-row items-center opacity-50 text-xs font-title">
                  {(j + 1).toString().padStart(2, "0")}
                </div>
                <div className="w-[44px] font-title text-sm opacity-70">
                  {p.year}
                </div>
                <div className="flex-1 text-sm sm:text-base font-title">
                  {p.label}
                </div>
                <div className="flex flex-row items-center gap-2 opacity-50 max-sm:hidden">
                  {p.platforms?.map((platform) => {
                    const meta = platformIcons[platform];
                    if (!meta) return null;
                    return (
                      <i
                        key={platform}
                        className={cn(meta.icon, "text-base")}
                        title={meta.label}
                        aria-label={meta.label}
                      />
                    );
                  })}
                </div>
                <i className="icon-[ri--arrow-down-s-line] text-lg opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="py-4 flex flex-col gap-6">
                  <p className="leading-relaxed text-sm opacity-90">
                    {p.description}
                  </p>
                  <div className="flex flex-row flex-wrap gap-2">
                    {[...(p.languages ?? []), ...(p.frameworks ?? [])].map(
                      (tech) => (
                        <Badge
                          key={tech}
                          material={"outline"}
                          scheme={"muted"}
                          className="text-foreground/70"
                        >
                          {tech}
                        </Badge>
                      ),
                    )}
                  </div>
                  {!!p.links?.length && (
                    <div className="flex flex-row items-center gap-2">
                      {p.links.map((link, k) => (
                        <Button
                          key={k}
                          material={"outline"}
                          size={"sm"}
                          asChild
                        >
                          <Link
                            href={link.link}
                            target="_blank"
                            title={link.link}
                          >
                            <i className={cn(link.icon)} />
                            <div>
                              {link.icon.includes("github")
                                ? "Source"
                                : "Visit"}
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
