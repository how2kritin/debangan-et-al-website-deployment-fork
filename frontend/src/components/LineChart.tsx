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
import { Plot } from '../App';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: ApiResponse[];
  dates: string[];
  plots: Plot[];
}

const LineChart: React.FC<LineChartProps> = ({ data, dates, plots }) => {
  const chartData = {
    labels: dates,
    datasets: plots.map((plot) => {
      return {
        label: plot.category,
        data: plot.items.map((item) => item.score),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0,
      }
    }),
    // datasets: [
    //   {
    //     label: 'Category Scores',
    //     data: data.map((item) => item.changeInState),
    //     borderColor: 'rgb(75, 192, 192)',
    //     tension: 0,
    //   },
    // ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Scores for all Categories Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dates',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Category Scores',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;