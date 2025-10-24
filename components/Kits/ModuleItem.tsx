function ModuleItem() {
	return (
		<div key={index} className="flex w-full flex-col rounded-md border border-primary/30 p-2">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex  items-center gap-1">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
						<FaSolarPanel size={25} />
					</div>
					<p className="text-xs font-medium leading-none tracking-tight lg:text-sm">
						<strong className="text-[#FF9B50]">{module.qtde}</strong> x {module.modelo}
					</p>
				</div>
				<button
					onClick={() => removeModuleFromKit(index)}
					type="button"
					className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
				>
					<MdDelete style={{ color: "red" }} size={15} />
				</button>
			</div>
			<div className="mt-1 flex w-full items-center justify-end gap-2 pl-2">
				<div className="flex items-center gap-1">
					<FaIndustry size={12} />
					<p className="text-[0.6rem] font-thin text-primary/70 lg:text-xs">{module.fabricante}</p>
				</div>
				<div className="flex items-center gap-1">
					<ImPower size={12} />
					<p className="text-[0.6rem] font-thin text-primary/70 lg:text-xs">{module.potencia} W</p>
				</div>
				<div className="flex items-center gap-1">
					<AiOutlineSafety size={12} />
					<p className="text-[0.6rem] font-thin text-primary/70 lg:text-xs">{module.garantia} ANOS</p>
				</div>
			</div>
		</div>
	);
}

export default ModuleItem;
