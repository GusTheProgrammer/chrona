import React from 'react';

const Scheduler = ({ response }) => {
    const data = response.data;
    if (!data) return <div>Loading...</div>;

    // Extract unique employees
    const employees = new Set();
    Object.values(data).forEach(dateShifts => {
        dateShifts.forEach(shift => employees.add(shift.fullname));
    });

    // Extract headers (dates)
    const headers = Object.keys(data);

    // Check if there are any shifts
    if (headers.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    {headers.map((date, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {new Date(date).toLocaleDateString()}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {[...employees].map((employee, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee}</td>
                        {headers.map((date, dateIndex) => {
                            const shift = data[date].find(shift => shift.fullname === employee);
                            return (
                                <td key={dateIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    style={{ backgroundColor: shift ? shift.shift_color : 'transparent', color: "white"}}
                                    title={shift ? `Start: ${new Date(shift.start_time).toLocaleTimeString()}, End: ${new Date(shift.end_time).toLocaleTimeString()}` : ''}>
                                    {shift ? shift.shift_name : ''}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Scheduler;
