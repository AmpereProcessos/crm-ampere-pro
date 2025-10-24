function StatListSkeleton() {
	return (
		<>
			{Array.apply(null, Array(11)).map((x, index) => (
				<div key={index} className="mb-2 flex h-[37px] w-full items-center gap-4">
					<div className="h-[22px] w-[145px] animate-pulse bg-primary/30"></div>
					<div className="h-[25px] grow animate-pulse bg-primary/30"></div>
					<div className="flex w-fit flex-col items-end justify-end gap-1 lg:min-w-[100px]">
						<p className="h-[16px] w-[50px] animate-pulse bg-primary/30 text-xs font-medium uppercase tracking-tight lg:text-sm"></p>
						<p className="h-[12px] w-[50px] animate-pulse bg-primary/30 text-[0.4rem]  italic text-primary/70 lg:text-[0.65rem]"></p>
					</div>
				</div>
			))}
		</>
	);
}

export default StatListSkeleton;
