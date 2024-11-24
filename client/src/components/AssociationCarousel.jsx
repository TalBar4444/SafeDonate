import AssociationCard from "./AssociationCard";

/**
 * Carousel component displaying a grid of association cards with hover effects
 */
const AssociationCarousel = ({ dataList, userId }) => {
    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {dataList.map((name, index) => (
                    <div 
                        key={index} 
                        className="flex h-[230px] w-full items-center justify-center p-4 cursor-pointer 
                                 transition-all duration-300 rounded-2xl bg-[#dedede] 
                                 hover:bg-slate-200 shadow-md hover:shadow-2xl hover:scale-105"
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            <AssociationCard association={name} userId={userId} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssociationCarousel;