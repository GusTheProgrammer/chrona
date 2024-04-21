"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CalendarIcon } from "@radix-ui/react-icons";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInCalendarDays, parse, format } from "date-fns";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DataTablePagination } from "@/components/DataTablePagination";
import SchedulerEditPopover from "@/components/SchedulerEditPopover";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DownloadIcon, Pencil, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { exportTableToCSV } from "@/lib/export";

interface SchedulerProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  setPage: (page: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;
  wfmShifts: any;
  isPopoverOpen: boolean;
  setIsPopoverOpen: (isOpen: boolean) => void;
  selectedShift: any;
  handleSubmit: (updatedShiftData: any) => void;
  openPopover: (shift: any, event: any) => void;
  selectedCell: any;
  selectedShiftName: string;
  setSelectedShiftName: (shiftName: string) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  employeeLimit: number;
  setEmployeeLimit: (limit: number) => void;
}

export function Scheduler<TData, TValue>({
  columns,
  data,
  page,
  setPage,
  limit,
  setLimit,
  employeeLimit,
  setEmployeeLimit,
  totalPages,
  wfmShifts,
  isPopoverOpen,
  setIsPopoverOpen,
  selectedShift,
  handleSubmit,
  openPopover,
  selectedCell,
  selectedShiftName,
  setSelectedShiftName,
  // Date range picker props
  setStartDate,
  setEndDate,
}: SchedulerProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fullname", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [date, setDate] = useState<DateRange | undefined>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const queryClient = useQueryClient();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    pageCount: totalPages - 1,
    manualPagination: true, // Since we're handling pagination server-side
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const hasData = data && data.length > 0;

  const handleReset = () => {
    setPage("");
    setLimit(7);
    setEmployeeLimit(10);
    setStartDate("");
    setEndDate("");
    setDate(undefined);
    setSelectedShiftName("");
    setIsPopoverOpen(false);
    table.setColumnFilters([]);
    table.setColumnVisibility({});
    // Invalidate and refetch queries
    queryClient.invalidateQueries({ queryKey: ["scheduler"] });
  };

  console.log(table.getFilteredRowModel().rows);

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
          <Input
            placeholder="Filter by Name..."
            value={
              (table.getColumn("fullname")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("fullname")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="mx-2"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Table</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger className="mr-auto" asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(selectedRange) => {
                  setDate(selectedRange);
                  const formattedFrom = selectedRange?.from
                    ? format(selectedRange.from, "dd-MM-yyyy")
                    : "";
                  const formattedTo = selectedRange?.to
                    ? format(selectedRange.to, "dd-MM-yyyy")
                    : "";
                  if (selectedRange?.from && selectedRange?.to) {
                    const daysBetween =
                      differenceInCalendarDays(
                        selectedRange.to,
                        selectedRange.from
                      ) + 1;
                    setLimit(daysBetween);
                    console.log("daysBetween", daysBetween);
                  }
                  setStartDate(formattedFrom);
                  setEndDate(formattedTo);
                  setPage("");
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <Button
              variant="outline"
              onClick={console.log("batch function should be called here")}
            >
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Update
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() =>
              exportTableToCSV(table, {
                filename: `scheduler-${new Date().toLocaleString()}`,
                excludeColumns: ["select", "actions"],
              })
            }
          >
            <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Toggle columns"
                variant="outline"
                className="ml-auto lg:flex"
              >
                <MixerHorizontalIcon className="mr-2 size-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      <span className="truncate">{column.id}</span>
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Check if the header represents a date and if it's a weekend
                  const headerDate =
                    header.id !== "fullname" ? new Date(header.id) : null;
                  const isWeekend = headerDate
                    ? headerDate.getDay() === 0 || headerDate.getDay() === 6
                    : false;

                  return (
                    <TableHead
                      key={header.id}
                      className={
                        isWeekend ? "dark:bg-stone-900 bg-stone-100	" : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {hasData ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellData = (
                      cell.row.original as { [key: string]: any }
                    )[cell.column.id];
                    if (cellData && typeof cellData === "object") {
                      return (
                        <TableCell
                          className={cellData.shift_color}
                          key={cell.id}
                          onDoubleClick={(event) => {
                            if (cellData.scheduler_id) {
                              openPopover(cellData, event);
                            }
                          }}
                        >
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span>
                                {cellData ? cellData.shift_name : "No Shift"}
                              </span>
                            </HoverCardTrigger>

                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    Shift Details
                                  </h4>
                                  <div className="flex items-center pt-2">
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                                    <span className="text-medium">
                                      Start Time:{" "}
                                      {new Date(
                                        cellData.start_time
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>

                                  <div className="flex items-center pt-2">
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                                    <span className="text-medium">
                                      End Time:{" "}
                                      {new Date(
                                        cellData.end_time
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <DataTablePagination
        table={table}
        setPage={setPage}
        setLimit={setLimit}
        employeeLimit={employeeLimit}
        setEmployeeLimit={setEmployeeLimit}
      />
      {/* Popover */}
      <SchedulerEditPopover
        isPopoverOpen={isPopoverOpen}
        setIsPopoverOpen={setIsPopoverOpen}
        handleSubmit={handleSubmit}
        wfmShifts={wfmShifts}
        selectedShiftName={selectedShiftName}
        setSelectedShiftName={setSelectedShiftName}
        selectedShift={selectedShift}
        position={selectedCell}
        shiftColor={
          wfmShifts.find(
            (shift: { name: any }) => shift.name === selectedShiftName
          )?.color
        }
      />
    </>
  );
}
