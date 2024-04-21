import { type Table } from "@tanstack/react-table";

export function exportTableToCSV<TData>(
  /**
   * The table to export.
   * @type Table<TData>
   */
  table: Table<TData>,
  opts: {
    /**
     * The filename for the CSV file.
     * @default "table"
     * @example "tasks"
     */
    filename?: string;
    /**
     * The columns to exclude from the CSV file.
     * @default []
     * @example ["select", "actions"]
     */
    excludeColumns?: (keyof TData | "select" | "actions")[];
  } = {}
): void {
  const { filename = "table", excludeColumns = [] } = opts;

  // Retrieve headers (column names)
  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id));

  // Build CSV content
  const csvContent = [
    headers.join(","),
    ...table.getRowModel().rows.map((row) =>
      headers
        .map((header) => {
          const cellValue = row.getValue(header);
          if (excludeColumns.includes(header)) {
            return "";
          }

          // Check if cellValue is an object and handle accordingly
          if (cellValue && typeof cellValue === "object") {
            // Example: concatenate 'shift_name', 'start_time' and 'end_time' properties
            return `"${cellValue.shift_name || ""} (${
              cellValue.start_time || ""
            } - ${cellValue.end_time || ""})"`;
          }

          // Handle other types of values that might contain commas or newlines
          return typeof cellValue === "string"
            ? `"${cellValue.replace(/"/g, '""')}"`
            : cellValue;
        })
        .join(",")
    ),
  ].join("\n");

  // Create a Blob with CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
