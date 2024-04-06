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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DataTablePagination } from "@/components/DataTablePagination";
import SchedulerEditPopover from "@/components/SchedulerEditPopover";
import { useState } from "react";
interface SchedulerProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  setPage: (page: number) => void;
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
}

export function Scheduler<TData, TValue>({
  columns,
  data,
  page,
  setPage,
  limit,
  setLimit,
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
}: SchedulerProps<TData, TValue>) {
  console.log("wfmShifts", wfmShifts);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fullname", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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

  return (
    <>
      <div className="flex items-center py-4">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                    const cellData = cell.row.original[cell.column.id];

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
