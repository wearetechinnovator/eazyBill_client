const AttendanceShimmer = () => {
    return (
        <div className='shimmer__parent'>
            <div className="w-full flex justify-end mb-5">
                <div className='animate w-[150px] h-[27px] rounded'></div>
            </div>
            <div className="w-full flex justify-between mb-5 gap-8">
                {
                    Array.from({ length: 6 }, (n, i) => {
                        return <div className='animate w-full h-[65px] rounded' key={i + Math.random()}></div>
                    })
                }
            </div>

            <div className='flex flex-col gap-2'>
                {Array.from({ length: 6 }).map((i, _) =>
                    <div key={_ + Math.random()} className='animate w-full h-[30px] rounded'></div>)}
            </div>
        </div>
    )
}

export default AttendanceShimmer;
