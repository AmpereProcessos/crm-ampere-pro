import { ChevronDown, X } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { cn, useMediaQuery } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type FilterChipMenuProps = {
	label: string;
	icon: ReactNode;
	summary?: ReactNode;
	isActive?: boolean;
	onClear?: () => void;
	disabled?: boolean;
	menuTitle?: string;
	menuDescription?: string;
	triggerClassName?: string;
	contentClassName?: string;
	drawerContentClassName?: string;
	children: ReactNode | ((actions: { closeMenu: () => void }) => ReactNode);
};

export default function FilterChipMenu({
	label,
	icon,
	summary,
	isActive = false,
	onClear,
	disabled = false,
	menuTitle,
	menuDescription,
	triggerClassName,
	contentClassName,
	drawerContentClassName,
	children,
}: FilterChipMenuProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [isOpen, setIsOpen] = useState(false);

	const hasSummary = summary !== undefined && summary !== null;
	const title = menuTitle ?? label;
	const description = menuDescription ?? `Selecione ${label.toLowerCase()}.`;

	const content = typeof children === "function" ? children({ closeMenu: () => setIsOpen(false) }) : children;

	function clearFromTrigger(event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) {
		event.preventDefault();
		event.stopPropagation();
		onClear?.();
	}

	const trigger = (
		<button
			type="button"
			disabled={disabled}
			onClick={() => {
				if (!isDesktop) setIsOpen(true);
			}}
			className={cn(
				"inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-primary/20 bg-background px-3 text-sm text-primary transition-colors hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-50",
				isActive ? "border-primary/40 bg-secondary/70" : "",
				triggerClassName,
			)}
		>
			<div className="flex min-w-0 items-center gap-2">
				<span className="text-primary/70">{icon}</span>
				<span className="truncate font-medium">{label}</span>
				{hasSummary ? <span className="truncate text-primary/80">{summary}</span> : null}
			</div>
			<div className="ml-auto flex items-center gap-1">
				{isActive && onClear ? (
					<span
						role="button"
						tabIndex={0}
						onClick={clearFromTrigger}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								clearFromTrigger(event);
							}
						}}
						className="inline-flex items-center justify-center rounded-sm p-0.5 text-primary/60 hover:bg-primary/10 hover:text-primary"
					>
						<X className="h-3.5 w-3.5" />
					</span>
				) : null}
				<ChevronDown className="h-4 w-4 text-primary/60" />
			</div>
		</button>
	);

	if (isDesktop) {
		return (
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>{trigger}</PopoverTrigger>
				<PopoverContent align="start" className={cn("w-[320px] p-2", contentClassName)}>
					{content}
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<div>{trigger}</div>
			<DrawerContent className={cn("max-h-[85vh]", drawerContentClassName)}>
				<DrawerHeader>
					<DrawerTitle>{title}</DrawerTitle>
					<DrawerDescription>{description}</DrawerDescription>
				</DrawerHeader>
				<div className={cn("flex flex-col gap-2 overflow-y-auto px-4 pb-4", contentClassName)}>{content}</div>
			</DrawerContent>
		</Drawer>
	);
}
