import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DemoVideo from "@/public/chrona.gif";
import chronaDemo from "@/public/chrona.gif";
import { CalendarClock, Cog, TimerIcon, Zap } from "lucide-react";
import Image from "next/image";

interface ServiceProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const serviceList: ServiceProps[] = [
  {
    title: "Scheduler",
    description:
      "Plan and visualize team schedules in real-time with Chrona's powerful scheduling feature. Tailored to handle the dynamic needs of modern workplaces.",
    icon: <CalendarClock />,
  },
  {
    title: "Time Off Management",
    description:
      "Easily manage time off requests with automated approvals to ensure your team's availability and happiness.",
    icon: <TimerIcon />,
  },
  {
    title: "Resource Allocation",
    description:
      "Optimize your workforce distribution and reduce overhead with our intelligent resource allocation tools.",
    icon: <Cog />,
  },
  {
    title: "Performance Tracking",
    description:
      "Monitor and analyze workforce productivity and efficiency to make data-driven decisions that propel your company forward.",
    icon: <Zap />,
  },
];

export const Services = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              Client-Centric{" "}
            </span>
            Services
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Chrona is committed to providing solutions that fit the needs of our
            clients, ensuring seamless integration into their daily operations.
          </p>

          <div className="flex flex-col gap-8">
            {serviceList.map(({ icon, title, description }: ServiceProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="relative w-full h-full r">
          <Image
            className="rounded-sm shadow-2xl"
            src={chronaDemo}
            layout="fill"
            objectFit="cover"
            alt="About services"
          />
        </div>
      </div>
    </section>
  );
};
