import React, { useState } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useMqtt } from "../store/MqttContext";

const apiUrl = import.meta.env.VITE_API_URL;

const Count = () => {
    const { publishMessage } = useMqtt();
    const [gearStats, setGearStats] = useState(null);
    const [gearEntries, setGearEntries] = useState([]);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const handleGetMessages = async () => {
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

            // Correctly extract number after '|'
            const gearValues = entries
                .map((entry) => {
                    if (!entry.value) return NaN;
                    const parts = entry.value.split("|");
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
        }
    };

    return (
        <div className="p-4 rounded">
            <h2 className="text-lg font-semibold mb-4">Gear Value Count</h2>

            {/* Start Date Input */}
            <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">Start Date</label>
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

            {/* Button */}
            <button
                onClick={handleGetMessages}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4 transition"
            >
                Get Gear Value Stats
            </button>

            {/* Flex Row Layout */}
            <div className="flex justify-between space-x-2">
                {/* Left: Raw Response Entries */}
                <div className="w-2/3 overflow-y-auto max-h-60">
                    {gearEntries.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Raw Response Data:</h3>
                            <div className="border border-gray-400 p-1 rounded">
                                {gearEntries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="border-b border-gray-300 p-2 last:border-b-0"
                                    >
                                        <p><strong>Date:</strong> {entry.date}</p>
                                        <p><strong>Gearvalue:</strong> {entry.value}</p>
                                        <p><strong>Time:</strong> {entry.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Gear Stats */}
                <div className="w-1/3">
                    {gearStats && (
                        <div className="bg-gray-100 p-1 rounded">
                            <p className="font-medium text-lg mb-2">Gear Value Stats:</p>
                            <div className="space-y-2">
                                <p><strong>Average:</strong> {gearStats.average?.toFixed(2)}</p>
                                <p><strong>Min:</strong> {gearStats.min}</p>
                                <p><strong>Max:</strong> {gearStats.max}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Count;
