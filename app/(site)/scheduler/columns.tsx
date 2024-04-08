import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Scheduler = {
  id: string;
  fullname: string;
  email: string;
  [key: string]: any; // This accommodates dynamic keys for the dates
};

// Function to dynamically generate columns from API data
export const getColumns = (apiData: {
  columns: Array<{ accessorKey: string }>;
}): ColumnDef<Scheduler>[] => {
  return apiData.columns.map((column) => {
    if (column.accessorKey === "fullname") {
      // Static 'Employee' column with custom header
      return {
        accessorKey: column.accessorKey,
        header: () => (
          <Button variant="ghost">
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
        // Accessing and displaying `shift_name` for day columns
        cell: (info) =>
          (info.getValue() as { shift_name?: string })?.shift_name || "",
      };
    }
  });
};
