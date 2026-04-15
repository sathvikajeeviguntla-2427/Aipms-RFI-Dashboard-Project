import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const BarChart = ({ labels, dataValues, title }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: dataValues,
      }
    ]
  };

  return <Bar data={data} />;
};

export default BarChart;