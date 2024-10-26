import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { ApiResponse } from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title);

interface LineChartProps {
  data: ApiResponse[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Change in State',
        data: data.map((item) => item.changeInState),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0, // Straight lines
      },
    ],
  };

  return <Line data={chartData} />;
};

export default LineChart;
