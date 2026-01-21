import "./globals.css";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "WhutMovie - Curated Film Recommendations",
  description: "Discover top-rated films and honorable mentions curated with care. Dark, minimal, and accessible movie recommendations.",
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
            <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} WhutMovie. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
