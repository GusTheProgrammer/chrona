"use client";

import "swagger-ui-react/swagger-ui.css";
import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p>Loading API documentation...</p>,
});

export default function ReactSwagger() {
  return (
    <div className="min-h-screen">
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
