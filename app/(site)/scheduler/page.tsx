"use client";

import React, { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { DataTable } from "@/components/DataTable";
import dynamic from "next/dynamic";
import { generateColumns } from "./columns"; // make sure to export generateColumns from columns.tsx

const Page = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(7);
  const [q, setQ] = useState("");
  const [dynamicColumns, setDynamicColumns] = useState([]); // State to hold the dynamic columns
  const [transformedData, setTransformedData] = useState([]); // State for the transformed data

  const teamId = "a75POUlJzMDmaJtz0JCxa";

  const getApi = useApi({
    key: ["scheduler", page],
    method: "GET",
    url: `scheduler?teamId=${teamId}&page=${page}&limit=${limit}&q=${q}`,
  })?.get;

  // This function flattens the data object into an array of rows
  function transformData(apiResponse) {
    // Create a map to easily update the records based on fullname
    const recordsMap = new Map();

    // Iterate over each date key in the response
    Object.entries(apiResponse.data).forEach(([date, entries]) => {
      entries.forEach((entry) => {
        const { fullname, shift_name } = entry;

        // If the record for this fullname does not exist, create it
        if (!recordsMap.has(fullname)) {
          recordsMap.set(fullname, { fullname });
        }

        // Retrieve the existing record from the map
        const record = recordsMap.get(fullname);

        // Add or update the status for the specific date
        record[date] = shift_name || ""; // Use "Off" or any other default value you need
      });
    });

    // Convert the map values to an array
    return Array.from(recordsMap.values());
  }

  // useEffect to update the columns when the data changes
  useEffect(() => {
    if (getApi?.data) {
      // Call generateColumns with the API response data
      const newData = transformData(getApi.data);
      setTransformedData(newData);

      const newColumns = generateColumns(getApi.data);
      setDynamicColumns(newColumns);

      setTotalPages(getApi.data.pages); // Set total pages from API response
    }
  }, [getApi?.data]); // Dependency array to only re-run when getApi.data changes

  const data = getApi?.data?.data; // Assuming the actual table data is within the 'data' property of the response

  return (
    <div>
      {/* Pass the dynamic columns and data to the DataTable */}
      <DataTable
        columns={dynamicColumns}
        data={transformedData}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
