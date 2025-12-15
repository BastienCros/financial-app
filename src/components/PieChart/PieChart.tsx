'use client'
import { lerp } from "@/utils";

import styles from "./PieChart.module.css";
import { computeRadialOffsets, sanitizeId } from "./PieChart.helpers";

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

/* 
  TODO Handle PieChart corner case:
    - total of O : render a no data component
    - clamp very small percentages if you don’t want visually invisible slivers
    - manage floating point rounding so the last segment closes nicely
  TODO Pie Chart - SVG render issue on some browsers:
    - Using Gradient + stroke-dasharray seems bugged on some browsers (observed with Chromium-based browsers on mobile)
    - Instead use elliptical arcs
 */

const VIEWBOX_SIZE = 64;
const CENTER = {
  x: VIEWBOX_SIZE / 2,
  y: VIEWBOX_SIZE / 2,
};

function PieChart({
  items = [],
  radius = 24,
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
      <defs>
        {slices.map((slice) => {
          // TODO Remove when using real data instead of mock data
          const sanitizedId = sanitizeId(slice.id);

          const k = 0.4; // 60% dark, 40% light
          const { offsetIn, offsetTransition, R_out } = computeRadialOffsets(radius, strokeWidth, k);


          return (
            <radialGradient
              key={`gradient-${sanitizedId}`}
              id={`gradient-${sanitizedId}`}
              r={R_out}
              cx={CENTER.x}
              cy={CENTER.y}
              gradientUnits="userSpaceOnUse"
            >

              {/* 
                offsetIn : inner edge
                light color
              */}
              <stop
                offset={`${offsetIn * 100}%`}
                stopColor={slice.color}
                stopOpacity="0.75"
              />
              {/* until transition : light color */}
              <stop
                offset={`${offsetTransition * 100}%`}
                stopColor={slice.color}
                stopOpacity="0.75"
              />
              {/* same offset for hard edge transition */}
              <stop
                offset={`${offsetTransition * 100}%`}
                stopColor={slice.color}
                stopOpacity="1"
              />
              {/* outer edge: dark color */}
              <stop
                offset="100%"
                stopColor={slice.color}
                stopOpacity="1"
              />
            </radialGradient>
          );
        })}
      </defs>

      <g transform={`rotate(${startAngle - 90} ${CENTER.x} ${CENTER.y})`}>
        {slices.map((slice) => {
          // TODO Remove when using real data instead of mock data
          const sanitizedId = sanitizeId(slice.id);
          return (
            <circle
              key={sanitizedId}
              cx={CENTER.x}
              cy={CENTER.y}
              r={radius}
              fill="none"
              stroke={`url(#gradient-${sanitizedId})`}
              strokeDasharray={`${slice.dashSize} ${circumference - slice.dashSize}`}
              strokeDashoffset={`${slice.dashOffset}`}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default PieChart;
