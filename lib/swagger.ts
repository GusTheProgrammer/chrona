import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Chrona Workforce Management API",
        description:
          "The Chrona API facilitates efficient management of workforce schedules and time-off requests, providing seamless integration with other HR systems. It allows developers to programmatically manage teams, schedules, permissions, and roles, ensuring a flexible and adaptive approach to the complex needs of modern workforce management.",
        contact: {
          name: "Chrona Support",
          url: "mailto:support@chrona.me",
          email: "support@chrona.me",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        version: "1.0",
      },
      externalDocs: {
        description: "Find out more about Chrona",
        url: "https://chrona.me/docs",
      },
      servers: [
        {
          url: "https://chrona.me",
          description: "Production server (uses live data)",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "For accessing the API a valid JWT token must be passed in all the queries in the 'Authorization' header. A token can be obtained by the client/user during authentication.",
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
    tags: [
      {
        name: "Teams",
        description:
          "Operations related to managing teams within the organization.",
      },
      {
        name: "Client Permissions",
        description:
          "Operations for managing client-level permissions for access control.",
      },
      {
        name: "Scheduler",
        description:
          "API endpoints for managing and viewing schedules, shift assignments, and availability.",
      },
      {
        name: "Users",
        description:
          "Endpoints related to user accounts, profiles, and user-specific settings.",
      },
      {
        name: "Permissions",
        description:
          "Detailed management of user permissions and access rights.",
      },
      {
        name: "Roles",
        description:
          "Handling of user roles, role assignments, and the associated permissions.",
      },
      {
        name: "Seeds",
        description:
          "Endpoints to populate the database with initial data for testing or deployment.",
      },
    ],
  });
  return spec;
};
