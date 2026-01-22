import "./globals.css";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "WhutMovie - Curated Film Recommendations",
  description: "Discover top-rated films and honorable mentions curated with care. Dark, minimal, and accessible movie recommendations.",
  creator: "Orig",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-border py-6 mt-auto">
            <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground space-y-1">
              <p>&copy; {new Date().getFullYear()} WhutMovie. All rights reserved.</p>
              <p className="text-xs">
                Built by{" "}
                <a
                  href="https://orig-audit.netlify.app"
                  className="underline hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors"
                >
                  Orig
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
