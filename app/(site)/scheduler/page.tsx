"use client";

import React, { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Scheduler } from "@/components/Scheduler";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";

import { generateColumns } from "./columns";

const Page = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(7);
  const [q, setQ] = useState("");
  const [dynamicColumns, setDynamicColumns] = useState([]); // State to hold the dynamic columns
  const [transformedData, setTransformedData] = useState([]); // State for the transformed data
  const teamId = "a75POUlJzMDmaJtz0JCxa";
  const wfmShifts = [
    { shift_id: 1, shift_name: "Working from Office" },
    { shift_id: 2, shift_name: "Working from Home" },
    { shift_id: 3, shift_name: "Vacation" },
    { shift_id: 4, shift_name: "Sick Leave" },
    { shift_id: 5, shift_name: "Personal Time" },
  ];

  const [selectedShift, setSelectedShift] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedShiftName, setSelectedShiftName] = useState(
    wfmShifts[0]?.shift_name
  );
  const [selectedCell, setSelectedCell] = useState(null);

  const queryClient = useQueryClient();

  const getApi = useApi({
    key: ["scheduler", page],
    method: "GET",
    url: `scheduler?teamId=${teamId}&page=${page}&limit=${limit}&q=${q}`,
  })?.get;

  const putApi = useApi({
    key: ["scheduler"],
    method: "PUT",
    url: "scheduler",
  })?.put;

  const handleUpdateShift = async (updatedShiftData) => {
    try {
      await putApi.mutateAsync({
        id: selectedShift.scheduler_id,
        ...updatedShiftData,
      });
      queryClient.invalidateQueries(["scheduler", page]);
    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedShiftData = {
      shift_name: selectedShiftName,
      start_time: e.target.start_time.value,
      end_time: e.target.end_time.value,
    };
    handleUpdateShift(updatedShiftData);
    setIsPopoverOpen(false);
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

  function transformData(apiResponse) {
    const recordsMap = new Map();

    Object.entries(apiResponse.data).forEach(([date, entries]) => {
      entries.forEach((entry) => {
        const { fullname } = entry;

        if (!recordsMap.has(fullname)) {
          recordsMap.set(fullname, { fullname });
        }

        const record = recordsMap.get(fullname);
        record[date] = entry;
      });
    });

    return Array.from(recordsMap.values());
  }
  useEffect(() => {
    if (getApi?.data) {
      const newData = transformData(getApi.data);
      setTransformedData(newData);

      const newColumns = generateColumns(getApi.data);
      setDynamicColumns(newColumns);

      setTotalPages(getApi.data.pages);
    }
  }, [getApi?.data]);

  return (
    <div>
      <Scheduler
        columns={dynamicColumns}
        data={transformedData}
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
        handleSubmit={handleSubmit}
        openPopover={openPopover}
        selectedCell={selectedCell}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
