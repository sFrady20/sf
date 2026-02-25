import dynamic from "next/dynamic";
import { use } from "react";

export default function ({
  params,
}: {
  params: Promise<{ post: string[] }>;
}) {
  const { post } = use(params);

  const Content = dynamic(() => import(`./content/${post.join("/")}.mdx`));

  return (
    <div className="w-full min-h-100vh flex items-center justify-center">
      <Content />
    </div>
  );
}
