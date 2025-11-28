import * as React from "react";
import VisuallyHidden from "@/components/VisuallyHidden";
import Card from "@/components/Card";

interface CardOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string,
  value: string,
  variant?: "light" | "dark",
}
function CardOverview({ title, value, variant = "light" }: CardOverviewProps) {
  return (
    <li className="grow">
      <Card className="flex flex-col gap-5" variant={variant}>
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <p className="font-mono text-3xl font-bold">${value}</p>
      </Card>
    </li>
  )
}

function Overview() {
  return (
    <div className="w-full">
      <h2><VisuallyHidden>Overview</VisuallyHidden></h2>
      <ul className="w-full flex flex-col sm:flex-row gap-5">
        <CardOverview title="Current Balance" value="4,836.00" variant="dark"/>
        <CardOverview title="Income" value="3,814.25" />
        <CardOverview title="Expenses" value="1,700.50" />
      </ul>
    </div>
  );
}

export default Overview;
