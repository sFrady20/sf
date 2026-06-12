import { Button } from "earthling-ui/button";
import { Metadata } from "next";
import Link from "next/link";
import {
  CVT_ActionButton,
  CVT_Input,
  CVT_Options,
  CVT_Preview,
  CVT_Provider,
} from "./components";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default async function () {
  return (
    <CVT_Provider>
      <div className="py-[100px] md:pt-[132px] flex-1">
        <div className="container flex flex-col">
          <div>
            <Button material={"ghost"} className="gap-2 -ml-4" asChild>
              <Link href="/tools">
                <i className="icon-[ri--arrow-left-line]" />
                <div>More tools</div>
              </Link>
            </Button>
          </div>
          <CVT_Input>Choose File</CVT_Input>
          <CVT_Preview />
          <CVT_Options />
          <CVT_ActionButton />
        </div>
      </div>
    </CVT_Provider>
  );
}
