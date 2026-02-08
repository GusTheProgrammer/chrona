import React from "react";
import Meta from "@/components/Meta";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata = {
  ...Meta({
    title: "Time-Off Requests",
  }),
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
