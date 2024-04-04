"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import TimeoffForm from "@/components/TimeoffForm";
import useApi from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import wfmShifts from "@/config/wfmShifts";
import { useState } from "react";
import Message from "@/components/Message";

const Page = () => {
  const [selectedTimeOffRequest, setSelectedTimeOffRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredWfmShifts = wfmShifts.filter(
    (shift) =>
      shift.shift_name !== "Working from Home" &&
      shift.shift_name !== "Working from Office"
  );

  const queryClient = useQueryClient();

  const {
    data: timeOffRequests,
    isLoading,
    error,
  } = useApi({
    key: ["time-off"],
    method: "GET",
    url: `time-off`,
  }).GET;

  const createTimeoffApi = useApi({
    key: ["time-off"],
    method: "POST",
    url: "time-off",
  }).POST;

  const editTimeoffApi = useApi({
    key: ["time-off"],
    method: "PUT",
    url: "time-off",
  }).PUT;

  const deleteTimeoffApi = useApi({
    key: ["time-off"],
    method: "DELETE",
    url: "time-off",
  }).DELETE;

  const timeoffActionApi = useApi({
    key: ["time-off", "requestId"],
    method: "POST",
    url: "time-off",
  }).POST;

  const handleTimeOffFormSubmit = async (formData: any) => {
    console.log("Form data submitted:", formData);
    try {
      // Check if we are editing an existing time off request
      if (selectedTimeOffRequest) {
        // Adjust the formData as necessary for your API expectations
        await editTimeoffApi?.mutateAsync({
          id: selectedTimeOffRequest.id,
          ...formData,
        });
        console.log("Time off request edited successfully");
      } else {
        // Create a new time off request as before
        await createTimeoffApi?.mutateAsync({
          ...formData,
        });
        console.log("Time off scheduled successfully");
      }
      queryClient.invalidateQueries(["time-off"]);
      setSelectedTimeOffRequest(null); // Reset the selected request for editing
    } catch (error) {
      console.error("Error submitting Time off request:", error);
    }
  };

  const handleTimeoffRequestAction = async (id: any, isApproved: any) => {
    try {
      const actionUrl = `time-off/${id}`;

      const payload = {
        isApproved: isApproved,
      };

      await timeoffActionApi?.mutateAsync({
        ...payload,
        url: actionUrl,
      });
      console.log("Time off request edited successfully");
      queryClient.invalidateQueries(["time-off"]); // Adjust the query key as needed
    } catch (error) {
      console.error("Error editing time off request:", error);
    }
  };

  const handleEditAction = async (timeOffRequest: {
    id: any;
    dateFrom: string | number | Date;
    dateTo: string | number | Date;
    reason: any;
  }) => {
    console.log("Edit action called with ID:", timeOffRequest);
    const initialValues = {
      id: timeOffRequest.id,
      startDate: new Date(timeOffRequest.dateFrom), // Convert to Date object
      endDate: new Date(timeOffRequest.dateTo), // Convert to Date object
      shiftType: timeOffRequest.reason, // Assuming reason maps to shiftType
    };
    setSelectedTimeOffRequest(initialValues);
    setIsDialogOpen(true);
  };

  const handleDeleteAction = async (id: string) => {
    console.log("Delete action called with ID:", id);
    try {
      // Assuming your API expects the ID as part of the URL path
      await deleteTimeoffApi?.mutateAsync(id);
      console.log("Time off request deleted successfully");

      // Invalidate queries as needed
      queryClient.invalidateQueries(["time-off"]);
    } catch (error) {
      console.error("Error deleting time off request:", error);
    }
  };

  const handleDialogClose = (
    isOpen: boolean | ((prevState: boolean) => boolean)
  ) => {
    setIsDialogOpen(isOpen);
    if (!isOpen) {
      setSelectedTimeOffRequest(null); // Reset this when closing the dialog to allow new entries
    }
  };

  const columns = getColumns(
    handleTimeoffRequestAction,
    handleEditAction,
    handleDeleteAction
  );

  return (
    <div className="w-full">
      {timeoffActionApi?.isError && (
        <Message value={timeoffActionApi?.error} type="error" />
      )}
      {timeoffActionApi?.isSuccess && (
        <Message value="Time off request action successful" type="success" />
      )}
      {deleteTimeoffApi?.isError && (
        <Message value={deleteTimeoffApi?.error} type="error" />
      )}
      {deleteTimeoffApi?.isSuccess && (
        <Message value="Time off request deleted successfully" type="success" />
      )}
      {editTimeoffApi?.isError && (
        <Message value={editTimeoffApi?.error} type="error" />
      )}
      {editTimeoffApi?.isSuccess && (
        <Message value="Time off request edited successfully" type="success" />
      )}
      {createTimeoffApi?.isError && (
        <Message value={createTimeoffApi?.error} type="error" />
      )}
      {createTimeoffApi?.isSuccess && (
        <Message value="Time off request created successfully" type="success" />
      )}

      <DataTable columns={columns} data={timeOffRequests || []} />
      <div className="flex items-center justify-start space-x-2 py-4">
        <TimeoffForm
          onSubmit={handleTimeOffFormSubmit}
          wfmShifts={filteredWfmShifts}
          initialValues={selectedTimeOffRequest}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={handleDialogClose}
        />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
