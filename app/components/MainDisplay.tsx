"use client";

import Button from "./ui/button";

export default function MainDisplay() {
    return (
        <section className="bg-white py-8">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6 auto-rows-[290px]">
                    {/* Large Promotional Banner - Leftmost, spans 2 columns and 2 rows */}
                    <div className="md:col-span-2 md:row-span-2 relative bg-zinc-900 border-4 border-green-500 overflow-hidden">
                        <div className="absolute inset-0 bg-zinc-900"></div>
                        <div className="relative h-full p-8 flex flex-col justify-center items-start z-10">
                            <p className="text-white text-sm font-medium mb-2">2025/26 NBA & Nike</p>
                            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">CITY EDITION<br />REMIX</h2>
                            <Button className="bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-2.5 text-sm font-bold">
                                Shop Now
                            </Button>
                        </div>
                        {/* Messi 10 Jersey - Dark Blue */}
                        <div className="absolute right-8 bottom-8 w-32 h-40 opacity-20 z-0">
                            <div className="w-full h-full bg-blue-600 rounded relative overflow-hidden">
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">MESSI</div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white text-2xl font-bold">10</div>
                            </div>
                        </div>
                        {/* Manchester United Jersey - Red with Green Border */}
                        <div className="absolute right-24 bottom-12 w-28 h-36 opacity-90 border-4 border-green-500 rounded z-0">
                            <div className="w-full h-full bg-red-600 rounded relative overflow-hidden">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-[8px] font-bold">CHEVROLET</div>
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">MAN UTD</div>
                            </div>
                        </div>
                    </div>

                    {/* Empty Placeholder - Second from Left */}
                    <div className="md:col-span-1 bg-zinc-900 border-4 border-purple-500 flex items-center justify-center">
                    </div>

                    {/* NFL Jersey - Third from Left */}
                    <div className="md:col-span-1 bg-white border-4 border-purple-500 flex items-center justify-center p-4">
                        <div className="text-center w-full">
                            <div className="w-32 h-40 mx-auto bg-blue-700 rounded flex items-center justify-center relative overflow-hidden">
                                <span className="text-white text-6xl font-bold z-10">93</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-blue-600"></div>
                            </div>
                        </div>
                    </div>

                    {/* NBA Lakers Jersey - Fourth from Left */}
                    <div className="md:col-span-1 bg-white border-4 border-purple-500 flex items-center justify-center p-4">
                        <div className="text-center w-full">
                            <div className="w-32 h-40 mx-auto bg-yellow-400 rounded flex items-center justify-center relative overflow-hidden">
                                <span className="text-purple-700 text-lg font-bold leading-tight z-10">LAKERS<br />23</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500"></div>
                            </div>
                        </div>
                    </div>

                    {/* NBA Bulls Jersey - Fifth from Left */}
                    <div className="md:col-span-1 bg-white border-4 border-orange-500 flex items-center justify-center p-4">
                        <div className="text-center w-full">
                            <div className="w-32 h-40 mx-auto bg-red-600 rounded flex items-center justify-center relative overflow-hidden">
                                <span className="text-white text-lg font-bold leading-tight z-10">BULLS<br />23</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-red-700 to-red-500"></div>
                                {/* Hanger effect */}
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-amber-800 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Rightmost Large Section - Empty Placeholder, spans 1 column and 2 rows */}
                    <div className="md:col-span-1 md:row-span-2 bg-zinc-900 border-4 border-zinc-700 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
                            <div className="transform -rotate-90 text-zinc-600 text-xs font-medium whitespace-nowrap">
                                2025/2026 CITY EDITION
                            </div>
                            <div className="transform rotate-90 text-zinc-600 text-xs font-medium whitespace-nowrap">
                                2025/2026 CITY EDITION
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

