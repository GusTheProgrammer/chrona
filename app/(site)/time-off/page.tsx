"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import TimeoffForm from "@/components/TimeoffForm";
import useApi from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const Page = () => {
  const wfmShifts = [
    {
      shift_id: 1,
      shift_name: "Working from Office",
      color:
        "bg-blue-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500",
    },
    {
      shift_id: 2,
      shift_name: "Working from Home",
      color:
        "bg-purple-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-purple-500 dark:to-pink-500",
    },
    {
      shift_id: 3,
      shift_name: "Vacation",
      color:
        "bg-red-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-red-500 dark:to-orange-500",
    },
    {
      shift_id: 4,
      shift_name: "Sick Leave",
      color:
        "bg-yellow-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-yellow-500 dark:to-lime-500",
    },
    {
      shift_id: 5,
      shift_name: "Personal Time",
      color:
        "bg-green-400 dark:bg-transparent dark:bg-gradient-to-r dark:from-green-500 dark:to-teal-500",
    },
  ];
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

  const userId = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).state.userInfo.id
    : null;

  const handleTimeOffFormSubmit = async (formData: any) => {
    console.log("formData", formData);
    try {
      const userId = localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo")).state.userInfo.id
        : null;
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
