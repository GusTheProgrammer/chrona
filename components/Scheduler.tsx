import { Item } from "@radix-ui/react-dropdown-menu";
import React from "react";
import { useState } from "react";
import useApi from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

const Scheduler = ({
  response,
  wfmShifts,
  isDialogOpen,
  setIsDialogOpen,
  selectedShift,
  handleSubmit,
  openDialog,
  selectedCell,
  selectedShiftName,
  setSelectedShiftName,
}) => {
  const data = response?.data;

  if (!data) return <div>Loading...</div>;

  // Extract unique employees and headers
  const employees = new Set();
  Object.values(data).forEach((dateShifts) => {
    dateShifts.forEach((shift) => employees.add(shift.fullname));
  });

  const headers = Object.keys(data);

  if (headers.length === 0) {
    return <div>No data available</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            {headers.map((date, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {new Date(date).toLocaleDateString()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...employees].map((employee, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {employee}
              </td>
              {headers.map((date, dateIndex) => {
                const shift = data[date].find(
                  (shift) => shift.fullname === employee
                );
                return (
                  <td
                    key={dateIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    style={{
                      backgroundColor: shift
                        ? shift.shift_color
                        : "transparent",
                      color: "white",
                    }}
                    title={
                      shift
                        ? `Start: ${new Date(
                            shift.start_time
                          ).toLocaleTimeString()}, End: ${new Date(
                            shift.end_time
                          ).toLocaleTimeString()}`
                        : ""
                    }
                    onDoubleClick={() => openDialog(shift)}
                  >
                    {shift.scheduler_id === selectedCell
                      ? populateEditMenu(shift.shift_name)
                      : shift.shift_name}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Update the shift details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Form Fields */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Select Shift</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Shift Selection</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedShiftName}
                  onValueChange={setSelectedShiftName}
                >
                  {wfmShifts.map((shift) => (
                    <DropdownMenuRadioItem
                      key={shift.shift_id}
                      value={shift.shift_name}
                    >
                      {shift.shift_name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Label htmlFor="start_time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              defaultValue={selectedShift?.start_time}
              className="col-span-3"
            />

            <Label htmlFor="end_time" className="text-right">
              End Time
            </Label>
            <Input
              id="end_time"
              name="end_time"
              type="datetime-local"
              defaultValue={selectedShift?.end_time}
              className="col-span-3"
            />

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scheduler;
