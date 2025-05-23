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
    const [isLoading, setIsLoading] = useState(false);
    const [topicStats, setTopicStats] = useState({});
    const [filteredTopics, setFilteredTopics] = useState({});
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);


    const handleGetMessages = async () => {
        setIsLoading(true);
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

            // Group by topic name from "value" field (e.g. Input_rpm, Output_rpm, etc.)
            const topicWiseData = {};

            entries.forEach((entry) => {
                if (!entry.value) return;

                const [topicRaw, valueRaw] = entry.value.split(":");
                if (!topicRaw || !valueRaw) return;

                const topic = topicRaw.trim(); // e.g. "Input_rpm"
                const value = parseFloat(valueRaw.trim());

                if (isNaN(value)) return;

                if (!topicWiseData[topic]) {
                    topicWiseData[topic] = [];
                }

                topicWiseData[topic].push({
                    date: entry.date,
                    time: entry.time,
                    value,
                });
            });

            console.log("📊 Topic-wise Data:", topicWiseData);

            // Calculate min, max, avg for each topic
            const statsPerTopic = {};
            for (const [topic, data] of Object.entries(topicWiseData)) {
                const values = data.map((d) => d.value);
                if (values.length > 0) {
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    statsPerTopic[topic] = { min, max, average: avg };
                }
            }
            setTopicStats(statsPerTopic);

            // Optionally store topicWiseData in state
            setFilteredTopics(topicWiseData);

            // If you want to keep your original gearStats based on Input_rpm only:
            const inputRpmValues = topicWiseData["Input_rpm"]?.map((d) => d.value) || [];
            if (inputRpmValues.length > 0) {
                const minValue = Math.min(...inputRpmValues);
                const maxValue = Math.max(...inputRpmValues);
                const sum = inputRpmValues.reduce((acc, val) => acc + val, 0);
                const avgValue = sum / inputRpmValues.length;

                const minMaxAverage = (minValue + maxValue) / 2;


                setGearStats({
                    average: avgValue,
                    min: minValue,
                    max: maxValue,
                     minMaxAverage: minMaxAverage,
                });
            } else {
                setGearStats({
                    average: 0,
                    min: 0,
                    max: 0,
                     minMaxAverage: 0,
                });
            }
        } catch (error) {
            console.error("❌ GET error:", error);
            setGearStats("Error fetching data");
            setTopicStats({});
        } finally {
            setIsLoading(false);
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
                                setDateRange([
                                    {
                                        ...dateRange[0],
                                        startDate: item.selection.startDate,
                                        endDate: dateRange[0].endDate,
                                        key: "selection",
                                    },
                                ]);
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
                                setDateRange([
                                    {
                                        ...dateRange[0],
                                        startDate: dateRange[0].startDate,
                                        endDate: item.selection.endDate,
                                        key: "selection",
                                    },
                                ]);
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
                className={`w-full text-white py-2 px-4 rounded mb-4 transition ${isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
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
                {/* Topic-wise stats */}
                {Object.keys(topicStats).length > 0 && (
                    <div className=" bg-gray-100 rounded max-h-36 overflow-y-auto">
                        <h3 className="font-semibold mb-2 text-gray-700">
                            Topic-wise Stats
                        </h3>
                        {Object.entries(topicStats).map(([topic, stats]) => (
                  <div>
    <p className="font-semibold">{topic}</p>
    <p>Average: {stats.average.toFixed(2)}</p>
    <p>Min: {stats.min}</p>
    <p>Max: {stats.max}</p>
    <p>Min-Max Avg: {stats.minMaxAverage.toFixed(2)}</p> {/* ✅ New line */}
</div>
                        ))}
                    </div>
                )}

                {/* Gear Entries */}
                <div className="flex-1 h-20">
                    {gearEntries.length > 0 && (
                        <div>
                            <div className="border rounded-lg shadow-sm p-3 max-h-36 overflow-y-auto bg-white">
                                {gearEntries.map((entry, index) => (
                                    <div key={index} className="border-b last:border-b-0 py-2">
                                        <p className="text-sm text-gray-700">
                                            <strong>Date:</strong> {entry.date}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Gearvalue:</strong> {entry.value}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Time:</strong> {entry.time}
                                        </p>
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
