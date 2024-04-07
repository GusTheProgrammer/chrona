import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, PencilLineIcon, Trash2 } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export const getColumns = (
  handleTimeoffRequestAction: {
    (id: any, isApproved: any): Promise<void>;
    (arg0: any, arg1: boolean): void;
  },
  handleEditAction: {
    (timeOffRequest: {
      id: any;
      dateFrom: string | number | Date;
      dateTo: string | number | Date;
      reason: any;
    }): Promise<void>;
    (arg0: TimeOffRequest): void;
  },
  handleDeleteAction: { (id: string): Promise<void>; (arg0: number): void },
  includeManageColumn = false
) => {
  const role = JSON.parse(localStorage.getItem("userInfo")!).state.userInfo
    .role;
  const columns: ColumnDef<TimeOffRequest>[] = [
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
        return <div>{dateFrom.toLocaleDateString("en-GB")}</div>;
      },
    },
    {
      accessorKey: "dateTo",
      header: "Date To",
      cell: ({ row }) => {
        const dateTo = new Date(row.getValue("dateTo"));
        return <div>{dateTo.toLocaleDateString("en-GB")}</div>;
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
      cell: ({ row }) => {
        const status: TimeOffStatus = row.getValue("status");
        let colorClass = "";
        switch (status) {
          case TimeOffStatus.Approved:
            colorClass = "text-green-500";
            break;
          case TimeOffStatus.Decline:
            colorClass = "text-red-500";
            break;
          case TimeOffStatus.Pending:
            colorClass = "text-gray-500";
            break;
        }
        const capitalizedStatus = status.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );

        return <div className={colorClass}>{capitalizedStatus}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const timeOffRequest = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(timeOffRequest.id?.toString())
                }
              >
                Copy request ID
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-500"
                onClick={() => handleEditAction(row.original)}
              >
                Edit request <PencilLineIcon className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => handleDeleteAction(row.original.id)}
              >
                Delete request <Trash2 className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (includeManageColumn && (role === "MANAGER" || role === "SUPER_ADMIN")) {
    const manageColumn = {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }: { row: Row<TimeOffRequest> }) => {
        const status: TimeOffStatus = row.original.status;

        if (status === TimeOffStatus.Pending) {
          return (
            <div className="flex space-x-2">
              <Button
                className="bg-green-500"
                onClick={() =>
                  handleTimeoffRequestAction(row.original.id, true)
                }
              >
                Approve
              </Button>
              <Button
                className="bg-red-500"
                onClick={() =>
                  handleTimeoffRequestAction(row.original.id, false)
                }
              >
                Decline
              </Button>
            </div>
          );
        }
        return null;
      },
      enableSorting: false,
    };
    columns.splice(columns.length - 1, 0, manageColumn);
  }

  return columns;
};
