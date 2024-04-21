import { About } from "@/components/About";
import { FAQ } from "@/components/FAQ";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <FAQ />
      <ScrollToTop />
    </main>
  );
}
