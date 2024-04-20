import { Statistics } from "@/components/Statistics";
import chronaLogo from "@/public/img/chrona-logo.png";
import Image from "next/image";

export const About = () => {
  return (
    <section id="about" className="container py-24 sm:py-32">
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <Image
            src={chronaLogo}
            alt=""
            className="w-[300px] object-contain rounded-lg"
          />
          <div className="bg-green-0 flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  About{" "}
                </span>
                chrona.
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                At Chrona, we believe managing a workforce should be
                straightforward and stress-free. From scheduling to time-off
                management, our tools are designed to help you maximize
                efficiency and productivity.
              </p>
            </div>

            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};
