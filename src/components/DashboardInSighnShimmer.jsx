const DashboardInSighnShimmer = () => {
    const shimmerContent = (
        <>
            <div className="h-4 w-32 rounded mb-2 animate"></div>
            <div className="h-3 w-20 rounded animate"></div>
        </>
    );

    return (
        <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-[10px] p-4 border shadow shimmer__parent">
                    <div className="flex justify-between items-center">
                        <div className="w-[85%]">
                            {shimmerContent}
                        </div>
                        <div className="w-[15%] flex justify-center">
                            <div className="w-[30px] h-[30px] rounded-full shimmer"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardInSighnShimmer;
