import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useMqtt } from '../store/MqttContext';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const LineCharts = () => {
  const { data } = useMqtt();
  const [loading, setLoading] = useState(false);
  // const topics = ['publish/1', 'publish/2', 'publish/3', 'publish/4', 'publish/5'];

  const topics = [
    'factory/gearbox1/input/rpm',
    'factory/gearbox1/out1/rpm',
    'factory/gearbox1/out2/rpm',
    'factory/gearbox1/out3/rpm',
    'factory/gearbox1/out4/rpm'
  ];

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [latestValues, setLatestValues] = useState({
    'factory/gearbox1/input/rpm': [],
    'factory/gearbox1/out1/rpm': [],
    'factory/gearbox1/out2/rpm': [],
    'factory/gearbox1/out3/rpm': 0,
    'factory/gearbox1/out4/rpm': 0,
  });

  // const [latestValues, setLatestValues] = useState({
  //   'publish/1': [],
  //   'publish/2': [],
  //   'publish/3': [],
  //   'publish/4': [],
  //   'publish/5': [],
  // });

  // Update latestValues with last 30 messages for each topic
  useEffect(() => {
    const updatedValues = { ...latestValues };

    topics.forEach((topic) => {
      const messages = data[topic] || [];
      const numericMessages = messages
        .map((msg) => parseFloat(msg.value))
        .filter((val) => !isNaN(val));
      updatedValues[topic] = numericMessages.slice(-30); // keep only last 10
    });

    setLatestValues(updatedValues);
  }, [data]);

  // Initialize chart once
  useEffect(() => {
    const colors = ['#f472b6', '#facc15', '#10b981', '#3b82f6', '#ef4444'];

    const ctx = chartRef.current.getContext('2d');

    // const customLabels = {
    //   'publish/1': 'Input',
    //   'publish/2': 'Output1',
    //   'publish/3': 'Output2',
    //   'publish/4': 'Output3',
    //   'publish/5': 'Output4',
    // };

    const customLabels = {
      'factory/gearbox1/input/rpm': 'Input',
      'factory/gearbox1/out1/rpm': 'Output1',
      'factory/gearbox1/out2/rpm': 'Output2',
      'factory/gearbox1/out3/rpm': 'Output3',
      'factory/gearbox1/out4/rpm': 'Output4',
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 10 }, (_, i) => i + 1),
        datasets: topics.map((topic, index) => ({
          label: customLabels[topic] || topic,
          data: [],
          borderColor: colors[index],
          backgroundColor: 'white',
          fill: false,
          tension: 0,
          pointRadius: 2,
          pointHoverRadius: 4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            // reverse: true,
            title: {
              display: true,
              // text: 'Data Points (1 to 30)',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              // text: 'RPM',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
        },
        animation: {
          duration: 0,
        },
      },
    });
  }, []);

  // Update chart data dynamically without destroying
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const maxPoints = 10;
    const xLabels = Array.from({ length: maxPoints }, (_, i) => i + 1);
    chart.data.labels = xLabels;

    topics.forEach((topic, index) => {
      const values = latestValues[topic] || [];
      const recentValues = values.slice(-maxPoints); // last 10 values only
      chart.data.datasets[index].data = recentValues;
    });

    chart.update();
  }, [latestValues]);

  const handleCSVDownload = async () => {
    try {
      setLoading(true); // Start loader
      const response = await axios.get(`${apiUrl}/download_gear_value/`, {
        responseType: 'blob',
      });

      const csvData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });

      console.log('📄 Raw CSV Data:', csvData);

      const excelFormattedCSV = csvData
        .split('\n')
        .map((row) => {
          if (!row.trim()) return row;
          const [date, time, value] = row.split(',');
          return `\t"${date}","${time}",${value}`;
        })
        .join('\n');

      const blob = new Blob(["\uFEFF" + excelFormattedCSV], {
        type: 'text/csv;charset=utf-8;',
      });

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
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="flex">
      <div className="flex w-full h-[500px] gap-4">
        <div className="bg-white p-6 shadow rounded relative flex flex-col justify-between w-full">
          <button
            onClick={handleCSVDownload}
            disabled={loading}
            className={`absolute top-4 right-4 text-sm px-3 py-1 rounded flex items-center gap-1 text-white ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-400 hover:bg-blue-500'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                .csv <FiDownload className="text-base" />
              </>
            )}
          </button>
          <h2 className="text-lg font-semibold text-center mb-4">Live Sensor Values</h2>
          <canvas ref={chartRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default LineCharts;
