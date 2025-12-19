"use client";

import { LineChart } from "@/components/ui/line-chart";

interface ChartData {
	date: string;
	Visitors: number;
	Visits: number;
	Pageviews: number;
}

export function VisitsChartClient({
	shortTermData,
	longTermData,
}: {
	shortTermData: ChartData[];
	longTermData: ChartData[];
}) {
	return (
		<div className="space-y-6">
			{/* Short-term: Visits only */}
			<div className="rounded-lg border p-6">
				<h2 className="mb-4 font-semibold text-xl">Recent Activity (30 Days)</h2>
				<div className="h-[250px]">
					<LineChart
						data={shortTermData}
						dataKey="date"
						config={{
							Visits: {
								label: "Visits",
								color: "chart-1",
							},
						}}
					/>
				</div>
			</div>

			{/* Long-term: Visits only */}
			<div className="rounded-lg border p-6">
				<h2 className="mb-4 font-semibold text-xl">6-Month Overview (Weekly)</h2>
				<div className="h-[300px]">
					<LineChart
						data={longTermData}
						dataKey="date"
						config={{
							Visits: {
								label: "Visits",
								color: "chart-1",
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
}
