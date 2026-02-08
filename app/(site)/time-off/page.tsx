"use client";

import * as React from "react";

import TimeoffForm from "@/components/TimeoffForm";
import useApi from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { useState } from "react";
import Message from "@/components/Message";

export const dynamic = 'force-dynamic';

const Page = () => {
  const [selectedTimeOffRequest, setSelectedTimeOffRequest] = useState<{
    id: any;
    startDate: Date;
    endDate: Date;
    shiftType: any;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const getTimeOffApi = useApi({
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

  const getWfmShifts = useApi({
    key: ["wfm-shifts"],
    method: "GET",
    url: "wfm-shifts",
  }).GET;

  const wfmShifts = getWfmShifts?.data || [];

  const filteredWfmShifts = wfmShifts.filter(
    (shift: { name: string }) =>
      shift.name !== "Working from Home" && shift.name !== "Working from Office"
  );
  const handleTimeOffFormSubmit = async (formData: any) => {
    try {
      if (selectedTimeOffRequest) {
        await editTimeoffApi?.mutateAsync({
          id: selectedTimeOffRequest.id,
          ...formData,
        });
      } else {
        await createTimeoffApi?.mutateAsync({
          ...formData,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
      setSelectedTimeOffRequest(null);
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
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
    } catch (error) {
      console.error("Error editing time off request:", error);
    }
  };

  const handleEditAction = async (timeOffRequest: {
    id: any;
    dateFrom: string | number | Date;
    dateTo: string | number | Date;
    reason: string;
  }) => {
    const initialValues = {
      id: timeOffRequest.id,
      startDate: new Date(timeOffRequest.dateFrom),
      endDate: new Date(timeOffRequest.dateTo),
      shiftType: timeOffRequest.reason,
    };
    setSelectedTimeOffRequest(initialValues);
    setIsDialogOpen(true);
  };

  const handleDeleteAction = async (id: string | number) => {
    try {
      // Assuming your API expects the ID as part of the URL path
      await deleteTimeoffApi?.mutateAsync(id.toString());

      // Invalidate queries as needed
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
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

  const hasPendingRequests =
    getTimeOffApi?.data?.some(
      (request: { status: string }) => request.status === "pending"
    ) || false;

  const columns = getColumns(
    handleTimeoffRequestAction,
    handleEditAction,
    handleDeleteAction,
    hasPendingRequests
  );

  return (
    <div className="w-full">
      {getTimeOffApi?.isLoading && <p>Loading...</p>}
      {getTimeOffApi?.isError && (
        <Message value={getTimeOffApi?.error} type="error" />
      )}
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
      {getWfmShifts?.isError && (
        <Message value={getWfmShifts?.error} type="error" />
      )}
      <div className="flex items-center justify-start space-x-2 py-4">
        <TimeoffForm
          onSubmit={handleTimeOffFormSubmit}
          wfmShifts={filteredWfmShifts}
          initialValues={selectedTimeOffRequest || undefined}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={handleDialogClose}
        />
      </div>
      <DataTable columns={columns} data={getTimeOffApi?.data || []} />
    </div>
  );
};

export default Page;
