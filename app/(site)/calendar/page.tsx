'use client'

import useApi from "@/hooks/useApi";
import dynamic from "next/dynamic";
import Message from "@/components/Message";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import Spinner from "@/components/Spinner";
import React, { useState } from "react";
import Scheduler from "@/components/Scheduler";

const Page = () => {
    const [page, setPage] = useState(1); // Define state for page
    const [limit, setLimit] = useState(7); // Define state for limit
    const [q, setQ] = useState(""); // Define state for query
    const teamId = 'a75POUlJzMDmaJtz0JCxa'
    const handlePrev = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        setPage(page + 1);
    };



    const getApi = useApi({
        key: ['scheduler', page],
        method: 'GET',
        url: `scheduler?teamId=${teamId}&page=${page}&limit=${limit}&q=${q}`,
    })?.get

    return (
        <>
            <TopLoadingBar isFetching={getApi?.isFetching || getApi?.isPending} />

            {getApi?.isPending ? (
                <Spinner />
            ) : getApi?.isError ? (
                <Message value={getApi?.error} />
            ) : (
                <div className='overflow-x-auto bg-white p-3 mt-2'>
                    <div className="container mx-auto p-4">
                        <Scheduler response={getApi.data}/>
                        <div className="flex justify-between mt-4">
                            <button onClick={handlePrev}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                                Previous
                            </button>
                            <button onClick={handleNext}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default dynamic(() => Promise.resolve(Page), {ssr: false})
