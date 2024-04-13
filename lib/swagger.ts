import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api", // define api folder under app folder
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Chrona API",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
    tags: [
      { name: "Teams", description: "Operations related to teams" },
      {
        name: "Client Permissions",
        description: "Operations related to client permissions",
      },
      { name: "Scheduler", description: "Operations related to scheduler" },
      { name: "Users", description: "Operations related to users" },
      { name: "Permissions", description: "Operations related to permissions" },
      { name: "Roles", description: "Operations related to roles" },
      { name: "Seeds", description: "Operations related to seeds" },
    ],
  });
  return spec;
};
