import "@/styles.css";
import { AppSidebar } from "@/components/sidebar";
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
      <body className="antialiased bg-background text-foreground flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
