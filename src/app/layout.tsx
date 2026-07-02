import "@/globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import { Viewport } from "next/types";
import { cn } from "@/utils/cn";
import { fonts } from "@/utils/fonts";
import { cookies, headers } from "next/headers";
import { GoogleAnalytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme-provider";
import {
  CUSTOM_COOKIE,
  DEFAULT_CUSTOM,
  HOLIDAYS,
  THEME_COOKIE,
  deriveTheme,
  resolveThemeClass,
  type CustomTheme,
} from "@/lib/theme";
import { yearsOfExperience } from "@/vars";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.stevenfrady.com"),
  title: "Steven Frady - Creative Full-Stack Developer",
  description: `Creative full-stack developer with ${yearsOfExperience()}+ years across web and mobile apps, design systems, shaders, and interactive installations. Based in Fairfax, VA.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
    { media: "(prefers-color-scheme: light)", color: "#c4c1c0" },
  ],
};

//resolves `system` to OS light/dark before paint (holiday + named + custom are
//already correct from SSR), so there's no flash on first load
function antiFlashScript() {
  const windows = HOLIDAYS.map((h) => ({
    id: h.id,
    fm: h.from[0],
    fd: h.from[1],
    td: h.to[1],
  }));
  return `(function(){try{
    var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);
    var sel=m?decodeURIComponent(m[1]):'system';
    if(sel!=='system')return;
    var H=${JSON.stringify(windows)};
    var d=new Date(),mo=d.getMonth()+1,day=d.getDate(),hid=null;
    for(var i=0;i<H.length;i++){if(mo===H[i].fm&&day>=H[i].fd&&day<=H[i].td){hid=H[i].id;break;}}
    var cls=hid?('theme-holiday-'+hid):(window.matchMedia('(prefers-color-scheme: dark)').matches?'theme-dark':'theme-light');
    var el=document.documentElement;
    el.className=el.className.replace(/theme-[\\w-]+/g,'').trim();
    el.classList.add(cls);
  }catch(e){}})();`;
}

export default async function App(props: { children?: ReactNode }) {
  const { children } = props;

  const cookieJar = await cookies();
  const selection = cookieJar.get(THEME_COOKIE)?.value || "system";

  let custom: CustomTheme = DEFAULT_CUSTOM;
  try {
    const raw = cookieJar.get(CUSTOM_COOKIE)?.value;
    if (raw) custom = { ...DEFAULT_CUSTOM, ...JSON.parse(raw) };
  } catch {}

  //chromium sends its color scheme as a client hint; everyone else gets the
  //dark default and the inline script corrects it before paint
  const hinted = (await headers()).get("sec-ch-prefers-color-scheme");

  const htmlClass = resolveThemeClass({
    selection,
    date: new Date(),
    prefersDark: hinted ? hinted === "dark" : true,
  });

  //flash-free custom theme: emit its derived vars as a scoped stylesheet rule
  const customCss =
    selection === "custom"
      ? `.theme-custom{${Object.entries(deriveTheme(custom))
          .map(([k, v]) => `${k}:${v}`)
          .join(";")}}`
      : null;

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <body
        className={cn(
          fonts.display.variable,
          fonts.title.variable,
          fonts.body.variable,
          "bg-background text-foreground font-body selection:bg-foreground selection:text-background flex flex-col min-h-svh",
        )}
      >
        {/* runs before paint to resolve `system` to OS light/dark, no flash */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript() }} />
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        <ThemeProvider initialSelection={selection} initialCustom={custom}>
          {children}
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
