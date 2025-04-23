import React, { useState } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const apiUrl = import.meta.env.VITE_API_URL;

const Count = () => {
    const [fuelCount, setFuelCount] = useState(null);
    const [fuelEntries, setFuelEntries] = useState([]);
    const [sensorStats, setSensorStats] = useState({
        R: { min: 0, max: 0, avg: 0 },
        Y: { min: 0, max: 0, avg: 0 },
        B: { min: 0, max: 0, avg: 0 },
        C: { min: 0, max: 0, avg: 0 },
        D: { min: 0, max: 0, avg: 0 },
    });
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    // Fetch fuel entries and calculate total quantity
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
            setFuelEntries(entries);

            console.log(response.data);

            // Calculate total quantity
            const total = entries.reduce((sum, item) => {
                const qty = parseFloat(item.quantity);
                return !isNaN(qty) ? sum + qty : sum;
            }, 0);

            setFuelCount(total);



            // Update sensor stats (assuming your backend returns the stats as part of the response)
            const stats = {
                R: { min: 0, max: 100, avg: 50 },  // Example placeholder stats
                Y: { min: 0, max: 100, avg: 50 },
                B: { min: 0, max: 100, avg: 50 },
                C: { min: 0, max: 100, avg: 50 },
                D: { min: 0, max: 100, avg: 50 },
            };
            setSensorStats(stats);

            console.log("📥 Total Quantity:", total);
        } catch (error) {
            console.error("❌ GET error:", error);
            setFuelCount("Error fetching data");
        }
    };

    return (
        <div className=" p-4 rounded">
            <h2 className="text-lg font-semibold mb-4">Fuel Count</h2>

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

            {/* Button */}
            <button
                onClick={handleGetMessages}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4 transition"
            >
                Get Message Count
            </button>

            {/* Result */}
            {fuelCount !== null && (
                <div className="bg-gray-100 p-3 rounded">
                    <p className="font-medium">Total Quantity:</p>
                    <p className="text-lg font-bold">
                        {typeof fuelCount === "number"
                            ? `${fuelCount} Liters filled`
                            : fuelCount}
                    </p>
                </div>
            )}

            {/* Sensor Stats */}
            {/* <div className="bg-gray-100 p-3 rounded mt-4 h-96">
        <h3 className="text-lg font-semibold mb-2">Sensor Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">R Sensor</h4>
            <p>Min: {sensorStats.R.min}</p>
            <p>Max: {sensorStats.R.max}</p>
            <p>Avg: {sensorStats.R.avg}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Y Sensor</h4>
            <p>Min: {sensorStats.Y.min}</p>
            <p>Max: {sensorStats.Y.max}</p>
            <p>Avg: {sensorStats.Y.avg}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">B Sensor</h4>
            <p>Min: {sensorStats.B.min}</p>
            <p>Max: {sensorStats.B.max}</p>
            <p>Avg: {sensorStats.B.avg}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">C Sensor</h4>
            <p>Min: {sensorStats.C.min}</p>
            <p>Max: {sensorStats.C.max}</p>
            <p>Avg: {sensorStats.C.avg}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">D Sensor</h4>
            <p>Min: {sensorStats.D.min}</p>
            <p>Max: {sensorStats.D.max}</p>
            <p>Avg: {sensorStats.D.avg}</p>
          </div>
        </div>
      </div> */}

            {/* Raw Response Data */}
            {fuelEntries.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-medium mb-2">Raw Response Data:</h3>
                    <div className="border border-gray-400 p-3 rounded max-h-60 overflow-y-auto">
                        {fuelEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="border-b border-gray-300 p-2 last:border-b-0"
                            >
                                <p>
                                    <strong>Date:</strong> {entry.date}
                                </p>
                                <p>
                                    <strong>Gearvalue:</strong> {entry.gear_value}
                                </p>
                                <p>
                                    <strong>Time:</strong> {entry.time}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Count;
