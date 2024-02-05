"use client";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SchedulerEditPopover = ({
  isPopoverOpen,
  setIsPopoverOpen,
  handleSubmit,
  wfmShifts,
  selectedShiftName,
  setSelectedShiftName,
  selectedShift,
}) => {
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit Shift</Button>
      </PopoverTrigger>
      <PopoverContent className="sm:max-w-[425px]">
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
      </PopoverContent>
    </Popover>
  );
};

export default SchedulerEditPopover;
