import React from "react";
type GoalTrackingBarProps = {
	valueGoal?: number;
	valueHit: number;
	goalText: string;
	barHeigth: string;
	barBgColor: string;
};
function GoalTrackingBar({ valueGoal, valueHit, goalText, barHeigth, barBgColor }: GoalTrackingBarProps) {
	function getPercentage({ goal, hit }: { goal: number | undefined; hit: number | undefined }) {
		if (!hit || hit == 0) return "0%";
		if (!goal && hit) return "100%";
		if (goal && !hit) return "0%";
		if (goal && hit) {
			var percentage = ((hit / goal) * 100).toFixed(2);
			return `${percentage}%`;
		}
		// return `${(Math.random() * 100).toFixed(2)}%`
	}
	function getWidth({ goal, hit }: { goal: number | undefined; hit: number | undefined }) {
		if (!hit || hit == 0) return "0%";
		if (!goal && hit) return "100%";
		if (goal && !hit) return "0%";
		if (goal && hit) {
			var percentage: number | string = (hit / goal) * 100;
			percentage = percentage > 100 ? 100 : percentage.toFixed(2);
			return `${percentage}%`;
		}
		// return `${(Math.random() * 100).toFixed(2)}%`
	}

	return (
		<div className="flex w-full items-center gap-1">
			<div className="flex grow gap-2">
				<div className="grow">
					<div
						style={{ width: getWidth({ goal: valueGoal, hit: valueHit }), backgroundColor: barBgColor, height: barHeigth }}
						className="flex items-center justify-center rounded-sm text-xs text-white shadow-md"
					></div>
				</div>
			</div>
			<div className="flex min-w-[70px] flex-col items-end justify-end lg:min-w-[100px]">
				<p className="text-xs font-medium uppercase tracking-tight lg:text-sm">{getPercentage({ goal: valueGoal, hit: valueHit })}</p>
				<p className="text-[0.5rem] italic text-gray-500 lg:text-[0.65rem]">
					<strong>{valueHit?.toLocaleString("pt-br", { maximumFractionDigits: 2 }) || 0}</strong> de{" "}
					<strong>{valueGoal?.toLocaleString("pt-br", { maximumFractionDigits: 2 }) || 0}</strong>{" "}
				</p>
			</div>
		</div>
	);
}

export default GoalTrackingBar;
