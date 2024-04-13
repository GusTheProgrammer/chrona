import Navigation from "@/components/Navigation";
import Link from "next/link";
import Image from "next/image";
import profile from "@/public/img/profile.png";

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
        <div className="navbar z-50 h-[68px] flex justify-between items-center px-5">
          <div>
            <Link href="/" className="w-24 normal-case text-xl">
              <Image
                src={profile}
                width={40}
                height={40}
                alt="logo"
                className="rounded"
              />
            </Link>
          </div>
          <Navigation />
        </div>

        {children}
      </body>
    </html>
  );
}
