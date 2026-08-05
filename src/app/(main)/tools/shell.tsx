import { Button } from "earthling-ui/button";
import Link from "next/link";
import { ReactNode } from "react";

//common wrapper for every tool page, back button + container
export function ToolShell(props: { children?: ReactNode; wide?: boolean }) {
  const { children, wide } = props;

  return (
    <div className="py-[100px] md:pt-[132px] flex-1">
      <div
        className={`container flex flex-col ${wide ? "" : "max-w-[1000px]"}`}
      >
        <div>
          <Button material={"ghost"} className="gap-2 -ml-4" asChild>
            <Link href="/tools">
              <i className="icon-[ri--arrow-left-line]" />
              <div>More tools</div>
            </Link>
          </Button>
        </div>
        {children}

        {/* the quiet part of the funnel - one sentence, no banner */}
        <div className="mt-16 border-t border-foreground/10 pt-5 text-sm opacity-60 hover:opacity-90 transition-opacity">
          A free tool by{" "}
          <Link href="/" className="underline hover:no-underline">
            Steven Frady
          </Link>
          , a creative developer building apps, shaders, and interactive
          installations.{" "}
          <Link href="/#apps" className="underline hover:no-underline">
            See the work
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
