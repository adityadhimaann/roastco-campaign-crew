import "@/styles.css";
import { AppSidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { MobileHeader } from "@/components/mobile-header";
import { Toaster } from "sonner";

export const metadata = {
  title: "Roast & Co. CRM",
  description: "Modern, minimal CRM web application for a coffee chain brand.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground flex flex-col md:flex-row min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          <MobileHeader />
          {children}
        </main>
        <MobileNav />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
