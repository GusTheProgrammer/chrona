import React from "react";
import Meta from "@/components/Meta";

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
