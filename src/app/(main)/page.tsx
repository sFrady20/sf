import { ShaderCard } from "@/components/shader";
import { Button } from "earthling-ui/button";
import frag3 from "@/shaders/genuary/2022/3.frag.glsl";
import frag4 from "@/shaders/genuary/2024/13.frag.glsl";
import frag5 from "@/shaders/genuary/2024/10.frag.glsl";
import Link from "next/link";
import { HeroWordmark } from "@/components/hero-wordmark";
import { categories } from "@/data/projects";
import { experienceList } from "@/data/experience";
import { Marquee, ProjectCategorySection, ProjectShowcase } from "./components";

//areas of practice, pulled from the project + experience history
const skillItems = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "AI",
  "Mobile",
  "Desktop Apps",
  "Game Dev",
  "Creative Coding",
  "Shaders",
  "3D Graphics",
  "Interactive Installations",
  "Design Systems",
];

//tools + frameworks
const techItems = [
  "React",
  "GLSL",
  "Three.js",
  "Next.js",
  "Typescript",
  "WebGL",
  "Unity",
  "Electron",
  "React Native",
  "Tailwind",
];

//companies worked at + brands built for
const companyItems = [
  "NCR",
  "AT&T",
  "Rugged Logic",
  "Coca-Cola",
  "U.Group",
  "Verizon",
  "Capital One",
  "Brightline Interactive",
  "Buick",
  "If/Then",
  "Mountain Dew",
  "Visible",
];

export default async function HomePage() {
  const years = new Date().getFullYear() - 2013 - 1;

  return (
    <>
      <section className="relative flex flex-col justify-center pt-[100px] pb-[60px] md:min-h-svh">
        {/* <Shader
          frag={heroFrag}
          transparent
          aria-hidden
          className="absolute inset-0 bg-transparent pointer-events-none"
        /> */}
        <div className="container relative z-1 flex flex-col items-center gap-10 mt-16 mb-6">
          <h1 className="sr-only">
            Steven Frady - Creative Full-Stack Developer
          </h1>
          <HeroWordmark />
          <div className="flex flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2 font-title text-xs uppercase tracking-widest opacity-70">
            <div>Creative Full-Stack Developer</div>
            <div className="w-1 h-1 rounded-full bg-foreground/40 max-md:hidden" />
            <div>{years}+ years</div>
            <div className="w-1 h-1 rounded-full bg-foreground/40 max-md:hidden" />
            <div>Fairfax, VA</div>
          </div>
          <p className="max-w-[620px] text-center text-xs md:text-sm lg:leading-relaxed font-title text-balance opacity-80">
            I am a developer with over {years} years of experience, specializing
            in web and mobile development. My work is focused on creating
            user-centric solutions, with a commitment to continuous learning and
            innovation in the tech field.
          </p>
          <div className="flex flex-row flex-wrap items-center justify-center gap-4">
            {/* <Badge
              scheme={"primary"}
              className="flex flex-row items-center gap-3"
            >
              <div className="shadow-xl shadow-[#00FF00] w-2 h-2 bg-[#00FF00] rounded-full drop-shadow-[0_0_5px_rgba(0,255,0,1)]" />
              <div>Open for work</div>
            </Badge> */}
            <Button material={"outline"} size={"sm"} asChild>
              <Link href="mailto:sfrady20@gmail.com" target="_blank">
                <i className="icon-[ri--mail-fill]" />
                <div>Email me</div>
              </Link>
            </Button>
            <Button material={"ghost"} size={"sm"} asChild>
              <Link href="https://resume.stevenfrady.com" target="_blank">
                <i className="icon-[ri--download-cloud-fill]" />
                <div>Resume</div>
              </Link>
            </Button>
          </div>
        </div>
        <a
          href="#apps"
          aria-label="Scroll to projects"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-1 opacity-50 hover:opacity-100 transition-opacity"
        >
          <i className="icon-[ri--arrow-down-line] text-2xl animate-bounce block" />
        </a>
      </section>

      <Marquee items={skillItems} />

      <section className="py-[60px] reveal" id="experience">
        <div className="max-lg:container md:px-14 flex flex-col lg:grid grid-cols-12 gap-10">
          <div className="col-span-5 xl:col-span-4 xl:col-start-2 row-start-1">
            <div className="sticky top-[120px] flex flex-col gap-6">
              <div className="font-title text-xs uppercase tracking-widest opacity-50">
                04 / the day jobs
              </div>
              <h2 className="text-2xl md:text-3xl font-title">Experience</h2>
              <p className="text-sm md:text-md lg:leading-relaxed opacity-80 text-balance">
                The studios, agencies, and teams where I've sharpened the craft
                — from interactive installations to enterprise frontends.
              </p>
            </div>
          </div>
          <div className="max-xl:col-span-6 col-span-5 max-xl:col-start-7 col-start-7 row-start-1 flex flex-col">
            {[...experienceList].reverse().map((e, i) => (
              <div
                key={i}
                className="flex flex-row gap-5 items-baseline py-4 border-b border-foreground/10 last:border-b-0"
              >
                <div className="w-[110px] shrink-0 font-title text-sm opacity-70">
                  {e.years.join(" - ")}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm sm:text-base font-title">
                    {e.place}
                  </div>
                  <div className="text-xs opacity-70">{e.position}</div>
                  <div className="text-xs opacity-50">{e.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={techItems} reverse />

      <ProjectShowcase>
        {categories
          .filter((x) => !["tools"].includes(x.id))
          .map((x, i) => (
            <ProjectCategorySection
              key={x.id}
              index={i + 1}
              id={x.id}
              title={x.title}
              intro={x.intro}
              projects={x.projects}
            />
          ))}
      </ProjectShowcase>

      <Marquee items={companyItems} />

      <section
        className="py-[60px] lg:pb-0 flex flex-col gap-2 reveal"
        id="shaders"
      >
        <div className="max-lg:sm:container flex flex-col gap-4">
          <div className="container lg:px-10 flex flex-row items-end justify-between pb-2">
            <div className="flex flex-col gap-2">
              <div className="font-title text-xs uppercase tracking-widest opacity-50">
                05 / daily glsl
              </div>
              <h2 className="text-2xl md:text-3xl font-title">Shaders</h2>
            </div>
            <Button material={"ghost"} className="gap-1 font-title" asChild>
              <Link href={"/shaders"}>
                <div>All shaders</div>
                <i className="icon-[ri--arrow-right-up-line] text-lg" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3">
            <ShaderCard
              className="col-span-3 lg:col-span-1"
              autoplay
              frag={frag3}
              title={"Spacetime"}
              subtitle={"Genuary 2022 - Day 3"}
              shaderPath="genuary/2022/3"
            />
            <ShaderCard
              className="col-span-3 lg:col-span-1"
              autoplay
              frag={frag4}
              title={"Wobble Function"}
              subtitle={"Genuary 2024 - Day 13"}
              shaderPath="genuary/2024/13"
            />
            <ShaderCard
              className="col-span-3 lg:col-span-1"
              autoplay
              frag={frag5}
              title={"Hexagonal Scales"}
              subtitle={"Genuary 2024 - Day 10"}
              shaderPath="genuary/2024/10"
            />
          </div>
        </div>
      </section>
    </>
  );
}
