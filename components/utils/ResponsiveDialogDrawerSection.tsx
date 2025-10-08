import type { PropsWithChildren, ReactNode } from "react";
import type React from "react";

type ResponsiveDialogDrawerSectionProps = PropsWithChildren & {
	sectionTitleText: string;
	sectionTitleIcon: ReactNode;
};
function ResponsiveDialogDrawerSection({ children, sectionTitleText, sectionTitleIcon }: ResponsiveDialogDrawerSectionProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
				{sectionTitleIcon}
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">{sectionTitleText}</h1>
			</div>
			<div className="w-full flex flex-col gap-3">{children}</div>
		</div>
	);
}

export default ResponsiveDialogDrawerSection;
