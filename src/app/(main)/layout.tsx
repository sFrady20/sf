import "@/components/analytics";
import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { Button } from "earthling-ui/button";
import Link from "next/link";
import { AppProvider } from "./context";
import MenuToggle from "@/components/menu-toggle";
import Menu from "@/components/menu";
import Frady from "@/app/frady.svg";
import { CastSenderProvider } from "@/components/cast/sender";
import { MusicButton } from "@/components/music-button";
import { TooltipProvider } from "earthling-ui/tooltip";
import { ThemePicker } from "@/components/theme-picker";
import maskStyles from "./mask.module.css";
import { RouteTransition } from "@/components/transition";
import { CommandPalette } from "@/components/command-palette";

const socials = [
  {
    link: "https://github.com/sFrady20",
    icon: "icon-[ri--github-fill]",
    alt: "Follow Steven Frady on Github",
  },
  {
    link: "https://x.com/slowjamsteve",
    icon: "icon-[ri--twitter-x-fill]",
    alt: "Follow Steven Frady on X (formerly Twitter)",
  },
  {
    link: "https://www.linkedin.com/in/stevenfrady",
    icon: "icon-[ri--linkedin-box-fill]",
    alt: "Connect with Steven Frady on LinkedIn",
  },
  {
    link: "mailto:sfrady20@gmail.com",
    icon: "icon-[ri--mail-fill]",
    alt: "Send Steven Frady an email",
  },
];

//shared nav, used by the mobile menu and the footer
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#experience", label: "Experience" },
  { href: "/#apps", label: "Apps" },
  { href: "/#oss", label: "OSS" },
  { href: "/#freelance", label: "Freelance" },
  { href: "/shaders", label: "Shaders" },
  { href: "/tools", label: "Tools" },
];

export default async function MainLayout(props: {
  children?: ReactNode;
  modal?: ReactNode;
}) {
  const { children, modal } = props;

  return (
    <CastSenderProvider>
      <AppProvider>
        <TooltipProvider delayDuration={300}>
          <div className="fixed top-0 left-0 w-full p-4 md:p-10 z-40 pointer-events-none">
            <header className="flex flex-row justify-between items-center h-[50px] rounded-full px-2 relative pointer-events-auto">
              <div
                className={cn(
                  "absolute inset-[-80px] bg-background/30 backdrop-blur-lg transition-[background-color] ease-(--timing-fn) z-[-1] pointer-events-none",
                  maskStyles.root,
                )}
                style={{ transitionDuration: "0.66s" }}
              />
              <div className="flex-1 flex flex-row items-center justify-start">
                <Button
                  material={"ghost"}
                  className="gap-3 pl-1 rounded-full"
                  asChild
                >
                  <Link href={"/"}>
                    <Image
                      src={"/avatar.webp"}
                      width={32}
                      height={32}
                      className="rounded-full"
                      alt="Steven Frady"
                    />
                    <h1 className="font-title">SF26</h1>
                  </Link>
                </Button>
              </div>
              <nav
                aria-label="Social links"
                className="flex-row justify-center items-center gap-6 flex-1 hidden md:flex"
              >
                {socials.map((x, i) => (
                  <Button
                    key={i}
                    shape={"icon"}
                    className="rounded-full"
                    material={"ghost"}
                    asChild
                  >
                    <Link href={x.link} target="_blank" aria-label={x.alt}>
                      <i className={cn("text-lg", x.icon)} />
                    </Link>
                  </Button>
                ))}
              </nav>
              <div className="flex-1 flex flex-row items-center justify-end gap-2 md:gap-4">
                <MusicButton src="/music/lets-connect.mp3" />
                <ThemePicker />
                <MenuToggle
                  material={"ghost"}
                  shape={"icon"}
                  className="md:hidden rounded-full"
                  aria-label="Toggle menu"
                >
                  <i className="icon-[ri--menu-fill]" />
                </MenuToggle>
              </div>
            </header>
          </div>

          <Menu
            links={navLinks}
            socials={socials.map((x, i) => (
              <Button
                key={i}
                shape={"icon"}
                className="rounded-full"
                material={"ghost"}
                asChild
              >
                <Link href={x.link} target="_blank" aria-label={x.alt}>
                  <i className={cn("text-lg", x.icon)} />
                </Link>
              </Button>
            ))}
          />

          <CommandPalette
            links={[
              ...navLinks,
              { href: "/uses", label: "Uses" },
              { href: "/colophon", label: "Colophon" },
            ]}
          />

          <main>
            <RouteTransition>{children}</RouteTransition>
          </main>

          {modal}

          <footer className="py-[100px] bg-foreground/5">
            <div className="container flex flex-col gap-10">
              <div className="grid grid-cols-6 gap-4 gap-y-10 w-full">
                <div className="col-span-6 xl:col-span-3 h-full flex flex-col gap-4">
                  <Frady className={"w-[100px] h-[30px]"} />
                  <p className="opacity-60 text-sm">
                    Des. and Dev. by Steven Frady
                  </p>
                  <div className="text-xs">© {new Date().getFullYear()}</div>
                </div>
                <nav
                  aria-label="Site navigation"
                  className="col-span-6 sm:col-span-2 xl:col-span-1 flex flex-col gap-1"
                >
                  {[
                    ...navLinks,
                    //footer-tier pages, not worth menu real estate
                    { href: "/uses", label: "Uses" },
                    { href: "/colophon", label: "Colophon" },
                  ].map((x, i) => (
                    <div key={i} className="col-span-1">
                      <Link
                        href={x.href}
                        className="hover:underline text-sm font-title"
                      >
                        {x.label}
                      </Link>
                    </div>
                  ))}
                </nav>
                <nav
                  aria-label="External links"
                  className="col-span-6 sm:col-span-2 xl:col-span-1 flex flex-col gap-1"
                >
                  {[
                    {
                      link: "https://www.linkedin.com/in/stevenfrady/",
                      label: "LinkedIn",
                    },
                    {
                      link: "https://x.com/slowjamsteve",
                      label: "X (Formerly Twitter)",
                    },
                    {
                      link: "https://peerlist.io/sfrady20",
                      label: "Peerlist",
                    },
                    {
                      link: "https://github.com/sFrady20",
                      label: "Github",
                    },
                    {
                      link: "https://dribbble.com/sfrady20",
                      label: "Dribbble",
                    },
                    {
                      link: "https://soundcloud.com/sultan-zabu",
                      label: "SoundCloud",
                    },
                    {
                      link: "https://www.slowjam.dj/",
                      label: "SlowJamSteve",
                    },
                    {
                      link: "https://linq.dj/@slowjamsteve",
                      label: "LINQ",
                    },
                  ].map((x, i) => (
                    <div key={i} className="col-span-1">
                      <Link
                        href={x.link}
                        className="hover:underline text-sm font-title"
                        target="_blank"
                      >
                        {x.label}
                      </Link>
                    </div>
                  ))}
                </nav>
                <div className="col-span-6 sm:col-span-2 xl:col-span-1 flex flex-col gap-1 opacity-60">
                  <Link
                    href={"mailto:sfrady20@gmail.com"}
                    className="hover:underline flex flex-row items-center gap-2 font-title text-sm"
                    target="_blank"
                  >
                    <i className="icon-[ri--mail-fill]" />
                    <div>Email me</div>
                  </Link>
                  <Link
                    href={"https://resume.stevenfrady.com"}
                    className="hover:underline flex flex-row items-center gap-2 font-title text-sm"
                    target="_blank"
                  >
                    <i className="icon-[ri--download-cloud-fill]" />
                    <div>Resume</div>
                  </Link>
                  <Link
                    href={"https://venmo.com/?txn=pay&recipients=sfrady"}
                    className="hover:underline flex flex-row items-center gap-2 font-title text-sm"
                    target="_blank"
                  >
                    <i className="icon-[ri--cup-fill]" />
                    <div>Buy me a coffee</div>
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </TooltipProvider>
      </AppProvider>
    </CastSenderProvider>
  );
}
