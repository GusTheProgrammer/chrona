import { ActionButton } from '@/components/ui/CustomForm'
import DateTime from '@/lib/dateTime'
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'

type Column = {
  editHandler: (item: any) => void
  deleteHandler: (item: any) => void
}

export const columns = ({ editHandler, deleteHandler }: Column) => {
  return [
    { header: 'Scheduler ID', accessorKey: 'scheduler_id', active: true },
    { header: 'Date', accessorKey: 'datestamp', active: true, cell: ({ row: { original } }: any) => DateTime(original?.datestamp).format('DD-MM-YYYY') },
    { header: 'Full Name', accessorKey: 'fullname', active: true },
    { header: 'Email', accessorKey: 'email', active: true },
    { header: 'Team', accessorKey: 'team_name', active: true },
    { header: 'Shift', accessorKey: 'shift_name', active: true },
    {
      header: 'CreatedAt',
      accessorKey: 'createdAt',
      active: true,
      cell: ({ row: { original } }: any) =>
        DateTime(original?.createdAt).format('DD-MM-YYYY'),
    },

  ]
}
