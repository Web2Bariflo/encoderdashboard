import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useMqtt } from '../store/MqttContext';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const apiUrl = import.meta.env.VITE_API_URL;

const LineCharts = () => {
    const { data, clearTopicData } = useMqtt();
    const messages = data['pomon/rnd/status'] || [];

    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const [latestValues, setLatestValues] = useState({
        R: 10,
        Y: 20,
        B: 0.1,
        C: 10,
        D: 50,
    });

    // Add the dateRange state for selecting the date range
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            // key: 'selection',
        }
    ]);

    useEffect(() => {
        if (!messages.length) return;

        const parseMessage = (msg) => {
            const { value } = msg;
            const match = value.match(/R=([\d.]+), Y=([\d.]+), B=([\d.]+)(?:, C=([\d.]+))?(?:, D=([\d.]+))?/);
            if (!match) return null;

            return {
                R: parseFloat(match[1]),
                Y: parseFloat(match[2]),
                B: parseFloat(match[3]),
                C: parseFloat(match[4] || 0),
                D: parseFloat(match[5] || 0),
            };
        };

        const latest = [...messages].reverse().map(parseMessage).find(Boolean);
        if (latest) {
            setLatestValues(latest);
        }
    }, [messages]);

    useEffect(() => {
        buildChart();
    }, [latestValues]);

    const buildChart = () => {
        if (chartInstance.current) chartInstance.current.destroy();

        const labels = ['R', 'Y', 'B', 'C', 'D'];
        const values = labels.map((key) => latestValues[key]);
        const colors = {
            R: '#3b82f6', // blue
            Y: '#facc15', // yellow
            B: '#ef4444', // red
            C: '#10b981', // green
            D: '#8b5cf6', // purple
        };

        chartInstance.current = new Chart(chartRef.current, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Sensor Values',
                        data: values,
                        backgroundColor: labels.map((label) => colors[label]),
                        borderRadius: 4,
                        barThickness: 40,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true },
                },
                plugins: {
                    legend: { display: false },
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutBounce',
                },
            },
        });
    };

    // Handle CSV download logic with proper time formatting
    const handleCSVDownload = async () => {
        try {
        
            const response = await axios.get(`${apiUrl}/download_gear_value/`, {
                responseType: 'blob',
            });

            // 2. Read blob as text (for logging and processing)
            const csvData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsText(response.data);
            });

            console.log('📄 Raw CSV Data:', csvData);

            // 3. Format CSV for Excel compatibility
            const excelFormattedCSV = csvData
                .split('\n')
                .map((row) => {
                    if (!row.trim()) return row; 
                    const [date, time, value] = row.split(',');

                    // Force Excel to treat dates as text (prevent auto-formatting)
                    return `\t"${date}","${time}",${value}`;
                })
                .join('\n');

            // 4. Add UTF-8 BOM and set correct MIME type
            const blob = new Blob(["\uFEFF" + excelFormattedCSV], {
                type: 'text/csv;charset=utf-8;'
            });

            // 5. Trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'gear_values.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Excel-compatible CSV download started');
        } catch (error) {
            console.error('❌ Download failed:', error.response || error.message || error);
        }
    };

    return (
        <div className="flex p-4">
            <div className="flex w-full h-[500px] gap-4">
                {/* Chart Container - 70% */}
                <div className=" bg-white p-6 shadow rounded relative flex flex-col justify-between">
                    <button
                        onClick={handleCSVDownload}
                        className="absolute top-4 right-4 bg-blue-400 hover:bg-blue-500 text-sm px-3 py-1 rounded flex items-center gap-1 text-white"
                    >
                        .csv
                        <FiDownload className="text-base" />
                    </button>

                    <h2 className="text-lg font-semibold text-center mb-4">Live Sensor Values</h2>
                    <canvas ref={chartRef} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
};

export default LineCharts;
