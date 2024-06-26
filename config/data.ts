import { scheduler } from "timers/promises";

const roles = [
  {
    id: "HzdmUa40IctkReRd2Pofm",
    name: "Super Admin",
    description:
      "Super Admins can access and manage all features and settings.",
    type: "SUPER_ADMIN",
  },
  {
    id: "a75POUlJzMDmaJtz0JCxp",
    name: "Employee",
    description: "Default role given to an employee.",
    type: "EMPLOYEE",
  },
  {
    id: "EAq7VNTae7MUFc8ezbqG2",
    name: "Manager",
    description: "Managers can manage all employees designated to their team.",
    type: "MANAGER",
  },
];

const users = [
  {
    id: "e5cTUpLtGS7foE42nJuwp",
    name: "Gus",
    email: "gus@chrona.me",
    password: "gus@chrona.me",
    confirmed: true,
    blocked: false,
    mobile: 123456789,
    address: "Dublin",
    image: "https://github.com/GusTheProgrammer.png",
    bio: "Full Stack Developer",
  },
];

const teams = [
  {
    id: "boU23DgXdQvlDaLi5ZVAK",
    name: "Team Banana",
    description: "Frontend team",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "M5ACSCbM47QeWAaby2ZKK",
    name: "Team Alpha",
    description: "Backend team",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const profile = {
  id: "hMXCyzI2MLXNI6tQ-sU0i",
  mobile: 615301507,
  address: "Dublin",
  image: "https://github.com/GusTheProgrammer.png",
  bio: "Full Stack Developer",
};

const sort = {
  hidden: 0,
  profile: 1,
  scheduler: 2,
  timeoff: 3,
  admin: 4,
};

const clientPermissions = [
  {
    id: "MZ4Qsx2e-g96eMw0X2qul",
    name: "Home",
    path: "/",
    menu: "hidden",
    sort: sort.hidden,
    description: "Home page",
  },
  {
    id: "tEEdCt_Ghz5gWinY4RDNP",
    name: "Scheduler",
    path: "/scheduler",
    menu: "scheduler",
    sort: sort.scheduler,
    description: "Scheduler page",
  },
  {
    id: "Cw2eO5qIMCD_tt6uUdQdr",
    name: "Time-Off",
    path: "/time-off",
    menu: "timeoff",
    sort: sort.timeoff,
    description: "Time-Off page",
  },
  {
    id: "IYN1EVSvUg0o5pAxgPEPi",
    name: "Users",
    path: "/admin/users",
    menu: "admin",
    sort: sort.admin,
    description: "Users page",
  },
  {
    id: "VFGo5W_hc3O85QCOouabO",
    name: "Roles",
    path: "/admin/roles",
    menu: "admin",
    sort: sort.admin,
    description: "Roles page",
  },
  {
    id: "t-Snd86AW-TlIlMEDmYyt",
    name: "Profile",
    path: "/account/profile",
    menu: "profile",
    sort: sort.profile,
    description: "Profile page",
  },
  {
    id: "eWpbNJ9LkTVO4BYyaO1mJ",
    name: "Permissions",
    path: "/admin/permissions",
    menu: "admin",
    sort: sort.admin,
    description: "Permissions page",
  },
  {
    id: "HnCMgsT54kcTRYlJGaOC2",
    name: "Client Permissions",
    path: "/admin/client-permissions",
    menu: "admin",
    sort: sort.admin,
    description: "Client Permissions page",
  },
];

const permissions = [
  // Users
  {
    id: "fCuAED2qkbOmWYmKsOa-_",
    description: "Users",
    route: "/api/users",
    name: "Users",
    method: "GET",
  },
  {
    id: "UzN2L6RQ_gUM0_JN4ALkB",
    description: "User Client Permissions",
    route: "/api/users/:id",
    name: "Users",
    method: "GET",
  },
  {
    id: "rqRYCpC0yytkColvHwY3C",
    description: "User",
    route: "/api/users",
    name: "Users",
    method: "POST",
  },
  {
    id: "xsei4vGvYpoXw3V0_Bgcy",
    description: "User",
    route: "/api/users/:id",
    name: "Users",
    method: "PUT",
  },
  {
    id: "27vMGpNbQGLKtuaIsTAcF",
    description: "User",
    route: "/api/users/:id",
    name: "Users",
    method: "DELETE",
  },

  //   Profile
  {
    id: "Fyph8SxjGayAHr8g65Rie",
    description: "Profile",
    route: "/api/profile",
    name: "Profile",
    method: "GET",
  },
  {
    id: "LMG211l6gxRRkjAHPvhgw",
    description: "Profile",
    route: "/api/profile/:id",
    name: "Profile",
    method: "PUT",
  },

  //   Role
  {
    id: "2xiakJtuDptmlP7fxgggo",
    description: "Roles",
    route: "/api/roles",
    name: "Roles",
    method: "GET",
  },
  {
    id: "HQ8Drbd0-KOMequqhQVuG",
    description: "Role",
    route: "/api/roles",
    name: "Roles",
    method: "POST",
  },
  {
    id: "GzrnbouFYGvGfvdAfbiZT",
    description: "Role",
    route: "/api/roles/:id",
    name: "Roles",
    method: "PUT",
  },
  {
    id: "KrZ76u2VUI9qICSJhsuW5",
    description: "Role",
    route: "/api/roles/:id",
    name: "Roles",
    method: "DELETE",
  },

  //   Permission
  {
    id: "9P0mpbew9dYW4oF9cM-mO",
    description: "Permissions",
    route: "/api/permissions",
    name: "Permissions",
    method: "GET",
  },
  {
    id: "n0dw4GMpgiXfySbdlGhs0",
    description: "Permission",
    route: "/api/permissions",
    name: "Permissions",
    method: "POST",
  },
  {
    id: "tK5RgtYLe9yFNgF93m6TO",
    description: "Permission",
    route: "/api/permissions/:id",
    name: "Permissions",
    method: "PUT",
  },
  {
    id: "cn25W3-inLybNRkCMHgNC",
    description: "Permission",
    route: "/api/permissions/:id",
    name: "Permissions",
    method: "DELETE",
  },

  //   Client Permission
  {
    id: "X26iEN1J-LBaC4HlPsRgh",
    description: "Client Permissions",
    route: "/api/client-permissions",
    name: "ClientPermissions",
    method: "GET",
  },
  {
    id: "HRu69jNp0j4pJXs_cjCQ5",
    description: "Client Permission",
    route: "/api/client-permissions",
    name: "ClientPermissions",
    method: "POST",
  },
  {
    id: "X9ACZfrFX9CAl-2uPXyw9",
    description: "Client Permission",
    route: "/api/client-permissions/:id",
    name: "ClientPermissions",
    method: "PUT",
  },
  {
    id: "YTU-o6vjJk4A-4uM8kgxA",
    description: "Client Permission",
    route: "/api/client-permissions/:id",
    name: "ClientPermissions",
    method: "DELETE",
  },
  //  Upload
  {
    id: "QYfSl9RBJ02x5VxXiLR6K",
    description: "Upload",
    route: "/api/uploads",
    name: "Upload",
    method: "POST",
  },

  // Scheduler
  {
    id: "dpC-jOpNCCp3otupfqHNe",
    description: "Scheduler",
    route: "/api/scheduler",
    name: "Scheduler",
    method: "GET",
  },
  {
    id: "DQBaydVZ9uGjNGwxWQfU6",
    description: "Update Scheduler",
    route: "/api/scheduler/:id",
    name: "Scheduler",
    method: "PUT",
  },

  // Time-Off
  {
    id: "Q_5IQsDdbHohqQaqtRoEu",
    description: "Get Time-Off",
    route: "/api/time-off",
    name: "Time-Off",
    method: "GET",
  },
  {
    id: "VJp79ZZmkKQQTHf_1cqX-",
    description: "Update Time-Off per user id",
    route: "/api/time-off/:id",
    name: "Time-Off",
    method: "PUT",
  },
  {
    id: "KUVDwykdG-ckYvjbUWVS1",
    description: "Create a Time-Off request",
    route: "/api/time-off",
    name: "Time-Off",
    method: "POST",
  },
  {
    id: "YDXrifyxUrbALiCc_4iZG",
    description: "Delete a Time-Off request",
    route: "/api/time-off/:id",
    name: "Time-Off",
    method: "DELETE",
  },
  {
    id: "AkePMmg0cLhnzTYH2F09X",
    description: "Approve Time-Off request",
    route: "/api/time-off/:id",
    name: "Time-Off",
    method: "POST",
  }
];

export { roles, users, teams, profile, permissions, clientPermissions };
