import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "About - WhutMovie",
  description: "Learn about WhutMovie's mission and principles: dark UX, accessibility, minimalism, and performance.",
};

export default function AboutPage() {
  const principles = [
    {
      title: "Dark UX",
      description:
        "I embrace a dark-first design philosophy. Our interface is easy on the eyes, reduces eye strain during extended browsing, and creates a cinematic atmosphere that complements the movie-watching experience.",
    },
    {
      title: "Accessibility",
      description:
        "Every user deserves equal access. We follow WCAG guidelines, ensure proper keyboard navigation, maintain readable contrast ratios, and use semantic HTML throughout. Focus states are always visible.",
    },
    {
      title: "Minimalism",
      description:
        "I believe in showing what matters. No cluttered interfaces, no overwhelming ads, no distracting animations. Just clean, focused content that helps you discover great films.",
    },
    {
      title: "Performance",
      description:
        "Fast is a feature. We use server-side rendering, minimal JavaScript, and optimized data fetching to ensure the site loads quickly and responds instantly to your interactions.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Mission */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About WhutMovie</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Curated film recommendations for those who appreciate quality cinema.
        </p>
      </section>

      {/* Story */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            WhutMovie was born from a simple frustration: finding good movies shouldn&apos;t be hard.
            I cut through the noise of algorithm-driven recommendations and provide thoughtfully
            curated selections that prioritize quality over quantity.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            My Top Picks represent the best of the best, films that have stood the test of time (or at least me watching them)
            or made a lasting impact. Honorable Mentions highlight worthy films that deserve
            attention even if they didn&apos;t make the top spots.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">My Principles</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <CardHeader>
                <CardTitle className="text-lg">{principle.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technical */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Built With Care</h2>
        <p className="text-muted-foreground leading-relaxed">
          WhutMovie is built with modern web technologies: Next.js for server-side rendering
          and optimal performance, Tailwind CSS for consistent styling, and PostgreSQL for
          reliable data storage. I use React Server Components to minimize client-side
          JavaScript and deliver fast, accessible pages.
        </p>
      </section>

      {/* Credits */}
      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-semibold">Credits</h2>
        <p className="text-muted-foreground leading-relaxed">
          WhutMovie was designed and engineered by{" "}
          <a
            href="https://orig-audit.netlify.app"
            className="text-foreground font-medium underline hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors"
          >
            Orig
          </a>
          .
        </p>
      </section>
    </div>
  );
}
