'use client'
import * as React from "react";
import { lerp } from "@/lib/utilities";

import styles from "./PieChart.module.css";

export interface PieItem {
  id: string,
  label: string,
  value: number,
  color: string,
}

interface PieSlice extends PieItem {
  dashSize: number,
  dashOffset: number,
}

interface Props {
  items: PieItem[],
  radius?: number,
  startAngle?: number,
  strokeWidth?: number,
  fillOpacity?: number,
}

// Plan is for circle + dash / consider moving to arc path 

/* 
  Corner case:
    - total of O : render a no data component
    - clamp very small percentages if you don’t want visually invisible slivers
    - manage floating point rounding so the last segment closes nicely
 */

const VIEWBOX_SIZE = 64;
const CENTER = {
  x: VIEWBOX_SIZE / 2,
  y: VIEWBOX_SIZE / 2,
};

function PieChart({
  items = [],
  radius = 28,
  startAngle = 0,
  strokeWidth = 8,
  fillOpacity = 1,
}: Props) {
  const circumference = 2 * Math.PI * radius;
  const total = items.reduce(
    (accumulator, item) => accumulator + item.value,
    0
  );


  const slices = items.reduce<{
    currentOffset: number;
    slices: PieSlice[];
  }>(
    (acc, item, index) => {
      const isLast = index === items.length - 1;

      const dashSize = isLast
        // last stroke fill in remaining part of circle
        ? circumference - acc.currentOffset
        // else compute dash size according to value
        : lerp(item.value, 0, total, 0, circumference);

      const dashOffset = -acc.currentOffset;

      acc.currentOffset += dashSize;

      acc.slices.push({
        id: item.id,
        label: item.label,
        color: item.color,
        dashSize,
        dashOffset,
      } as PieSlice);

      return acc;
    },
    { currentOffset: 0, slices: [] }
  ).slices;

  return (
    <svg
      className={styles.pieChart}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      style={{
        strokeWidth,
        fillOpacity,
      }}
    >
      <g transform={`rotate(${startAngle - 90} ${CENTER.x} ${CENTER.y})`}>
        {slices.map((slice) => {
          return (
            <circle
              key={slice.id}
              cx={CENTER.x}
              cy={CENTER.y}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeDasharray={`${slice.dashSize} ${circumference - slice.dashSize}`}
              strokeDashoffset={slice.dashOffset}
              onMouseEnter={() => console.log("Entering ", slice.label)}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default PieChart;
