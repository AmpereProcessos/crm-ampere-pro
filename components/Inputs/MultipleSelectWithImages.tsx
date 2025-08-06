import React, { useEffect, useRef, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { cn, useMediaQuery } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { Drawer, DrawerContent } from "../ui/drawer";

type SelectOption<T> = {
	id: string | number;
	value: T;
	label: string;
	url?: string;
};

type MultipleSelectWithImagesProps<T> = {
	width?: string;
	label: string;
	labelClassName?: string;
	holderClassName?: string;
	showLabel?: boolean;
	selected: (string | number)[] | null;
	editable?: boolean;
	resetOptionLabel: string;
	options: SelectOption<T>[] | null;
	handleChange: (value: T[]) => void;
	onReset: () => void;
};

function MultipleSelectWithImages<T>({
	width,
	label,
	labelClassName,
	holderClassName,
	showLabel = true,
	selected,
	editable = true,
	options,
	resetOptionLabel,
	handleChange,
	onReset,
}: MultipleSelectWithImagesProps<T>) {
	function getValueID(selected: (string | number)[] | null) {
		if (options && selected) {
			const filteredOptions = options?.filter((option) => selected.includes(option.value));
			if (filteredOptions) {
				const arrOfIds = filteredOptions.map((option) => option.id);
				return arrOfIds;
			}
			return null;
		}
		return null;
	}

	const ref = useRef<any>(null);
	const [items, setItems] = useState<SelectOption<T>[] | null>(options);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [selectMenuIsOpen, setSelectMenuIsOpen] = useState<boolean>(false);
	const [selectedIds, setSelectedIds] = useState<(string | number)[] | null>(getValueID(selected));
	const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">("down");

	const [searchFilter, setSearchFilter] = useState<string>("");
	const inputIdentifier = label.toLowerCase().replace(" ", "_");

	function handleSelect(id: string | number, item: T) {
		let itemsSelected: SelectOption<T>[] | undefined;
		const ids = selectedIds ? [...selectedIds] : [];
		if (!ids?.includes(id)) {
			ids.push(id);
			itemsSelected = options?.filter((option) => ids?.includes(option.id));
			itemsSelected = itemsSelected?.map((item) => item.value);
		} else {
			const index = ids.indexOf(id);
			ids.splice(index, 1);
			itemsSelected = options?.filter((option) => ids?.includes(option.id));
			itemsSelected = itemsSelected?.map((item) => item.value);
		}
		handleChange(itemsSelected as T[]);
		setSelectedIds(ids);
	}

	function handleFilter(value: string) {
		setSearchFilter(value);
		if (!items || !options) return;
		if (value.trim().length > 0) {
			const filteredItems = options.filter((item) => item.label.toUpperCase().includes(value.toUpperCase()));
			setItems(filteredItems);
			return;
		}
		setItems(options);
		return;
	}

	function resetState() {
		onReset();
		setSelectedIds(null);
		setSelectMenuIsOpen(false);
	}

	function onClickOutside() {
		setSearchFilter("");
		setSelectMenuIsOpen(false);
	}

	function renderSelectedAvatars() {
		if (!selectedIds || !options) return null;

		const selectedOptions = options.filter((item) => selectedIds.includes(item.id));
		const displayCount = Math.min(selectedOptions.length, 3);
		const remainingCount = selectedOptions.length - displayCount;

		return (
			<div className="flex items-center">
				<div className="flex -space-x-1">
					{selectedOptions.slice(0, displayCount).map((item, index) => (
						<div key={item.id} className="flex items-center gap-1 border-2 border-white bg-primary/20 rounded-lg p-0.5 px-1">
							<Avatar key={item.id} className="h-4 w-4 min-w-4 min-h-4">
								<AvatarImage src={item.url} alt={item.label} />
								<AvatarFallback className="text-[0.5rem]">{formatNameAsInitials(item.label)}</AvatarFallback>
							</Avatar>
							<p className="text-[0.5rem] font-medium text-primary">{item.label}</p>
						</div>
					))}
				</div>
				{remainingCount > 0 && (
					<div className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">+{remainingCount}</div>
				)}
			</div>
		);
	}

	useEffect(() => {
		setSelectedIds(getValueID(selected));
		setItems(options);
	}, [options, selected]);

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (ref.current && !ref.current.contains(event.target) && isDesktop) {
				onClickOutside();
			}
		};
		document.addEventListener("click", (e) => handleClickOutside(e), true);
		return () => {
			document.removeEventListener("click", (e) => handleClickOutside(e), true);
		};
	}, [onClickOutside]);

	useEffect(() => {
		if (selectMenuIsOpen && ref.current) {
			const rect = ref.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;

			if (spaceBelow < 250 && spaceAbove > spaceBelow) {
				setDropdownDirection("up");
			} else {
				setDropdownDirection("down");
			}
		}
	}, [selectMenuIsOpen]);

	if (isDesktop)
		return (
			<div ref={ref} className={`relative flex w-full flex-col gap-1 lg:w-[${width ? width : "350px"}]`}>
				{showLabel ? (
					<label htmlFor={inputIdentifier} className={cn("text-start text-sm font-medium tracking-tight text-primary/80", labelClassName)}>
						{label}
					</label>
				) : null}
				<div
					className={cn(
						"flex h-full min-h-[46.6px] w-full items-center justify-between rounded-md border bg-[#fff] p-3 text-sm shadow-sm duration-500 ease-in-out",
						selectMenuIsOpen ? "border-primary" : "border-primary/20",
						holderClassName,
					)}
				>
					{selectMenuIsOpen ? (
						<input
							type="text"
							autoFocus
							value={searchFilter}
							onChange={(e) => handleFilter(e.target.value)}
							placeholder="Filtre o item desejado..."
							className="h-full w-full italic outline-none"
						/>
					) : (
						<div className="flex grow items-center gap-3">
							{selectedIds && selectedIds.length > 0 ? (
								<>
									<button
										type="button"
										onClick={() => {
											if (editable) setSelectMenuIsOpen((prev) => !prev);
										}}
										className="grow cursor-pointer text-primary text-start"
									>
										{renderSelectedAvatars()}
									</button>
								</>
							) : (
								<button
									type="button"
									onClick={() => {
										if (editable) setSelectMenuIsOpen((prev) => !prev);
									}}
									className="grow cursor-pointer text-primary text-start"
								>
									NÃO DEFINIDO
								</button>
							)}
						</div>
					)}
					{selectMenuIsOpen ? (
						<IoMdArrowDropup
							style={{ cursor: "pointer" }}
							onClick={() => {
								if (editable) setSelectMenuIsOpen((prev) => !prev);
							}}
						/>
					) : (
						<IoMdArrowDropdown
							style={{ cursor: "pointer" }}
							onClick={() => {
								if (editable) setSelectMenuIsOpen((prev) => !prev);
							}}
						/>
					)}
				</div>
				{selectMenuIsOpen ? (
					<div
						className={`absolute ${
							dropdownDirection === "down" ? "top-[75px]" : "bottom-[75px]"
						} z-[100] flex h-[250px] max-h-[250px] w-full flex-col gap-1 self-center overflow-y-auto overscroll-y-auto rounded-md border border-primary/20 bg-[#fff] p-2 py-1 shadow-sm scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300`}
					>
						<button
							type="button"
							onClick={() => resetState()}
							className={`flex w-full cursor-pointer items-center rounded p-1 px-2 hover:bg-primary/20 ${!selectedIds ? "bg-primary/20" : ""}`}
						>
							<p className="grow text-sm font-medium text-primary">{resetOptionLabel}</p>
							{!selectedIds ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
						</button>
						<div className="my-2 h-[1px] w-full bg-gray-200" />
						{items ? (
							items.map((item, index) => (
								<button
									type="button"
									onClick={() => handleSelect(item.id, item.value)}
									key={item.id ? item.id : index}
									className={`flex w-full cursor-pointer items-center rounded p-2 px-2 hover:bg-primary/20 ${selectedIds?.includes(item.id) ? "bg-primary/20" : ""}`}
								>
									<Avatar className="h-6 w-6 min-w-6 min-h-6">
										<AvatarImage src={item.url} alt={item.label} />
										<AvatarFallback>{formatNameAsInitials(item.label)}</AvatarFallback>
									</Avatar>
									<p className="grow pl-2 text-start text-sm font-medium text-primary">{item.label}</p>
									{selectedIds?.includes(item.id) ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
								</button>
							))
						) : (
							<p className="w-full text-center text-sm italic text-primary">Sem opções disponíveis.</p>
						)}
					</div>
				) : null}
			</div>
		);

	return (
		<Drawer open={selectMenuIsOpen} onOpenChange={setSelectMenuIsOpen}>
			<div ref={ref} className={`relative flex w-full flex-col gap-1 lg:w-[${width ? width : "350px"}]`}>
				{showLabel ? (
					<label htmlFor={inputIdentifier} className={cn("text-start text-sm font-medium tracking-tight text-primary/80", labelClassName)}>
						{label}
					</label>
				) : null}
				<div
					className={cn(
						"flex h-full min-h-[46.6px] w-full items-center justify-between rounded-md border bg-[#fff] p-3 text-sm shadow-sm duration-500 ease-in-out",
						selectMenuIsOpen ? "border-primary" : "border-primary/20",
						holderClassName,
					)}
				>
					<div className="flex grow items-center gap-3">
						{selectedIds && selectedIds.length > 0 ? (
							<>
								{renderSelectedAvatars()}
								<button
									type="button"
									onClick={() => {
										if (editable) setSelectMenuIsOpen((prev) => !prev);
									}}
									className="grow cursor-pointer text-primary text-start"
								>
									{selectedIds.length > 1 ? "MÚLTIPLAS SELEÇÕES" : options?.find((item) => item.id === selectedIds[0])?.label}
								</button>
							</>
						) : (
							<button
								type="button"
								onClick={() => {
									if (editable) setSelectMenuIsOpen((prev) => !prev);
								}}
								className="grow cursor-pointer text-primary text-start"
							>
								NÃO DEFINIDO
							</button>
						)}
					</div>
					<IoMdArrowDropdown
						style={{ cursor: "pointer" }}
						onClick={() => {
							if (editable) setSelectMenuIsOpen((prev) => !prev);
						}}
					/>
				</div>
				<DrawerContent className="gap-2 p-2">
					<p className="w-full text-center text-xs tracking-tight text-primary/80">
						{selectedIds && selectedIds.length > 0 && options
							? options.filter((item) => selectedIds.includes(item.id)).length > 3
								? "Múltiplas opções selecionadas."
								: `Selecionando: ${options
										.filter((item) => selectedIds.includes(item.id))
										.map((o) => o.label)
										.join(", ")}.`
							: "Nenhuma opção selecionada."}
					</p>
					<input
						type="text"
						autoFocus={true}
						value={searchFilter}
						onChange={(e) => handleFilter(e.target.value)}
						placeholder="Filtre o item desejado..."
						className="w-full bg-transparent p-2 text-sm italic outline-none"
					/>
					<button
						type="button"
						onClick={() => resetState()}
						className={`flex w-full cursor-pointer items-center rounded p-1 px-2 hover:bg-primary/20 ${!selectedIds ? "bg-primary/20" : ""}`}
					>
						<p className="grow text-sm font-medium text-primary">{resetOptionLabel}</p>
						{!selectedIds ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
					</button>
					<div className="my-2 h-[1px] w-full bg-gray-200" />
					<div className="flex h-[200px] min-h-[200px] flex-col gap-2 overflow-y-auto overscroll-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 lg:h-[350px] lg:max-h-[350px]">
						{items ? (
							items.map((item, index) => (
								<button
									type="button"
									onClick={() => handleSelect(item.id, item.value)}
									key={item.id ? item.id : index}
									className={`flex w-full cursor-pointer items-center rounded p-2 px-2 hover:bg-primary/20 ${selectedIds?.includes(item.id) ? "bg-primary/20" : ""}`}
								>
									<Avatar className="h-6 w-6 min-w-6 min-h-6">
										<AvatarImage src={item.url} alt={item.label} />
										<AvatarFallback>{formatNameAsInitials(item.label)}</AvatarFallback>
									</Avatar>
									<p className="grow pl-2 text-start text-sm font-medium text-primary">{item.label}</p>
									{selectedIds?.includes(item.id) ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
								</button>
							))
						) : (
							<p className="w-full text-center text-sm italic text-primary">Sem opções disponíveis.</p>
						)}
					</div>
				</DrawerContent>
			</div>
		</Drawer>
	);
}

export default MultipleSelectWithImages;
