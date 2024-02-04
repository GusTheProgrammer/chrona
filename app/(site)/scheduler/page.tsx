"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import useApi from "@/hooks/useApi";
import Message from "@/components/Message";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import Spinner from "@/components/Spinner";
import Scheduler from "@/components/Scheduler";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);
  const [q, setQ] = useState("");
  const teamId = "a75POUlJzMDmaJtz0JCxa";
  const wfmShifts = [
    { shift_id: 1, shift_name: "Working from Office" },
    { shift_id: 2, shift_name: "Working from Home" },
    { shift_id: 3, shift_name: "Vacation" },
    { shift_id: 4, shift_name: "Sick Leave" },
    { shift_id: 5, shift_name: "Personal Time" },
  ];

  const [selectedShift, setSelectedShift] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(false);
  };

  const openDialog = (shift) => {
    setSelectedShift(shift);
    setIsDialogOpen(true);
  };

  // Navigation handlers
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  return (
    // Existing JSX with modifications to pass new props to Scheduler
    <>
      <TopLoadingBar isFetching={getApi?.isFetching || getApi?.isPending} />
      {getApi?.isPending ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message value={getApi?.error} />
      ) : (
        <div className="overflow-x-auto bg-white p-3 mt-2">
          <div className="container mx-auto p-4">
            <Scheduler
              response={getApi.data}
              wfmShifts={wfmShifts}
              page={page}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              selectedShiftName={selectedShiftName}
              setSelectedShiftName={setSelectedShiftName}
              handleSubmit={handleSubmit}
              openDialog={openDialog}
              selectedCell={selectedCell}
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
