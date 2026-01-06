import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const categories = [
  {
    id: "apps",
    title: "Apps",
    intro: `Apps showcase the process of turning concepts into concrete
      results. Here, you'll see projects where my skills and those of my
      peers come together to build practical, impactful solutions.`,
    projects: [
      // {
      //   id: "linq",
      //   label: "LINQ",
      //   year: "2025",
      //   description: ``,
      //   platforms: ["web", "mobile"],
      //   languages: ["Typescript"],
      //   frameworks: ["React", "React-Native", "Next.js", "Tailwind", "Shadcn"],
      //   links: [
      //     {
      //       link: "https://linq.dj/",
      //       icon: "icon-[ri--external-link-fill]",
      //     },
      //   ],
      // },
      {
        id: "griddy",
        label: "District Athletics",
        year: "2024",
        description: `District Athletics is a local sports platform crafted by a focused team of
          four. Set to launch in the DMV area, it's designed to streamline the
          sports experience with three key features: finding local games,
          managing teams, and facilitating team communication. Our platform,
          underpinned by the tagline "Discover nearby games, join sports
          communities, and manage your teams. Spend less time planning and more
          time playing," aims to simplify the organizational aspect of sports,
          allowing players to focus more on the game itself.`,
        platforms: ["web", "mobile"],
        languages: ["Typescript"],
        frameworks: [
          "React",
          "React-Native",
          "Next.js",
          "Supabase",
          "Tailwind",
          "Shadcn",
        ],
        links: [
          // {
          //   link: "https://districtathletics.net/",
          //   icon: "icon-[ri--external-link-fill]",
          // },
        ],
      },
      {
        id: "wanderseat",
        label: "WanderSeat",
        year: "2024",
        description: `Wanderseat is a travel app that transforms the way people discover and share flight deals. Embracing the concept "Where Travelers Become Influencers," this platform creates an ecosystem where sharing flight deals and travel experiences not only benefits the community but also rewards the sharer. It's designed to inspire and empower the next wave of travelers, making the hunt for the best flight deals a shared, rewarding journey`,
        platforms: ["web", "mobile"],
        languages: ["Typescript"],
        frameworks: [
          "React",
          "React-Native",
          "Next.js",
          "Supabase",
          "Tailwind",
          "Shadcn",
        ],
        links: [
          {
            link: "https://wanderseat.com/",
            icon: "icon-[ri--external-link-fill]",
          },
        ],
      },
      // {
      //   id: "poolah",
      //   label: "Poolah",
      //   year: "2024",
      //   description: `Poolah is a personal finance app currently in development, focused on facilitating group payments. Created in collaboration with a team of four, this app aims to simplify the process of managing shared expenses.`,
      //   platforms: ["mobile"],
      //   languages: ["Typescript"],
      //   frameworks: ["React-Native", "Tailwind (Native-wind)"],
      // },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    intro: `These tools are the canvas for my personal and professional
      ethos. This space is dedicated to projects that are solely mine,
      from initial concept to final execution.`,
    projects: [
      {
        id: "landinggenius",
        label: "Landing Genius",
        year: "2024",
        description: `Landing Genius is an app that streamlines the process of creating landing pages by using OpenAI. Users input their requirements, choose a basic structure and writing tone, and the app then generates the copy and styling using pre-set templates. This tool is a practical solution for quick and tailored landing page creation, demonstrating a straightforward application of AI in web development.`,
        platforms: ["web"],
        languages: ["Typescript"],
        frameworks: [
          "React",
          "OpenAI",
          "Next.js",
          "Supabase",
          "Tailwind",
          "Shadcn",
        ],
        links: [
          {
            link: "https://landinggeni.us/",
            icon: "icon-[ri--external-link-fill]",
          },
        ],
      },
    ],
  },
  {
    id: "oss",
    title: "Open-source Software",
    intro: `Open-source is where I'm laying the foundations for future collaboration. This section features projects in their initial phases, ripe for community input and collective development.`,
    projects: [
      {
        id: "earthling-ui",
        label: "Earthling UI",
        year: "2024",
        description: `Earthling UI is an open-source project where I share my go-to templates for building various types of applications, from web to desktop. It simplifies the development process by offering ready-to-use boilerplates and unique 'shadcn-style' components through npm packages. This project is my way of giving back to the developer community, providing tools and resources that streamline app creation, whether for mobile, web, or desktop platforms.`,
        platforms: ["web", "desktop", "mobile"],
        languages: ["Typescript"],
        frameworks: ["React", "Vite", "Tailwind"],
        links: [
          {
            link: "https://github.com/sFrady20/earthling-ui",
            icon: "icon-[ri--github-fill]",
          },
        ],
      },
      {
        id: "brainwave",
        label: "Brainwave Broadcasting",
        year: "2023",
        description: `Brainwave Broadcasting is a unique personal experiment where AI meets entertainment, culminating in the creation of an AI-generated TV channel. At its core is a generator that crafts scripts, which are then brought to life through a Unity application. The project marked its debut with "Oddball Industries," an office sitcom, initially streamed live on Twitch and now available on YouTube.`,
        platforms: ["desktop"],
        languages: ["Python", "C#"],
        frameworks: ["Unity", "OpenAI"],
        links: [
          {
            link: "https://brainwavebroadcasting.tv/",
            icon: "icon-[ri--external-link-fill]",
          },
          // {
          //   link: "https://www.youtube.com/@BrainwaveBroadcasting",
          //   icon: "icon-[ri--youtube-fill]",
          // },
        ],
      },
      {
        id: "easy-mesh-gradient",
        label: "Easy Mesh Gradient",
        year: "2023",
        description: `Easy Mesh Gradient is an npm package designed for developers seeking to create visually appealing, evenly distributed gradients with ease. This tool utilizes easing techniques to ensure that the gradients it generates are not only interesting but also aesthetically balanced. It's a straightforward, practical solution for anyone looking to enhance their project's visual appeal with minimal effort.`,
        platforms: ["web"],
        languages: ["Typescript"],
        frameworks: ["None"],
        links: [
          {
            link: "https://easy-mesh-gradient.stevenfrady.com/",
            icon: "icon-[ri--external-link-fill]",
          },
          // {
          //   link: "https://github.com/sFrady20/easy-mesh-gradient",
          //   icon: "icon-[ri--github-fill]",
          // },
        ],
      },
      {
        id: "labctrl",
        label: "Lab Controller",
        year: "2022",
        description: `Lab Controller (LabCTRL) is a practical desktop application I developed to control LifX colored lighting in my home office. It includes a feature that uses AI to create lighting themes based on the music I listen to on Spotify. This tool is a straightforward solution for enhancing the ambiance of my workspace, demonstrating a functional application of AI in everyday life.`,
        platforms: ["desktop"],
        languages: ["Typescript"],
        frameworks: ["React", "Electron", "Vite", "OpenAI"],
        links: [
          {
            link: "https://github.com/sFrady20/labctrl",
            icon: "icon-[ri--github-fill]",
          },
        ],
      },
    ],
  },
  {
    id: "freelance",
    title: "Freelance",
    intro: (
      <>
        <p>
          In the freelance world, versatility is key. Here, you'll find projects
          that showcase my ability to meet diverse client needs with precision
          and creativity.
        </p>
        <div className="mt-10 flex flex-row items-center justify-start gap-3">
          <Badge className="flex flex-row items-center gap-4">
            <div className="shadow-xl shadow-[#00FF00] w-2 h-2 bg-[#00FF00] rounded-full drop-shadow-[0_0_5px_rgba(0,255,0,1)]" />
            <div>Open for work</div>
          </Badge>
          <Link
            className="underline"
            href="mailto:sfrady20@gmail.com"
            target="_blank"
          >
            Email Me
          </Link>
        </div>
      </>
    ),
    projects: [
      // {
      //   id: "pin-map",
      //   label: "USAA Pin Map",
      //   description: ``,
      //   year: "2025",
      //   hasVideo: true,
      //   platforms: ["desktop"],
      //   languages: ["C#"],
      //   frameworks: ["React", "Electron", "Vite"],
      // },
      // {
      //   id: "wonderdome",
      //   label: "Walmart Wonderdome",
      //   description: ``,
      //   year: "2025",
      //   hasVideo: true,
      //   platforms: ["desktop"],
      //   languages: ["Typescript"],
      //   frameworks: ["React", "Electron", "Vite"],
      // },
      {
        id: "swag-shop",
        label: "Spin To Win",
        description: `Spin-To-Win included two installations: the first, for the AT&T Final Four, used a basketball with a spin sensor to operate a prize spinner animation. The second, for Mountain Dew, offered a digital animation for prize selection. Both served as interactive methods for prize distribution at events.`,
        year: "2024",
        hasVideo: true,
        platforms: ["desktop"],
        languages: ["Typescript"],
        frameworks: ["React", "Electron", "Vite"],
      },
      {
        id: "homerunderby",
        label: "Capital One Home Run Derby",
        description: `The Capital One Home Run Derby is a Unity-based game developed for live events, offering an immersive home run derby experience. Players engage with the game using a physical bat equipped with sensors, which translates their movements directly into the game displayed on a large screen.`,
        year: "2023",
        hasVideo: true,
        platforms: ["desktop"],
        languages: ["C#"],
        frameworks: ["Unity"],
      },
      {
        id: "meteor-game",
        label: "AT&T Meteor Game",
        description: `The AT&T Meteor Game is a Unity-based application designed for a touchscreen interface, where players are tasked with saving Earth by destroying incoming asteroids with simple taps.`,
        year: "2023",
        hasVideo: true,
        platforms: ["desktop"],
        languages: ["C#"],
        frameworks: ["Unity"],
      },
      {
        id: "coke-juggle",
        label: "Coca-Cola Kick Ups",
        description: `Coca-Cola Kick Ups is an interactive game for live events, where participants showcase their soccer ball juggling skills. A brand ambassador records each participant's count, displaying it in real-time on a large screen, adding a competitive and visual element to the event experience.`,
        year: "2023",
        hasVideo: true,
        platforms: ["desktop"],
        languages: ["Typescript"],
        frameworks: ["React", "Electron", "Vite"],
      },
      {
        id: "road-to-greatness",
        label: "Buick Road to Greatness",
        description: `
        Buick Road to Greatness is a temple-run style game, developed as an installation for the Women's March Madness basketball tournament. Players navigate through various sports-themed zones, dodging obstacles to reach the finish line`,
        year: "2022",
        hasVideo: true,
        platforms: ["desktop"],
        languages: ["C#"],
        frameworks: ["Unity"],
      },
      {
        id: "juggle",
        label: "Verizon Kick Ups",
        description: `
        Verizon Kick Ups is an interactive game designed for live events, where participants showcase their soccer ball juggling skills. As they play, a large screen displays a dynamic 3D animation of soccer balls cascading in sync with each successful juggle, adding an immersive visual element to the experience.`,
        year: "2022",
        hasVideo: true,
        platforms: ["desktop"],
        languages: ["C#"],
        frameworks: ["Unity"],
      },
      {
        id: "abundant",
        label: "Abundant Staffing Portal",
        description: `The Abundant Staffing Portal is a back-office application tailored for hospitals, facilitating seamless interaction with staffing companies. It enables hospitals to create and manage shifts, which the staffing company can then efficiently fill. This tool streamlines the process of staff allocation, ensuring that hospitals can effectively meet their staffing needs.`,
        year: "2022",
        platforms: ["web"],
        languages: ["Typescript"],
        frameworks: ["React", "Next.js", "Prisma"],
      },
      {
        id: "drrandyross",
        label: "Dr. Randy Ross",
        year: "2021",
        description: `A significant upgrade and maintenance of the website for Dr. Randy Ross, a prominent business motivational speaker and author. I transitioned the website from WordPress to a custom Next.js implementation, enhancing performance and user experience.`,
        platforms: ["web"],
        languages: ["Typescript", "PHP"],
        frameworks: ["React", "Next.js", "Prisma", "Wordpress"],
        links: [
          {
            link: "https://drrandyross.com",
            icon: "icon-[ri--external-link-fill]",
          },
        ],
      },
      {
        id: "drexls",
        label: "Drexls",
        description: `Drexls is a white-label solution for Roku and Android Fire, enabling the distribution of videos across multiple content streams. This project focused on developing a flexible platform for efficient video sharing and management on widely-used streaming devices.`,
        year: "2021",
        platforms: ["web", "mobile"],
        languages: ["Brightscript", "PHP", "Kotlin"],
        frameworks: ["Roku", "Android"],
      },
      {
        id: "phonetopia",
        label: "Phonetopia Keyboard Game",
        description: `The Phonetopia Keyboard Game, a feature of the larger Phonetopia exhibit for Visible Wireless, presented an inventive installation where participants used their physical movements to type messages on oversized keyboard keys. `,
        year: "2020",
        platforms: ["desktop"],
        languages: ["C#"],
        frameworks: ["Unity"],
        links: [
          {
            link: "https://www.madwell.com/project/phonetopia",
            icon: "icon-[ri--external-link-fill]",
          },
        ],
      },
    ],
  },
];
