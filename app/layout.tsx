import Meta from "@/components/Meta";
import "./globals.css";
import "./index.css";
import { Roboto } from "next/font/google";
import Navigation from "@/components/layout/Navigation";
import Providers from "@/lib/provider";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import profile from "@/public/img/profile.png";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "500", "700", "900"],
});

export const metadata = {
  ...Meta({}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.className} `} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Navigation />
            <div className="max-w-6xl mx-auto px-2">
              <main className="flex min-h-[85.5vh] flex-col">{children}</main>
              <Toaster position="bottom-left" />
            </div>
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
