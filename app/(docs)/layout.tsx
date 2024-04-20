import Navigation from "@/components/layout/Navigation";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Docs",
  description: "Swagger API documentation for the API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Navigation />

        {children}
      </body>
    </html>
  );
}
