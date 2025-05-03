import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useMqtt } from '../store/MqttContext';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const LineCharts = () => {
  const { data } = useMqtt();
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

    'factory/gearbox1/input/rpm': 0,
    'factory/gearbox1/out1/rpm': 0,
    'factory/gearbox1/out2/rpm': 0,
    'factory/gearbox1/out3/rpm': 0,
    'factory/gearbox1/out4/rpm': 0,
  });



  // Update latest values whenever data changes
  useEffect(() => {
    const updatedValues = { ...latestValues };

    topics.forEach((topic) => {
      const messages = data[topic] || [];
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        const parsed = parseFloat(latestMessage.value); // Handle the value as a number
        if (!isNaN(parsed)) {
          updatedValues[topic] = parsed; // Update with the latest value for this topic
        }
      }
    });

    setLatestValues(updatedValues); // Update the latest values state
  }, [data]); // 
  // Run this effect when `data` changes

  // Rebuild chart whenever `latestValues` changes
  useEffect(() => {
    buildChart();
  }, [latestValues]);

  const buildChart = () => {
    if (chartInstance.current) chartInstance.current.destroy();

    // const labels = ['publish/1', 'publish/2', 'publish/3', 'publish/4', 'publish/5'];

    const topicToLabelMap = {
      'factory/gearbox1/input/rpm': 'Input RPM',
      'factory/gearbox1/out1/rpm': 'Output 1 RPM',
      'factory/gearbox1/out2/rpm': 'Output 2 RPM',
      'factory/gearbox1/out3/rpm': 'Output 3 RPM',
      'factory/gearbox1/out4/rpm': 'Output 4 RPM',
    };
    
    const labels = Object.values(topicToLabelMap);                                                                                                                                                                                                                
    
    const values = labels.map((label) => latestValues[label]); 
    const colors = ['#3b82f6', '#facc15', '#ef4444', '#10b981', '#8b5cf6'];

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels, 
        datasets: [{
          label: 'Sensor Values',
          data: values, 
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
          fill: false,
          barThickness: 40,      
          maxBarThickness: 45,

        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: true },
        },
        animation: {
          duration: 800,
          easing: 'easeOutBounce',
        },
      },
    });
  };

  const handleCSVDownload = async () => {
    try {
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
    }
  };

  return (
    <div className="flex p-4">
      <div className="flex w-full h-[500px] gap-4">
        <div className="bg-white p-6 shadow rounded relative flex flex-col justify-between w-full">
          <button
            onClick={handleCSVDownload}
            className="absolute top-4 right-4 bg-blue-400 hover:bg-blue-500 text-sm px-3 py-1 rounded flex items-center gap-1 text-white"
          >
            .csv <FiDownload className="text-base" />
          </button>
          <h2 className="text-lg font-semibold text-center mb-4">Live Sensor Values</h2>
          <canvas ref={chartRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default LineCharts;
