"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Scheduler = {
  id: string;
  fullname: string;
  email: string;
  [key: string]: any; // This allows us to have dynamic keys for the dates
};

// Function to dynamically generate columns from API data
export const generateColumns = (apiData: any): ColumnDef<Scheduler>[] => {
  // Start with the static 'Employee' column
  const dynamicColumns: ColumnDef<Scheduler>[] = [
    {
      accessorKey: "fullname",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Employee
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  // Extract unique dates from the API data
  const dates = Object.keys(apiData.data);

  // Generate a column for each date
  dates.forEach((date) => {
    // Format the day name and the date separately
    const dayName = new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
    });
    const formattedDate = new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    dynamicColumns.push({
      accessorKey: date, // accessorKey should match the keys in your data
      header: ({ column }) => (
        <div className="text-center">
          <p className="text-sm font-semibold">{dayName}</p>{" "}
          <p className="text-xs">{formattedDate}</p>
        </div>
      ),
      cell: (info) => info.getValue(),
    });
  });

  return dynamicColumns;
};
