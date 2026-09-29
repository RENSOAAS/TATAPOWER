// ----------------------------------------------------------------------------------------------------
// Showing mutiple data
// ----------------------------------------------------------------------------------------------------
import React from "react";
import { Bar } from "react-chartjs-2";

export default function BarGraph(props) {
    const { dataSets, labelForChart } = props;

    const data = {
        labels: labelForChart,
        datasets: dataSets.map((dataSet) => ({
            label: dataSet.label,
            data: dataSet.graphData,
            backgroundColor: dataSet.lineColor
        }))
    }

    const options = {
        maintainAspectRatio: false
    };

    return (
        <div
            className="graph-cell"
            style={{
                position: "relative",
                width: props.width,
                height: props.height,
                marginTop: '1rem',
                color: "White",
                textAlign: "center"
            }}
        >
            <Bar
                data={data}
                options={options}
            />
        </div>
    );
}
// ----------------------------------------------------------------------------------------------------