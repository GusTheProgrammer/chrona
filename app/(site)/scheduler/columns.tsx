import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component

export type Scheduler = {
  id: string;
  fullname: string;
  email: string;
  [key: string]: any;
};

// Function to dynamically generate columns from API data, including a selection column
export const getColumns = (apiData: {
  columns: Array<{ accessorKey: string }>;
}): ColumnDef<Scheduler>[] => {
  // Prepend the selection column to the dynamically generated columns
  const columns: ColumnDef<Scheduler>[] = [
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
  ];

  // Append other columns based on API data
  columns.push(
    ...apiData.columns.map((column) => {
      if (column.accessorKey === "fullname") {
        // Static 'Employee' column with custom header
        return {
          accessorKey: column.accessorKey,
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Employee
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: (info) => info.getValue(),
        };
      } else {
        const date = new Date(column.accessorKey);
        const dayName = date.toLocaleDateString("en-GB", { weekday: "long" });
        const formattedDate = date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday = 0, Saturday = 6

        return {
          accessorKey: column.accessorKey,
          header: () => (
            <div className="text-center">
              <p
                className={`text-sm font-semibold ${
                  isWeekend ? "dark:text-white text-black" : ""
                }`}
              >
                {dayName}
              </p>
              <p
                className={`text-xs ${
                  isWeekend ? "dark:text-white text-black" : ""
                }`}
              >
                {formattedDate}
              </p>
            </div>
          ),
          cell: (info) =>
            (info.getValue() as { shift_name?: string })?.shift_name || "",
        };
      }
    })
  );

  return columns;
};
