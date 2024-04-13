"use client";

import "@stoplight/elements/styles.min.css";
import dynamic from "next/dynamic";

const APIDocumentUI = dynamic(
  () => import("@stoplight/elements").then((mod) => mod.API),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

export default function ReactSwagger() {
  return (
    <>
      <div
        className="min-h-screen grid grid-cols-[auto,1fr]"
        suppressHydrationWarning
      >
        <div className="sidebar bg-gray-800"></div>
        <APIDocumentUI
          apiDescriptionUrl="/api/docs"
          layout="sidebar"
          router="hash"
        />
      </div>
    </>
  );
}
