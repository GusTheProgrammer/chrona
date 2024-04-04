import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";

export default function TimeoffForm({
  onSubmit: onHolidaySubmit,
  wfmShifts,
  initialValues,
  isDialogOpen,
  setIsDialogOpen,
}: {
  onSubmit: (formData: {
    startDate: string;
    endDate: string;
    shiftType: string;
  }) => void;
  wfmShifts: Array<{ shift_id: number; shift_name: string; color: string }>;
  initialValues?: {
    startDate: Date;
    endDate: Date;
    shiftType: string;
    id: string;
  };
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}) {
  const defaultDateRange = { from: new Date(), to: addDays(new Date(), 20) };
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialValues?.startDate
      ? new Date(initialValues.startDate)
      : defaultDateRange.from,
    to: initialValues?.endDate
      ? new Date(initialValues.endDate)
      : defaultDateRange.to,
  });

  const formDefaultValues = {
    shiftType:
      initialValues?.shiftType ||
      (wfmShifts.length > 0 ? wfmShifts[0].shift_name : ""),
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      formDefaultValues,
    },
  });

  const selectedShiftType = watch("shiftType");

  useEffect(() => {
    register("shiftType");
  }, [register]);

  useEffect(() => {
    if (!isDialogOpen) {
      // Reset the form to default values
      reset({
        shiftType: wfmShifts.length > 0 ? wfmShifts[0].shift_name : "",
        // Add other fields to reset as necessary
      });
      // Reset the selected dates to default as well
      setDate({
        from: new Date(),
        to: addDays(new Date(), 20),
      });
    }

    const startDate = initialValues?.startDate
      ? new Date(initialValues.startDate)
      : new Date();
    const endDate = initialValues?.endDate
      ? new Date(initialValues.endDate)
      : addDays(new Date(), 20);

    setDate({ from: startDate, to: endDate });

    // Reset form with initialValues when they change, e.g., when a different time-off request is selected for editing
    reset({
      ...formDefaultValues,
      // Potentially other fields to reset if your form includes them
    });
  }, [initialValues, reset, wfmShifts]);

  const onSubmit = async (data: { shiftType: string }) => {
    if (date && date.from && date.to) {
      const shiftColor = wfmShifts.find(
        (shift) => shift.shift_name === data.shiftType
      )?.color;

      const formData = {
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
        shiftType: data.shiftType,
        shiftColor: shiftColor,
      };

      await onHolidaySubmit(formData);
      setIsDialogOpen(false); // Close the dialog after successful submission
    } else {
      console.error("Date range or shift type is incomplete.");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Schedule Time-off</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Schedule Time-off</DialogTitle>
            <DialogDescription>
              Select your Time-off type, start and end dates.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={selectedShiftType}
            onValueChange={(value) => setValue("shiftType", value)}
            className="flex flex-col"
          >
            {wfmShifts.map((shift) => (
              <div key={shift.shift_id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={shift.shift_name}
                  id={`shiftType-${shift.shift_id}`}
                />
                <Label htmlFor={`shiftType-${shift.shift_id}`}>
                  {shift.shift_name}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "LLL dd, y")} - ${format(
                      date.to,
                      "LLL dd, y"
                    )}`
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
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <DialogFooter>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}