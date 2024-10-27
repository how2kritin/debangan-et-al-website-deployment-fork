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
import { Plot } from '../App';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  dates: string[];
  plots: Plot[];
}

// Utility function to generate unique colors for each plot
const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};


const LineChart: React.FC<LineChartProps> = ({ dates, plots }) => {
  const colors = generateColors(plots.length);

  const chartData = {
    labels: dates,
    datasets: plots.map((plot, index) => ({
      label: plot.category,
      data: plot.items.map((item) => item.score),
      borderColor: colors[index],
      backgroundColor: colors[index],
      tension: 0,
    })),
  };
  // console.log(chartData.datasets[0].data);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const, // Display legend at the top
      },
      title: {
        display: true,
        text: 'Scores for All Categories Over Time',
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
