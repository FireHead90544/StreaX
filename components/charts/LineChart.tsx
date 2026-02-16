"use client";

import { useMemo } from "react";

interface LineChartProps {
    data: { label: string; value: number }[];
    height?: number;
    showPoints?: boolean;
    fillArea?: boolean;
}

export function LineChart({ data, height = 200, showPoints = true, fillArea = true }: LineChartProps) {
    const chartData = useMemo(() => {
        if (data.length === 0) return null;

        const maxValue = Math.max(...data.map(d => d.value), 1);
        const minValue = Math.min(...data.map(d => d.value), 0);
        const range = maxValue - minValue || 1;

        const points = data.map((d, i) => ({
            x: (i / (data.length - 1 || 1)) * 100,
            y: 100 - ((d.value - minValue) / range) * 100,
            value: d.value,
            label: d.label,
        }));

        // Create SVG path
        const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');

        // Create area path
        const areaD = `${pathD} L 100 100 L 0 100 Z`;

        return { points, pathD, areaD, maxValue, minValue };
    }, [data]);

    if (!chartData || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No data to display
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height: `${height}px` }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible"
            >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                    <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="0.2"
                        opacity="0.2"
                    />
                ))}

                {/* Area fill */}
                {fillArea && (
                    <path
                        d={chartData.areaD}
                        fill="currentColor"
                        opacity="0.1"
                        className="text-primary"
                    />
                )}

                {/* Line */}
                <path
                    d={chartData.pathD}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="text-primary"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Points */}
                {showPoints &&
                    chartData.points.map((point, i) => (
                        <g key={i}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="2"
                                fill="white"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-primary"
                                vectorEffect="non-scaling-stroke"
                            />
                        </g>
                    ))}
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {data.map((d, i) => (
                    <div key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
                        {d.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
