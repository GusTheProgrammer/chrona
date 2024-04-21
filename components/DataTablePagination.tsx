import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  setPage: (page: string) => void;
  setLimit: (limit: number) => void;
  employeeLimit?: number;
  setEmployeeLimit?: (limit: number) => void;
}

export function DataTablePagination<TData>({
  table,
  setPage,
  setLimit,
  employeeLimit,
  setEmployeeLimit,
}: DataTablePaginationProps<TData>) {
  const handleFirstPage = () => {
    setPage(1);
  };

  const handleLastPage = () => {
    setPage(table.getPageCount());
  };

  return (
    <div className="flex items-center justify-between px-2 mt-5">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Employees per page</p>
          <Select
            value={`${employeeLimit}`}
            onValueChange={(value) =>
              setEmployeeLimit && setEmployeeLimit(parseInt(value))
            }
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${employeeLimit}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[1, 10, 15, 20, 25].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Days per page</p>
          <Input
            type="number"
            className="h-8 w-[70px]"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage("");
            }}
            min={1} // Set minimum number of rows per page
          />
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (table.getState().pagination.pageIndex > 0) {
                setPage(table.getState().pagination.pageIndex); // Use setPage to change the page
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setPage(table.getState().pagination.pageIndex + 2); // pageIndex is zero-indexed, add 2 for next page
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
