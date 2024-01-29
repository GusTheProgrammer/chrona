'use client'

import useApi from "@/hooks/useApi";
import dynamic from "next/dynamic";
import Message from "@/components/Message";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import Spinner from "@/components/Spinner";
import RTable from "@/components/RTable";
import { columns } from "@/app/(site)/calendar/columns";
import React, { useState } from "react";

const Page = () => {
    const [page, setPage] = useState(1); // Define state for page
    const [limit, setLimit] = useState(25); // Define state for limit
    const [q, setQ] = useState(""); // Define state for query

    const editHandler = (item) => {
        // Define your edit logic here
    };

    const deleteHandler = (item) => {
        // Define your delete logic here
    };

    const getApi = useApi({
        key: ['scheduler'], // Update this to match your view
        method: 'GET',
        url: `scheduler`, // Update this to match your view
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
                    <RTable
                        data={getApi?.data}
                        columns={columns({
                            editHandler,
                            deleteHandler,
                        })}
                        setPage={setPage}
                        setLimit={setLimit}
                        limit={limit}
                        q={q}
                        setQ={setQ}
                        caption='Scheduler Calendar'
                    />
                </div>
            )}
        </>
    )
}

export default dynamic(() => Promise.resolve(Page), { ssr: false })
