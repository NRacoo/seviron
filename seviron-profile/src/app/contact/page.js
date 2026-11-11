import ContactForm from "@/components/section/contact-form";
import PageHero from "@/components/ui/page-hero";


export const metadata = {
  title: "Contact",
  description:
    "Start with your environmental monitoring challenge. SEVIRON's team can discuss an appropriate approach.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Build a More Proactive Environmental Future."
        lede="Whether you are exploring environmental monitoring for a facility, looking to understand potential risks, or interested in an IoT-based solution, our team is ready to hear about your needs. Let's start a conversation about how SEVIRON can support your environmental management goals."
      />
      <ContactForm />
    </>
  );
}
