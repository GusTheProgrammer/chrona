"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import TimeoffForm from "@/components/TimeoffForm";
import useApi from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import wfmShifts from "@/config/wfmShifts";

const Page = () => {
  const filteredWfmShifts = wfmShifts.filter(
    (shift) =>
      shift.shift_name !== "Working from Home" &&
      shift.shift_name !== "Working from Office"
  );

  const queryClient = useQueryClient();

  const createTimeoffApi = useApi({
    key: ["time-off"],
    method: "POST",
    url: "time-off",
  }).post;

  const userId = JSON.parse(localStorage.getItem("userInfo")!).state.userInfo
    .id;

  const handleTimeOffFormSubmit = async (formData: any) => {
    console.log("formData", formData);
    try {
      if (!userId) {
        console.error("User ID is required");
        return;
      }
      await createTimeoffApi.mutateAsync({
        userId: userId,
        ...formData,
      });
      console.log("Time off scheduled successfully");
      queryClient.invalidateQueries(["timeoff"]);
    } catch (error) {
      console.error("Error scheduling Time off:", error);
    }
  };

  const {
    data: timeOffRequests,
    isLoading,
    error,
  } = useApi({
    key: ["time-off", userId],
    method: "GET",
    url: `time-off?userId=${userId}`,
  }).get;

  console.log("userId", userId);
  console.log("timeOffRequests", timeOffRequests);

  return (
    <div className="w-full">
      <DataTable columns={columns} data={timeOffRequests || []} />
      <div className="flex items-center justify-start space-x-2 py-4">
        <TimeoffForm
          onSubmit={handleTimeOffFormSubmit}
          wfmShifts={filteredWfmShifts}
        />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
