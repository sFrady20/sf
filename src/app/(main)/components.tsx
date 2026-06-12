"use client";

import { ReactNode, useState, HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "earthling-ui/badge";
import { Button } from "earthling-ui/button";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useApp } from "./context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      className="overflow-hidden whitespace-nowrap py-[40px] select-none"
    >
      <div
        className="inline-block animate-[marquee_40s_linear_infinite] font-title uppercase text-5xl md:text-7xl opacity-[0.06] leading-none"
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

//hover preview that lives in the sticky column instead of floating over the list
function ProjectPreview(props: { project: ProjectData | null }) {
  const { project } = props;

  const app = useApp();
  const mouseX = app((x) => x.mouse.x);
  const mouseY = app((x) => x.mouse.y);
  const winWidth = app((x) => x.window.width);
  const winHeight = app((x) => x.window.height);

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-xl hidden lg:block bg-foreground/5">
      <div className="absolute inset-0 flex items-center justify-center font-title text-xs uppercase tracking-widest opacity-30">
        hover a project
      </div>
      <AnimatePresence>
        {project && (
          <motion.div
            key={project.id}
            className="absolute inset-[-24px]"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { ease: "easeOut" } }}
            exit={{ x: "100%", opacity: 0, transition: { ease: "easeIn" } }}
            style={{
              translateX: `${((mouseX / winWidth || 0.5) - 0.5) * 16}px`,
              translateY: `${((mouseY / winHeight || 0.5) - 0.5) * 16}px`,
            }}
          >
            <ProjectMedia project={project} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = projects.find((p) => p.id === hoveredId) || null;

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
            {/* <ProjectPreview project={hovered} /> */}
          </div>
        </div>
        <Accordion
          type="single"
          collapsible={true}
          className="max-xl:col-span-6 col-span-5 max-xl:col-start-7 col-start-7 row-start-1"
        >
          {projects.map((p, j) => (
            <AccordionItem
              value={p.id}
              key={p.id}
              className="border-b border-foreground/10 last:border-b-0"
            >
              <div className="relative w-full aspect-square md:hidden rounded-lg overflow-hidden">
                <ProjectMedia project={p} />
              </div>
              <AccordionTrigger
                className="group text-left justify-start flex-1 flex flex-row gap-5 hover:bg-foreground/5 rounded-md items-center p-4 -mx-4 cursor-pointer"
                onPointerEnter={() => setHoveredId(p.id)}
                onPointerLeave={() =>
                  setHoveredId((x) => (x === p.id ? null : x))
                }
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
