import { AnimatedSpinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useSDRRanking, useSellersRanking } from "@/utils/queries/stats";
import { useEffect, useState } from "react";
import NonPodiumCard from "./NonPodiumCard";
import PodiumCard from "./PodiumCard";

export default function Rankings() {
	const [ranking, setRanking] = useState<"sellers" | "sdrs">("sellers");

	useEffect(() => {
		const intervalId = setInterval(() => {
			setRanking((prev) => (prev === "sellers" ? "sdrs" : "sellers"));
		}, 5000);
		return () => clearInterval(intervalId);
	}, []);

	return (
		<div className="bg-card border-primary/20 flex w-full flex-col gap-3 rounded-xl border px-3 py-4 shadow-xs h-full">
			<div className="flex items-center justify-start gap-2">
				<Button
					variant={ranking === "sellers" ? "default" : "ghost"}
					size="fit"
					className="rounded-lg px-2 py-1 text-xs"
					onClick={() => setRanking("sellers")}
				>
					RANKING DE VENDEDORES
				</Button>
				<Button
					variant={ranking === "sdrs" ? "default" : "ghost"}
					size="fit"
					className="rounded-lg px-2 py-1 text-xs"
					onClick={() => setRanking("sdrs")}
				>
					RANKING DE SDRS
				</Button>
			</div>
			{ranking === "sellers" ? <SellerRanking /> : <SdrsRanking />}
		</div>
	);
}
export function SellerRanking() {
	const { data, isLoading, isError, isSuccess } = useSellersRanking({});

	const sellersRanking = data ?? [];
	const rankingMaxValue = Math.max(...sellersRanking.map((item) => item.value));
	const rankingMinValue = Math.min(...sellersRanking.map((item) => item.value));

	const first = sellersRanking[0] || null;
	const second = sellersRanking[1] || null;
	const third = sellersRanking[2] || null;
	const others = sellersRanking.slice(3);

	if (isLoading) {
		return (
			<div className="w-full grow flex items-center justify-center gap-2">
				<AnimatedSpinner className="h-4 w-4" />
				<span className="text-primary text-xs font-bold animate-pulse">
					Carregando...
				</span>
			</div>
		);
	}
	if (isError) {
		return (
			<div className="w-full grow flex items-center justify-center">
				<span className="text-primary text-xs font-bold">
					Erro ao carregar o ranking
				</span>
			</div>
		);
	}
	return (
		<div className="flex w-full items-center flex-col gap-6">
			<div className="flex w-full items-end justify-center gap-8">
				{/* 2nd Place */}
				{second && (
					<PodiumCard
						rankingItem={second}
						maxValue={rankingMaxValue}
						minValue={rankingMinValue}
						position={2}
						size="h-12 w-12"
						containerClassName="w-1/3"
						nameClassName="hidden lg:block text-[0.7rem] font-bold"
					/>
				)}

				{/* 1st Place */}
				{first && (
					<PodiumCard
						rankingItem={first}
						maxValue={rankingMaxValue}
						minValue={rankingMinValue}
						position={1}
						size="h-16 w-16"
						containerClassName="w-1/3"
						nameClassName="hidden lg:block text-[0.7rem] font-bold"
					/>
				)}

				{/* 3rd Place */}
				{third && (
					<PodiumCard
						rankingItem={third}
						maxValue={rankingMaxValue}
						minValue={rankingMinValue}
						position={3}
						size="h-12 w-12"
						containerClassName="w-1/3"
						nameClassName="hidden lg:block text-[0.7rem] font-bold"
					/>
				)}
			</div>
			<div className="flex w-full flex-col gap-1">
				<h2 className="text-primary text-[0.65rem] font-bold uppercase lg:text-xs">
					OUTROS
				</h2>
				<div className="overscroll-y scrollbar-thin scrollbar-track-primary/20 scrollbar-thumb-primary/20 flex h-[200px] w-full flex-col gap-2 overflow-y-auto lg:h-[250px]">
					{others.map((item, index) => (
						<NonPodiumCard
							key={`${item.name}-${index}`}
							rankingItem={item}
							rankingMinValue={rankingMinValue}
							rankingMaxValue={rankingMaxValue}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
export function SdrsRanking() {
	const { data, isLoading, isError, isSuccess } = useSDRRanking({});

	const sdrsRanking = data ?? [];
	const rankingMaxValue = Math.max(...sdrsRanking.map((item) => item.value));
	const rankingMinValue = Math.min(...sdrsRanking.map((item) => item.value));

	const first = sdrsRanking[0] || null;
	const second = sdrsRanking[1] || null;
	const third = sdrsRanking[2] || null;
	const others = sdrsRanking.slice(3);

	if (isLoading) {
		return (
			<div className="w-full grow flex items-center justify-center gap-2">
				<AnimatedSpinner className="h-4 w-4" />
				<span className="text-primary text-xs font-bold animate-pulse">
					Carregando...
				</span>
			</div>
		);
	}
	if (isError) {
		return (
			<div className="w-full grow flex items-center justify-center">
				<span className="text-primary text-xs font-bold">
					Erro ao carregar o ranking
				</span>
			</div>
		);
	}
	return (
		<div className="flex w-full items-center flex-col gap-6">
			<div className="flex w-full items-end justify-center gap-8">
				{/* 2nd Place */}
				{second && (
					<PodiumCard
						rankingItem={second}
						maxValue={rankingMaxValue}
						minValue={rankingMinValue}
						position={2}
						size="h-12 w-12"
						containerClassName="w-1/3"
						nameClassName="hidden lg:block text-[0.7rem] font-bold"
					/>
				)}

				{/* 1st Place */}
				{first && (
					<PodiumCard
						rankingItem={first}
						maxValue={rankingMaxValue}
						minValue={rankingMinValue}
						position={1}
						size="h-16 w-16"
						containerClassName="w-1/3"
						nameClassName="hidden lg:block text-[0.7rem] font-bold"
					/>
				)}

				{/* 3rd Place */}
				{third && (
					<PodiumCard
						rankingItem={third}
						maxValue={rankingMaxValue}
						minValue={rankingMinValue}
						position={3}
						size="h-12 w-12"
						containerClassName="w-1/3"
						nameClassName="hidden lg:block text-[0.7rem] font-bold"
					/>
				)}
			</div>
			<div className="flex w-full flex-col gap-1">
				<h2 className="text-primary text-[0.65rem] font-bold uppercase lg:text-xs">
					OUTROS
				</h2>
				<div className="overscroll-y scrollbar-thin scrollbar-track-primary/20 scrollbar-thumb-primary/20 flex h-[200px] w-full flex-col gap-2 overflow-y-auto lg:h-[250px]">
					{others.map((item, index) => (
						<NonPodiumCard
							key={`${item.name}-${index}`}
							rankingItem={item}
							rankingMinValue={rankingMinValue}
							rankingMaxValue={rankingMaxValue}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
