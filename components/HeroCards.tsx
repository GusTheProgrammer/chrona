import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Check,
  CornerDownRight,
  FileText,
  Lightbulb,
  Linkedin,
  SquareUserIcon,
  SquareUserRound,
} from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="flex flex-col">
            <CardTitle className="text-lg">Tech Stack</CardTitle>
            <CardDescription>This Application is built with:</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="items-center">
          <span className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      alt="NextJs"
                      src="https://github.com/nextjs.png"
                    />
                    <AvatarFallback>NextJs</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>NextJs</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      alt="Prisma"
                      src="https://github.com/prisma.png"
                    />
                    <AvatarFallback>Prisma</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Prisma</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      alt="Postgres"
                      src="https://github.com/postgres.png"
                    />
                    <AvatarFallback>Postgres</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Postgres</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      alt="Docker"
                      src="https://github.com/docker.png"
                    />
                    <AvatarFallback>Docker</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Docker</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      alt="Shadcn UI"
                      src="https://github.com/shadcn-ui.png"
                    />
                    <AvatarFallback>Shadcn UI</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shadcn UI</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      alt="Tailwind CSS"
                      src="https://github.com/tailwindcss.png"
                    />
                    <AvatarFallback>Tailwind CSS</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tailwind CSS</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="mt-8 flex justify-center items-center pb-2">
          <Image
            src="https://github.com/GusTheProgrammer.png"
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
            width={250}
            height={250}
          />
          <CardTitle className="text-center">Gus Shaal</CardTitle>
          <CardDescription className="font-normal text-primary">
            Full Stack Developer
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-2">
          <p>
            I develop web applications with a focus on user experience and clean
            code.
          </p>
        </CardContent>

        <CardFooter>
          <div>
            <a
              href="https://github.com/GusTheProgrammer"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">Github icon</span>
              <GitHubLogoIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/gus-shaal/"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">Linkedin icon</span>
              <Linkedin size="20" />
            </a>

            <a
              href="https://gustheprogrammer.github.io/"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">Portfolio</span>
              <SquareUserRound size="20" />
            </a>
          </div>
        </CardFooter>
      </Card>

      <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            Features
          </CardTitle>

          <CardDescription>Many WFM features including: </CardDescription>
        </CardHeader>

        <CardFooter className="flex">
          <div className="space-y-4">
            {[
              "Shift Management",
              "Holiday Planning",
              "Time Off Tracking",
              "Employee Scheduling",
              "Team Management",
            ].map((feature: string) => (
              <span key={feature} className="flex">
                <Check className="text-green-500" />{" "}
                <h3 className="ml-2">{feature}</h3>
              </span>
            ))}
          </div>
        </CardFooter>
      </Card>

      <Card className="absolute w-[350px] -right-[10px] bottom-[35px]  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
            <FileText />
          </div>
          <div>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription className="text-md mt-2 mb-5">
              Learn how to interact with the Chrona API.
            </CardDescription>
            <Button className="absolute bottom-4 right-4">
              <Link href={"/docs"}>
                <CornerDownRight />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
