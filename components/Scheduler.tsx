import { Item } from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { useState } from 'react';

const Scheduler = ({ response , wfmShifts, updateShift}) => {
    const [state, updateState] = useState({
        edit: false,
        selectedCell: null,
    });
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

    const setEdit = (cell : string) => {
        updateShift(cell)
       updateState({edit: true, selectedCell: cell});
      };


      const populateEditMenu = (selected) => (
        <select 
          className="shift-menu"
          onKeyUp={(e) => console.log(e)}
        //   onChange={(e) => this.handleUpdate(e)}
        >
          <option defaultValue={selected}>{selected}</option>
          {wfmShifts.map(
            (item) =>
              item.shift_name !== selected && (
                <option key={item.shift_id} value={item.shift_id}>
                  {item.shift_name}
                </option>
              )
          )}
          {/* <option value="custom">Create Shift</option> */}
        </select>
      );



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
                                    title={shift ? `Start: ${new Date(shift.start_time).toLocaleTimeString()}, End: ${new Date(shift.end_time).toLocaleTimeString()}` : ''}
                                    onDoubleClick={() => setEdit(shift.scheduler_id)}>
                                    {shift.scheduler_id === state?.selectedCell ? populateEditMenu(shift.shift_name) : shift.shift_name}
                
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
