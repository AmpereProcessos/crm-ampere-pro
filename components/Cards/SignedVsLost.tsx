import { ResponsiveContainer, CartesianGrid, BarChart, XAxis, YAxis, Legend, Tooltip, Bar, AreaChart, Area } from "recharts";
import React from "react";
import { useStats } from "@/utils/queries/stats";
type SignedVsLostProps = {
	data: any;
};
function SignedVsLost({ data }: SignedVsLostProps) {
	return (
		<div className="rounded- flex w-full flex-col bg-[#fff] p-2 shadow-lg">
			<div className="flex w-full flex-col border-b border-gray-300 pb-1">
				<h1 className="w-full text-center text-sm text-gray-500">PROJETOS</h1>
				<h1 className="w-full text-center text-xs text-gray-500">
					<strong className="text-[#15599a]">CRIADOS</strong>x<strong className="text-green-500">GANHOS</strong>x<strong className="text-red-500">PERDIDOS</strong>
				</h1>
			</div>
			<div className="flex w-full grow items-center justify-center text-red-500">
				<AreaChart
					width={1000}
					height={400}
					data={data}
					margin={{
						top: 10,
						right: 30,
						left: 0,
						bottom: 0,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Area type="monotone" dataKey="PROJETOS CRIADOS" stroke="#15599a" fill="#15599a" />
					<Area type="monotone" dataKey="CONTRATOS ASSINADOS" stroke="rgb(34,197,94)" fill="rgb(34,197,94)" />
					<Area type="monotone" dataKey="PROJETOS PERDIDOS" stroke="rgb(239,68,68)" fill="rgb(239,68,68)" />
				</AreaChart>
			</div>
		</div>
	);
}

export default SignedVsLost;
