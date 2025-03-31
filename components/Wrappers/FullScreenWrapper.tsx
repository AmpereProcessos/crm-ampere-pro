import React, { type PropsWithChildren } from "react";
import { Raleway } from "next/font/google";
import { cn } from "@/lib/utils";
const raleway = Raleway({
	variable: "--font-raleway",
	subsets: ["cyrillic", "cyrillic-ext"],
});

function FullScreenWrapper({ children }: PropsWithChildren) {
	return (
		<div
			className={cn(
				"flex min-h-[100vh] w-screen max-w-full flex-col  bg-[#fff] font-Inter xl:min-h-[100vh] antialiased",
				raleway.variable,
			)}
		>
			<div className="flex min-h-[100%] grow ">
				<div className="flex w-full grow flex-col">{children}</div>
			</div>
		</div>
	);
}

export default FullScreenWrapper;
