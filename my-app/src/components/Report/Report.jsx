import React from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import Companies from "../../data/Companies.json";
import Months_Male from "../../data/Months_Male.json";
import Months_Female from "../../data/Months_Female.json";
import Provinces from "../../data/Provinces.json";

// Set global chart defaults (optional)
defaults.maintainAspectRatio = true;
defaults.responsive = true;

// Common color palette for charts
const chartColors = [
  "rgba(38, 63, 253, 0.5)",
  "rgba(204, 251, 95, 0.5)",
  "rgba(234, 34, 197, 0.5)",
  "rgba(4, 18, 10, 0.5)",
  "rgba(234, 34, 34, 0.5)",
  "rgba(221, 34, 234, 0.5)",
  "rgba(34, 234, 231, 0.5)",
  "rgba(207, 234, 34, 0.5)",
  "rgba(111, 34, 234, 0.5)",
];

const chartBorderColor = "rgba(8, 8, 8, 0.5)";
const hoverColor = "rgba(18, 33, 198, 0.97)";

// Common title options for charts
const chartTitleOptions = {
  display: true,
  color: "black",
  align: "start",
  font: {
    size: 28,
    weight: "bold",
  },
};

const Report = () => {
  return (
    <div className="report">
      {/* Companies Chart */}
      <div className="Companies">
        <Bar
          data={{
            labels: Companies.map((data) => data.label),
            datasets: [
              {
                label: "Manufacturing Companies",
                data: Companies.map((data) => data.value),
                backgroundColor: chartColors,
                borderColor: chartBorderColor,
                borderWidth: 1,
                hoverBackgroundColor: hoverColor,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                ...chartTitleOptions,
                text: "PET bottles collected from each registered Company",
              },
              legend: {
                display: true,
                position: "top",
              },
            },
          }}
        />
      </div>

      {/* Monthly Collection (Male & Female) Chart */}
      <div className="Months">
        <Bar
          data={{
            labels: Months_Male.map((data) => data.label),
            datasets: [
              {
                label: "Monthly Collection from Males",
                data: Months_Male.map((data) => data.value),
                backgroundColor: "rgba(38, 63, 253, 0.63)",
                borderColor: chartBorderColor,
                borderWidth: 1,
                hoverBackgroundColor: hoverColor,
                barThickness: 20, // Set bar thickness for better clarity
              },
              {
                label: "Monthly Collection from Females",
                data: Months_Female.map((data) => data.value),
                backgroundColor: "rgba(221, 25, 166, 0.62)",
                borderColor: chartBorderColor,
                borderWidth: 1,
                hoverBackgroundColor: "rgb(210, 17, 155)",
                barThickness: 20, // Set bar thickness for better clarity
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                ...chartTitleOptions,
                text: "PET bottles collected from each Province in a month",
              },
              legend: {
                display: true,
                position: "top",
              },
            },
            responsive: true,
            scales: {
              x: {
                barPercentage: 0.5, // Makes the bars smaller so that they are side by side
              },
            },
          }}
        />
      </div>

      {/*Monthly collection from Provinces */}

      <div className="Provinces">
        <Bar
          data={{
            labels: Provinces.map((data) => data.label),
            datasets: [
              {
                label: "Province",
                data: Provinces.map((data) => data.value),
                backgroundColor:chartColors,
                borderColor: chartBorderColor,
                borderWidth: 1,
                hoverBackgroundColor: hoverColor,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                ...chartTitleOptions,
                text: "PET bottles collected from each Province",
              },
              legend: {
                display: true,
                position: "top",
              },
            },
          }}
        />
      </div>




    </div>
  );
};

export default Report;
