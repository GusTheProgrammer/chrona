"use client";

import React, { use, useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Scheduler } from "@/components/Scheduler";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { getColumns } from "./columns";
import { start } from "repl";

const Page = () => {
  const [wfmShifts, setWfmShifts] = useState([
    {
      name: "Working from Office",
      color:
        "bg-blue-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500",
    },
    {
      name: "Working from Home",
      color:
        "bg-purple-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-purple-500 dark:to-pink-500",
    },
    {
      name: "Vacation",
      color:
        "bg-red-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-red-500 dark:to-orange-500",
    },
    {
      name: "Sick Leave",
      color:
        "bg-yellow-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-yellow-500 dark:to-lime-500",
    },
    {
      name: "Personal Time",
      color:
        "bg-green-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-green-500 dark:to-teal-500",
    },
  ]); // State to store wfmShifts data
  const [page, setPage] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(7);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedShiftName, setSelectedShiftName] = useState();
  const [selectedCell, setSelectedCell] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const teamId = JSON.parse(localStorage.getItem("userInfo")!).state.userInfo
    .teamId;

  const queryClient = useQueryClient();
  const getWfmShifts = useApi({
    key: ["wfm-shifts"],
    method: "GET",
    url: "wfm-shifts",
  }).GET;

  const getApi = useApi({
    key: ["scheduler", page, limit, startDate, endDate],
    method: "GET",
    url: `scheduler?teamId=${teamId}&page=${page}&limit=${limit}&start=${startDate}&end=${endDate}`,
  })?.GET;

  const editSchedulerApi = useApi({
    key: ["scheduler"],
    method: "PUT",
    url: "scheduler",
  })?.PUT;

  const handleSubmit = async (e: {
    preventDefault: () => void;
    target: { start_time: { value: any }; end_time: { value: any } };
  }) => {
    e.preventDefault();

    const shift = wfmShifts.find((s) => s.name === selectedShiftName);
    const shiftColor = shift ? shift.color : null;

    const updatedShiftData = {
      shift_name: selectedShiftName,
      start_time: e.target.start_time.value,
      end_time: e.target.end_time.value,
      shift_color: shiftColor,
    };

    try {
      await editSchedulerApi?.mutateAsync({
        id: selectedShift.scheduler_id,
        ...updatedShiftData,
      });

      // Invalidate the queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ["scheduler", page] });

      // Close the popover/modal after successful submission
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  const openPopover = (shift, event) => {
    const rect = event.target.getBoundingClientRect();
    setSelectedCell({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setSelectedShift(shift);
    setIsPopoverOpen(true);
  };

  useEffect(() => {
    if (getApi?.data) {
      const tableData = getApi?.data;
      setData(tableData.data);

      setColumns(getColumns(tableData));
      setPage(tableData.page);
      setTotalPages(tableData.totalPages);
    }

    if (getWfmShifts?.data) {
      setWfmShifts(getWfmShifts.data || []);
      setSelectedShiftName(getWfmShifts.data[0]?.name || "");
    }
  }, [getApi?.data, getWfmShifts?.data]);

  return (
    <div>
      <Scheduler
        columns={columns}
        data={data}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
        wfmShifts={wfmShifts}
        isPopoverOpen={isPopoverOpen}
        setIsPopoverOpen={setIsPopoverOpen}
        selectedShiftName={selectedShiftName}
        selectedShift={selectedShift}
        setSelectedShiftName={setSelectedShiftName}
        openPopover={openPopover}
        handleSubmit={handleSubmit}
        selectedCell={selectedCell}
        // Date range picker props
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
