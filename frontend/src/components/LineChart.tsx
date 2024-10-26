import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ApiResponse } from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: ApiResponse[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => `Entry ${index + 1}`),
    datasets: [
      {
        label: 'Change in State',
        data: data.map((item) => item.changeInState),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Change in State Over Entries',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Entries',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Change in State',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
