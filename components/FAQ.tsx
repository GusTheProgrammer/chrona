import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "How can Chrona improve our team's scheduling?",
    answer:
      "Chrona simplifies the creation and management of shift schedules, automatically adjusting to changes and employee availability, ensuring optimal staffing at all times.",
    value: "scheduling-improvement",
  },
  {
    question:
      "Does Chrona allow employees to request time-off directly within the system?",
    answer:
      "Absolutely! Employees can submit time-off requests through Chrona, which then updates schedules and availability in real-time, pending manager approval.",
    value: "time-off-requests",
  },
  {
    question:
      "How does Chrona handle last-minute absences or schedule changes?",
    answer:
      "Chrona offers real-time changes and shift swapping capabilities to address unexpected changes, minimizing disruption to your operations.",
    value: "handling-absences",
  },
  {
    question: "Can Chrona be customized to fit our company's unique workflow?",
    answer:
      "Chrona is highly configurable and can be tailored to match your company's specific scheduling and time-off policies.",
    value: "customization-options",
  },
  {
    question: "How does Chrona support workforce compliance?",
    answer:
      "Chrona helps you stay compliant with labor regulations by automating the tracking of work hours, overtime, and breaks, and by providing customizable reports for audit purposes.",
    value: "workforce-compliance",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full AccordionRoot">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
