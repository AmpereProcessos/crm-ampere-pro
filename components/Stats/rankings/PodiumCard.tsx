import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";

type RankingItem = {
	index: number;
	name: string;
	avatar: string | undefined;
	value: number;
};
type PodiumCardProps = {
	rankingItem: RankingItem;
	maxValue: number;
	minValue: number;
	position: number;
	size?: "h-24 w-24" | "h-16 w-16" | "h-12 w-12";
	containerClassName?: string;
	nameClassName?: string;
};

export default function PodiumCard({
	rankingItem,
	maxValue,
	minValue,
	position,
	size = "h-16 w-16",
	containerClassName = "",
	nameClassName = "text-primary text-xs font-bold tracking-tight",
}: PodiumCardProps) {
	const percentage =
		((rankingItem.value - minValue) / (maxValue - minValue)) * 100;

	const strokeWidth = size === "h-24 w-24" ? 4 : size === "h-16 w-16" ? 3 : 2;
	const radius = size === "h-24 w-24" ? 44 : size === "h-16 w-16" ? 29 : 21;
	const circumference = 2 * Math.PI * radius;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className={cn("flex flex-col items-center gap-3", containerClassName)}>
			<div className="relative">
				{/* SVG Progress Circle */}
				<svg
					className={`${size} absolute inset-0 z-10 -rotate-90`}
					viewBox={`0 0 ${size === "h-24 w-24" ? 96 : size === "h-16 w-16" ? 64 : 48} ${size === "h-24 w-24" ? 96 : size === "h-16 w-16" ? 64 : 48}`}
				>
					<title>Progress Circle</title>
					{/* Background circle */}
					<circle
						cx={size === "h-24 w-24" ? 48 : size === "h-16 w-16" ? 32 : 24}
						cy={size === "h-24 w-24" ? 48 : size === "h-16 w-16" ? 32 : 24}
						r={radius}
						stroke="hsl(var(--primary))"
						strokeWidth={strokeWidth}
						fill="none"
						opacity="0.3"
					/>
					{/* Progress circle */}
					<circle
						cx={size === "h-24 w-24" ? 48 : size === "h-16 w-16" ? 32 : 24}
						cy={size === "h-24 w-24" ? 48 : size === "h-16 w-16" ? 32 : 24}
						r={radius}
						stroke="hsl(var(--primary))"
						strokeWidth={strokeWidth}
						fill="none"
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						className="transition-all duration-500 ease-out"
					/>
				</svg>
				{/* Avatar */}
				<div className={cn("relative overflow-hidden rounded-full", size)}>
					<Avatar className="h-full w-full">
						<AvatarImage src={rankingItem.avatar} alt={rankingItem.name} />
						<AvatarFallback className="text-lg font-semibold">
							{rankingItem.name ? formatNameAsInitials(rankingItem.name) : "NA"}
						</AvatarFallback>
					</Avatar>
				</div>

				{/* Position badge */}
				<div
					className={cn(
						"h-6 w-6 text-sm bg-primary text-primary-foreground absolute -top-1 -right-1 flex items-center justify-center rounded-full font-bold shadow-md z-10",
					)}
				>
					{position}
				</div>
			</div>

			<h3 className={cn(nameClassName, "text-center")}>{rankingItem.name}</h3>
		</div>
	);
}
