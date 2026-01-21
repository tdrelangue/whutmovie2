import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "./contact-form";

export const metadata = {
  title: "Contact - WhutMovie",
  description: "Get in touch with the WhutMovie team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Contact Us</CardTitle>
          <CardDescription>
            Have a question, suggestion, or feedback? We&apos;d love to hear from you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
