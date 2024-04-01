import dynamic from "next/dynamic";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

enum TimeOffStatus {
  Pending = "pending",
  Approved = "approved",
  Decline = "declined",
}

type TimeOffRequest = {
  id: number;
  team: string;
  empName: string;
  dateFrom: Date;
  dateTo: Date;
  reason: string;
  status: TimeOffStatus;
  actions: JSX.Element | null;
};

export const columns: ColumnDef<TimeOffRequest>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "id", header: "ID" },
  { accessorKey: "team", header: "Team" },
  { accessorKey: "empName", header: "Employee Name" },
  {
    accessorKey: "dateFrom",
    header: "Date From",
    cell: ({ row }) => {
      const dateFrom = new Date(row.getValue("dateFrom"));
      return <div>{dateFrom.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "dateTo",
    header: "Date To",
    cell: ({ row }) => {
      const dateTo = new Date(row.getValue("dateTo"));
      return <div>{dateTo.toLocaleDateString()}</div>;
    },
  },
  { accessorKey: "reason", header: "Reason" },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      // Replace this dropdown menu with your actual components or data for the 'actions' column.
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log("Approve")}>
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log("Decline")}>
            Decline
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
