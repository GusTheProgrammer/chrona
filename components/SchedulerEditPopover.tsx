"use client";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { formatISO, set } from "date-fns";

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

import { Separator } from "@/components/ui/separator";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/TimePicker";

const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;
  const dateString = date.split("T")[0]; // Extract the date part
  const timeString = formatISO(time).split("T")[1]; // Extract the time part
  return new Date(`${dateString}T${timeString}`);
};

const SchedulerEditPopover = ({
  isPopoverOpen,
  setIsPopoverOpen,
  handleSubmit,
  wfmShifts,
  selectedShiftName,
  setSelectedShiftName,
  selectedShift,
  position,
}) => {
  const [open, setOpen] = React.useState(false);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (selectedShift) {
      const start = new Date(selectedShift.start_time);
      const end = new Date(selectedShift.end_time);
      setStartTime(start);
      setEndTime(end);
      setSelectedShiftName(selectedShift.shift_name);
    }
  }, [selectedShift]);

  const handleStartTimeChange = (newTime) => {
    if (!selectedShift) return;
    const combinedDateTime = combineDateAndTime(
      selectedShift.datestamp,
      newTime
    );
    setStartTime(combinedDateTime);
  };

  const handleEndTimeChange = (newTime) => {
    if (!selectedShift) return;
    const combinedDateTime = combineDateAndTime(
      selectedShift.datestamp,
      newTime
    );
    setEndTime(combinedDateTime);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverContent
        style={{
          position: "absolute",
          top: `${position?.top}px`,
          left: `${position?.left}px`,
        }}
        className="sm:max-w-[425px]"
      >
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">Edit Shift</h4>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">Shift Type</p>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[150px] justify-start">
                  {selectedShiftName || "+ Set shift"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="right" align="start">
                <Command>
                  <CommandInput placeholder="Select shift..." />
                  <CommandList>
                    {wfmShifts.length === 0 && (
                      <CommandEmpty>No shifts found.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {wfmShifts.map((shift) => (
                        <CommandItem
                          key={shift.shift_id}
                          onSelect={() => {
                            setSelectedShiftName(shift.shift_name);
                            setOpen(false);
                          }}
                        >
                          {shift.shift_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Separator className="my-4" />
          <h4 className="text-sm font-medium leading-none">Start Time</h4>
          <div className="flex items-center justify-center">
            <TimePicker setDate={handleStartTimeChange} date={startTime} />
            <input
              type="hidden"
              name="start_time"
              value={startTime ? startTime.toISOString() : ""}
            />
          </div>

          <Separator className="my-4" />
          <h4 className="text-sm font-medium leading-none">End Time</h4>
          <div className="flex items-center justify-center">
            <TimePicker setDate={handleEndTimeChange} date={endTime} />
            <input
              type="hidden"
              name="end_time"
              value={endTime ? endTime.toISOString() : ""}
            />
          </div>
          <Separator className="my-4" />

          <Button type="submit">Update</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default SchedulerEditPopover;