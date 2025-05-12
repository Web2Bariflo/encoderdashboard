import React, { useState } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


const apiUrl = import.meta.env.VITE_API_URL;

const Count = () => {
    // const { publishMessage } = useMqtt();
    const [gearStats, setGearStats] = useState(null);
    const [gearEntries, setGearEntries] = useState([]);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 🔹 New state

    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const handleGetMessages = async () => {
        setIsLoading(true); // 🔹 Start loader
        try {
            const start = format(dateRange[0].startDate, "yyyy-MM-dd");
            const end = format(dateRange[0].endDate, "yyyy-MM-dd");

            const response = await axios.get(`${apiUrl}/filter_gear_value/`, {
                params: {
                    from_date: start,
                    to_date: end,
                },
            });

            const entries = response.data || [];
            setGearEntries(entries);
            console.log("📥 Gear Entries:", entries);

            const gearValues = entries
                .map((entry) => {
                    if (!entry.value) return NaN;
                    const parts = entry.value.split(":");
                    if (parts.length > 1) {
                        const valuePart = parts[1].trim();
                        return parseFloat(valuePart);
                    }
                    return NaN;
                })
                .filter((val) => !isNaN(val));

            if (gearValues.length > 0) {
                const minValue = Math.min(...gearValues);
                const maxValue = Math.max(...gearValues);
                const avgValue = (minValue + maxValue) / 2;

                console.log("✅ Correct Gear Values - Avg:", avgValue, "Min:", minValue, "Max:", maxValue);

                setGearStats({
                    average: avgValue,
                    min: minValue,
                    max: maxValue,
                });
            } else {
                setGearStats({
                    average: 0,
                    min: 0,
                    max: 0,
                });
            }
        } catch (error) {
            console.error("❌ GET error:", error);
            setGearStats("Error fetching data");
        } finally {
            setIsLoading(false); // 🔹 Stop loader
        }
    };

    return (
        <div className="rounded p-2">
            {/* Start Date Input */}
            <div className="mb-2 relative">
                <label className="block text-sm font-medium mb-1">Start Date </label>
                <input
                    type="text"
                    readOnly
                    value={format(dateRange[0].startDate, "dd/MM/yyyy")}
                    onClick={() => {
                        setShowStartCalendar(!showStartCalendar);
                        setShowEndCalendar(false);
                    }}
                    className="w-full border px-3 py-2 rounded cursor-pointer text-sm bg-white shadow-sm"
                />
                {showStartCalendar && (
                    <div className="absolute z-10 w-full">
                        <DateRange
                            editableDateInputs={true}
                            onChange={(item) => {
                                setDateRange([{
                                    ...dateRange[0],
                                    startDate: item.selection.startDate,
                                    endDate: dateRange[0].endDate,
                                    key: "selection",
                                }]);
                                setShowStartCalendar(false);
                            }}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                            rangeColors={["#3b82f6"]}
                            showDateDisplay={false}
                        />
                    </div>
                )}
            </div>

            {/* End Date Input */}
            <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                    type="text"
                    readOnly
                    value={format(dateRange[0].endDate, "dd/MM/yyyy")}
                    onClick={() => {
                        setShowEndCalendar(!showEndCalendar);
                        setShowStartCalendar(false);
                    }}
                    className="w-full border px-3 py-2 rounded cursor-pointer text-sm bg-white shadow-sm"
                />
                {showEndCalendar && (
                    <div className="absolute z-10 w-full">
                        <DateRange
                            editableDateInputs={true}
                            onChange={(item) => {
                                setDateRange([{
                                    ...dateRange[0],
                                    startDate: dateRange[0].startDate,
                                    endDate: item.selection.endDate,
                                    key: "selection",
                                }]);
                                setShowEndCalendar(false);
                            }}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                            rangeColors={["#3b82f6"]}
                            showDateDisplay={false}
                        />
                    </div>
                )}
            </div>

            {/* Button with loader */}
            <button
                onClick={handleGetMessages}
                disabled={isLoading}
                className={`w-full text-white py-2 px-4 rounded mb-4 transition ${
                    isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-4 w-4 text-white"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3.536-3.536L12 0v4a8 8 0 00-8 8z"
                            ></path>
                        </svg>
                        Loading...
                    </div>
                ) : (
                    "Get Gear Value Stats"
                )}
            </button>

            {/* Stats and Raw Data */}
            <div className="flex flex-col space-y-2">
                <div className="flex-1">
                    {gearStats && (
                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4 shadow-sm">
                            <p className="font-semibold text-l text-gray-800 mb-1 border-b">Gear Value Stats</p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Average:</strong> {gearStats.average?.toFixed(2)}</p>
                                <p><strong>Min:</strong> {gearStats.min}</p>
                                <p><strong>Max:</strong> {gearStats.max}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 h-20">
                    {gearEntries.length > 0 && (
                        <div>
                            <div className="border rounded-lg shadow-sm p-3 max-h-44 overflow-y-auto bg-white">
                                {gearEntries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="border-b last:border-b-0 py-2"
                                    >
                                        <p className="text-sm text-gray-700"><strong>Date:</strong> {entry.date}</p>
                                        <p className="text-sm text-gray-700"><strong>Gearvalue:</strong> {entry.value}</p>
                                        <p className="text-sm text-gray-700"><strong>Time:</strong> {entry.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Count;
