import { Shader, ShaderCard } from "@/components/shader";
import { Button } from "earthling-ui/button";
import heroFrag from "@/shaders/hero.frag.glsl";
import frag3 from "@/shaders/genuary/2022/3.frag.glsl";
import frag4 from "@/shaders/genuary/2024/13.frag.glsl";
import frag5 from "@/shaders/genuary/2024/10.frag.glsl";
import Link from "next/link";
import Frady from "@/app/frady.svg";
import { cn } from "@/utils/cn";
import {
  HoverCard,
  HoverCardContent,
  HoverCardInner,
  HoverCardTrigger,
} from "@/components/hover-card";
import { categories } from "@/data/projects";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default async function HomePage() {
  return (
    <>
      <section className="relative mt-[60px] md:mt-[100px] flex flex-col md:gap-0 py-[60px] md:py-[80px]">
        <Shader
          frag={heroFrag}
          transparent
          aria-hidden
          className="absolute inset-0 bg-transparent opacity-50 mix-blend-soft-light pointer-events-none [mask-image:radial-gradient(ellipse_75%_70%_at_50%_50%,black,transparent)]"
        />
        <div className="container @container relative">
          <h1 className="sr-only">Steven Frady - Creative Full-Stack Developer</h1>
          <Frady className={"w-full h-[20cqw]"} />
        </div>
      </section>

      <section className="md:pb-[60px]">
        <div className="container md:max-w-[620px]">
          <p className="text-left text-xs md:text-sm lg:leading-relaxed font-title text-balance">
            I am a developer with over 10 years of experience, specializing in
            web and mobile development. My work is focused on creating
            user-centric solutions, with a commitment to continuous learning and
            innovation in the tech field.
          </p>
        </div>
      </section>

      {categories
        .filter((x) => !["tools"].includes(x.id))
        .flatMap((x, i) => [
          <section key={i} className="py-[60px]" id={x.id}>
            <div className="max-lg:container md:px-14 flex flex-col lg:grid grid-cols-12 gap-10">
              <div className="col-span-5 xl:col-span-4 xl:col-start-2 row-start-1">
                <div className="sticky top-[160px] flex flex-col gap-6">
                  <h2 className="text-xl font-title">{x.title}</h2>
                  {typeof x.intro === "string" ? (
                    <p className="text-sm md:text-md lg:leading-relaxed opacity-80 text-balance">
                      {x.intro}
                    </p>
                  ) : (
                    <div className="text-sm md:text-md lg:leading-relaxed opacity-80 text-balance">
                      {x.intro}
                    </div>
                  )}
                </div>
              </div>
              <Accordion
                type="single"
                collapsible={true}
                className="max-xl:col-span-6 col-span-5 max-xl:col-start-7 col-start-7 row-start-1"
              >
                {x.projects.map((x, i) => (
                  <AccordionItem value={x.id} key={`${x.id}`}>
                    <div className="relative w-full aspect-square md:hidden rounded-lg overflow-hidden">
                      {x.hasVideo ? (
                        <video
                          muted
                          autoPlay
                          playsInline
                          loop
                          src={`/projects/${x.id}.webm`}
                          className="absolute left-0 top-0 w-full h-full z-[2] object-cover"
                        />
                      ) : (
                        <img
                          src={`/projects/${x.id}.webp`}
                          width={400}
                          height={400}
                          alt={`${x.label}`}
                          className="absolute left-0 top-0 w-full h-full z-[1] object-cover"
                        />
                      )}
                    </div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <AccordionTrigger className="text-left justify-start flex-1 flex flex-row gap-6 hover:bg-foreground/5 rounded-md items-center p-4 -mx-4 cursor-default">
                          <div className="flex flex-row items-center opacity-60 text-xs font-title">
                            {(i + 1)
                              .toString()
                              .padStart(2, "0")
                              .split("")
                              .map((x, i) => (
                                <div key={i}>{x}</div>
                              ))}
                          </div>
                          <div className="w-[40px] font-title">{x.year}</div>
                          <div className="col-span-2 flex-1 text-sm sm:text-md font-title">
                            {x.label}
                          </div>
                          <div className="text-right flex flex-row items-center">
                            {x.links?.map((xx, i) => (
                              <Button
                                key={i}
                                material={"ghost"}
                                shape={"icon"}
                                asChild
                              >
                                <Link
                                  href={xx.link}
                                  target="_blank"
                                  title={xx.link}
                                >
                                  <i className={cn(xx.icon)} />
                                </Link>
                              </Button>
                            ))}
                          </div>
                        </AccordionTrigger>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-[400px] h-[400px] overflow-hidden hidden lg:block z-[10] left-[40%] top-1/2">
                        <HoverCardInner
                          className="absolute left-0 top-0 w-full h-full"
                          variants={{
                            initial: { translateX: "-100%", opacity: 0 },
                            animate: {
                              translateX: 0,
                              opacity: 1,
                              transition: { ease: "easeOut" },
                            },
                            exit: {
                              translateX: "100%",
                              opacity: 0,
                              transition: { ease: "easeIn" },
                            },
                          }}
                        >
                          <img
                            src={`/projects/${x.id}.webp`}
                            width={400}
                            height={400}
                            alt={`${x.label}`}
                            className="absolute left-0 top-0 w-full h-full z-[1] object-cover"
                          />
                          {x.hasVideo && (
                            <video
                              muted
                              autoPlay
                              playsInline
                              loop
                              src={`/projects/${x.id}.webm`}
                              className="absolute left-0 top-0 w-full h-full z-[2] object-cover"
                            />
                          )}
                        </HoverCardInner>
                      </HoverCardContent>
                    </HoverCard>
                    <AccordionContent className="lg:hidden">
                      <div className="py-4 flex flex-col gap-6">
                        <p className="leading-relaxed text-xs md:text-xs">
                          {x.description}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col col-span-3 md:col-span-1">
                            <div className="text-xs opacity-60">Languages</div>
                            <div className="text-xs">
                              {x.languages?.join(", ")}
                            </div>
                          </div>
                          <div className="flex flex-col col-span-3 md:col-span-1">
                            <div className="text-xs opacity-60">Frameworks</div>
                            <div className="text-xs">
                              {x.frameworks?.join(", ")}
                            </div>
                          </div>
                          <div className="flex flex-col col-span-3 md:col-span-1">
                            <div className="text-xs opacity-60">Platforms</div>
                            <div className="flex flex-row items-center gap-2">
                              {x.platforms?.includes("web") && (
                                <>
                                  <i
                                    className="icon-[ri--global-fill] text-xl"
                                    title="Web"
                                  />
                                  <div className="sr-only">Web</div>
                                </>
                              )}
                              {x.platforms?.includes("desktop") && (
                                <>
                                  <i
                                    className="icon-[ri--computer-fill] text-xl"
                                    title="Desktop"
                                  />
                                  <div className="sr-only">Desktop</div>
                                </>
                              )}
                              {x.platforms?.includes("mobile") && (
                                <>
                                  <i
                                    className="icon-[ri--smartphone-fill] text-xl"
                                    title="Mobile"
                                  />
                                  <div className="sr-only">Mobile</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>,
          <div
            key={`sep-${i}`}
            className="container w-full h-[1px] bg-foreground/10"
          />,
        ])
        .slice(0, -1)}

      <section className="py-[60px] lg:py-0 flex flex-col gap-2" id="shaders">
        <div className="max-lg:sm:container flex flex-col lg:flex-col-reverse gap-4">
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
          <div className="flex flex-row items-center justify-end lg:px-10">
            <Button material={"ghost"} className="gap-1" asChild>
              <Link href={"/shaders"}>
                <div>More Shaders</div>
                <i className="icon-[ri--arrow-right-up-line] text-lg" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
