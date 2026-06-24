import React from 'react'

const TableNoData = () => {
    return (
        <tr>
            <td colSpan={9} className="py-10">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-gray-100 p-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7h18M6 11h12M9 15h6"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700">
                        No Data Found
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        There are no records available right now.
                    </p>
                </div>
            </td>
        </tr>
    )
}

export default TableNoData