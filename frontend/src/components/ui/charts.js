import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
);

export default function Chart(props) {
    const labels = props.data_at;

    const data = {
        labels,
        datasets: [
            {
                lineTension: 0.4,
                label: props.label,
                data: props.d,
                backgroundColor: "rgb(0, 0, 0)",
                borderColor: props.lineColor,
                color: "#ffbb00",
                fill: false,
                borderWidth: 2,
                pointRadius: 0
            }
        ]
    }

    return (
        <div
            className="graph-cell"
            style={{
                position: "relative",
                width: props.width,
                height: props.height,
                color: "White",
                textAlign: "center"
            }}
        >
            <Line
                className="graph"
                data={data}
                options={{
                    layout: {
                        padding: 10,
                    },
                    maintainAspectRatio: false
                }}
            />
        </div>
    )
}