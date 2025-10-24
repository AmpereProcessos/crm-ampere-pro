import { cn, useMediaQuery } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { VariableSizeList } from "react-window";
import { Drawer, DrawerContent } from "../ui/drawer";

type SelectOption<T> = {
	id: string | number;
	value: any;
	label: string;
};
type SelectInputProps<T> = {
	width?: string;
	label: string;
	labelClassName?: string;
	holderClassName?: string;
	showLabel?: boolean;
	selected: (string | number)[] | null;
	resetOptionLabel: string;
	options: SelectOption<T>[] | null;
	handleChange: (value: T[]) => void;
	onReset: () => void;
};

function MultipleSelectInputVirtualized<T>({
	width,
	label,
	labelClassName,
	holderClassName,
	showLabel = true,
	selected,
	options,
	resetOptionLabel,
	handleChange,
	onReset,
}: SelectInputProps<T>) {
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

	const [searchFilter, setSearchFilter] = useState<string>("");
	const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">("down");

	const inputIdentifier = label.toLowerCase().replace(" ", "_");
	function handleSelect(id: string | number, item: T) {
		let itemsSelected: T[] = [];
		const ids = selectedIds ? [...selectedIds] : [];
		if (!ids?.includes(id)) {
			ids.push(id);
			itemsSelected = options?.filter((option) => ids?.includes(option.id)).map((item) => item.value) || [];
		} else {
			const index = ids.indexOf(id);
			ids.splice(index, 1);
			itemsSelected = options?.filter((option) => ids?.includes(option.id)).map((item) => item.value) || [];
		}
		handleChange(itemsSelected as T[]);
		setSelectedIds(ids);
	}
	function handleFilter(value: string) {
		setSearchFilter(value);
		if (!items) return;
		if (value.trim().length > 0 && options) {
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

	const List = ({ height, width, list }: { height: number | string; width: number | string; list: SelectOption<T>[] }) => (
		<VariableSizeList
			height={height}
			width={width}
			itemCount={list ? list.length : 0}
			itemSize={(index) => 30} // Adjust the item height as needed
		>
			{({ index, style }) => (
				<button
					type="button"
					style={style}
					onClick={() => handleSelect(list[index] ? list[index].id : 0, list[index]?.value)}
					className={`flex w-full cursor-pointer items-center rounded-sm p-1 px-2 hover:bg-primary/20 ${selectedIds?.includes(list[index] ? list[index].id : 0) ? "bg-primary/20" : ""}`}
				>
					<p className="grow text-start text-sm font-medium text-primary">{list[index]?.label}</p>
					{selectedIds?.includes(list[index] ? list[index].id : 0) ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
				</button>
			)}
		</VariableSizeList>
	);

	useEffect(() => {
		// setSelectedIds(getValueID(selected));
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
						"flex h-full min-h-[46.6px] w-full items-center justify-between rounded-md border bg-background p-3 text-sm shadow-md duration-500 ease-in-out",
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
							className="h-full w-full text-sm italic outline-hidden"
						/>
					) : (
						<button type="button" onClick={() => setSelectMenuIsOpen((prev) => !prev)} className="grow text-start cursor-pointer text-primary">
							{selectedIds && selectedIds.length > 0 && options
								? options.filter((item) => selectedIds.includes(item.id)).length > 1
									? "MÚLTIPLAS SELEÇÕES"
									: options.filter((item) => selectedIds.includes(item.id))[0]?.label
								: "NÃO DEFINIDO"}
						</button>
					)}
					{selectMenuIsOpen ? (
						<IoMdArrowDropup style={{ cursor: "pointer" }} onClick={() => setSelectMenuIsOpen((prev) => !prev)} />
					) : (
						<IoMdArrowDropdown style={{ cursor: "pointer" }} onClick={() => setSelectMenuIsOpen((prev) => !prev)} />
					)}
				</div>
				{selectMenuIsOpen ? (
					<div
						className={`absolute ${
							dropdownDirection === "down" ? "top-[75px]" : "bottom-[75px]"
						} z-100 flex h-[250px] max-h-[250px] w-full flex-col self-center overflow-y-auto overscroll-y-auto rounded-md border border-primary/20 bg-background p-2 py-1 shadow-md scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30`}
					>
						<button
							type="button"
							onClick={() => resetState()}
							className={`flex w-full cursor-pointer items-center rounded-sm p-1 px-2 hover:bg-primary/20 ${!selectedIds ? "bg-primary/20" : ""}`}
						>
							<p className="grow font-medium text-primary">{resetOptionLabel}</p>
							{!selectedIds ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
						</button>
						<div className="my-2 h-px w-full bg-primary/30" />
						<div className="flex w-full flex-col gap-y-1">
							{items ? (
								<List height={180} width={"100%"} list={items} />
							) : (
								<p className="w-full text-center text-sm italic text-primary">Sem opções disponíveis.</p>
							)}
						</div>
					</div>
				) : (
					false
				)}
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
						"flex h-full min-h-[46.6px] w-full items-center justify-between rounded-md border bg-background p-3 text-sm shadow-md duration-500 ease-in-out",
						selectMenuIsOpen ? "border-primary" : "border-primary/20",
						holderClassName,
					)}
				>
					<button type="button" onClick={() => setSelectMenuIsOpen((prev) => !prev)} className="grow text-start cursor-pointer text-primary">
						{selectedIds && selectedIds.length > 0 && options
							? options.filter((item) => selectedIds.includes(item.id)).length > 1
								? "MÚLTIPLAS SELEÇÕES"
								: options.filter((item) => selectedIds.includes(item.id))[0]?.label
							: "NÃO DEFINIDO"}
					</button>
					<IoMdArrowDropdown style={{ cursor: "pointer" }} onClick={() => setSelectMenuIsOpen((prev) => !prev)} />
				</div>
				<DrawerContent className="gap-2 p-2">
					<p className="w-full text-center text-xs tracking-tight text-primary/80">
						{selectedIds && selectedIds.length > 0 && options
							? options.filter((item) => selectedIds.includes(item.id)).length > 3
								? "Múltiplas opções selecionadas."
								: `Selecionando: ${options
										.filter((item) => selectedIds.includes(item.id))
										.map((o) => o.label)
										.join(",")}.`
							: "Nenhuma opção selecionada."}
					</p>
					<input
						type="text"
						autoFocus={true}
						value={searchFilter}
						onChange={(e) => handleFilter(e.target.value)}
						placeholder="Filtre o item desejado..."
						className="w-full bg-transparent p-2 text-sm italic outline-hidden"
					/>

					<button
						type="button"
						onClick={() => resetState()}
						className={`flex w-full cursor-pointer items-center rounded-sm p-1 px-2 hover:bg-primary/20 ${!selectedIds ? "bg-primary/20" : ""}`}
					>
						<p className="grow font-medium text-primary">{resetOptionLabel}</p>
						{!selectedIds ? <HiCheck style={{ color: "#fead61", fontSize: "20px" }} /> : null}
					</button>
					<div className="my-2 h-px w-full bg-primary/30" />
					<div className="flex h-[200px] min-h-[200px] flex-col gap-2 overflow-y-auto overscroll-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30 lg:h-[350px] lg:max-h-[350px]">
						{items ? (
							<List height={180} width={"100%"} list={items} />
						) : (
							<p className="w-full text-center text-sm italic text-primary">Sem opções disponíveis.</p>
						)}
					</div>
				</DrawerContent>
			</div>
		</Drawer>
	);
}

export default MultipleSelectInputVirtualized;
