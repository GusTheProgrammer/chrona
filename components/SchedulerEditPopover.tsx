"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { formatISO } from "date-fns";

import { Separator } from "@/components/ui/separator";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/TimePicker";
import { useEffect, useState } from "react";

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
  launchedFromUpdateButton,
  selectedRows,
}) => {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!isPopoverOpen) return;

    // Reset time when popover or dialog is opened
    if (launchedFromUpdateButton && selectedRows && selectedRows.length > 0) {
      const firstShift = selectedRows[0];
      const firstDateKey = Object.keys(firstShift).find((key) =>
        key.match(/^\d{4}-\d{2}-\d{2}$/)
      );
      if (firstDateKey && firstShift[firstDateKey]) {
        const scheduleDetails = firstShift[firstDateKey];
        setStartTime(new Date(scheduleDetails.start_time || new Date()));
        setEndTime(new Date(scheduleDetails.end_time || new Date()));
      }
    } else if (selectedShift) {
      setStartTime(new Date(selectedShift.start_time || new Date()));
      setEndTime(new Date(selectedShift.end_time || new Date()));
      setSelectedShiftName(selectedShift.shift_name);
    }
  }, [isPopoverOpen, selectedShift, launchedFromUpdateButton, selectedRows]);

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
  const FormBody = (
    <form
      onSubmit={(e) => handleSubmit(e, true, selectedRows)}
      className="grid gap-4 py-4"
    >
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
                      key={shift.id}
                      onSelect={() => {
                        setSelectedShiftName(shift.name);
                        setOpen(false);
                      }}
                    >
                      {shift.name}
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
  );

  if (launchedFromUpdateButton) {
    return (
      <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Update Shifts</DialogTitle>
            <DialogDescription>
              Modify the details for the selected shifts in a batch.
            </DialogDescription>
          </DialogHeader>
          <Popover open={true}>{FormBody}</Popover>
        </DialogContent>
      </Dialog>
    );
  }

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
        {FormBody}
      </PopoverContent>
    </Popover>
  );
};

export default SchedulerEditPopover;
