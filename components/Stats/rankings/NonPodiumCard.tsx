import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatNameAsInitials } from "@/lib/methods/formatting";

type RankingItem = {
	index: number;
	name: string;
	avatar: string | undefined;
	value: number;
};
export default function NonPodiumCard({
	rankingItem,
	rankingMinValue,
	rankingMaxValue,
}: {
	rankingItem: RankingItem;
	rankingMinValue: number;
	rankingMaxValue: number;
}) {
	const percentage =
		((rankingItem.value - rankingMinValue) /
			(rankingMaxValue - rankingMinValue)) *
		100;
	return (
		<div className="flex w-full items-center gap-3 rounded p-2">
			<div className="bg-primary/30 flex h-6 w-6 min-w-fit items-center justify-center rounded-full">
				<p className="text-xs font-semibold">{rankingItem.index}</p>
			</div>
			<div className="flex h-full grow flex-col justify-between gap-2">
				<h1 className="text-primary text-[0.65rem] tracking-tight lg:text-xs">
					{rankingItem.name}
				</h1>
				<Progress value={percentage} className="h-1" />
			</div>

			<div className="flex items-center justify-center">
				<Avatar className="h-8 min-h-8 w-8 min-w-8">
					<AvatarImage src={rankingItem.avatar} alt={rankingItem.name} />
					<AvatarFallback className="text-[0.65rem] font-semibold lg:text-sm">
						{rankingItem.name ? formatNameAsInitials(rankingItem.name) : "NA"}
					</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
}
