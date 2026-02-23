import { useCallback, useRef, useState } from "react";
import type { TGetExportOpportunitiesInput } from "@/app/api/opportunities/export/route";
import { getExcelFromJSON } from "@/lib/methods/excel-utils";
import { getErrorMessage } from "@/lib/methods/errors";
import { fetchOpportunitiesExportsAll } from "@/utils/queries/opportunities";

type TExportInputState = {
	responsibles: string[];
	funnelsIds: string[];
	periodAfter: string | null;
	periodBefore: string | null;
	periodField: TGetExportOpportunitiesInput["periodField"] | null;
	status: NonNullable<TGetExportOpportunitiesInput["status"]>;
	pageSize: number;
	fileName: string;
};

type TExportProgressState = {
	opportunitiesFound: number;
	opportunitiesProcessed: number;
	pagesFound: number;
	pagesProcessed: number;
	lastProcessedPage: number | null;
};

type TUseOpportunitiesExportStateHookParams = {
	initialInput: TExportInputState;
};

const INITIAL_PROGRESS: TExportProgressState = {
	opportunitiesFound: 0,
	opportunitiesProcessed: 0,
	pagesFound: 0,
	pagesProcessed: 0,
	lastProcessedPage: null,
};

export default function useOpportunitiesExportStateHook({ initialInput }: TUseOpportunitiesExportStateHookParams) {
	const [input, setInput] = useState<TExportInputState>(initialInput);
	const [progress, setProgress] = useState<TExportProgressState>(INITIAL_PROGRESS);
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const updateInput = useCallback((changes: Partial<TExportInputState>) => {
		setInput((prev) => ({ ...prev, ...changes }));
	}, []);

	const resetProgress = useCallback(() => {
		setProgress(INITIAL_PROGRESS);
		setError(null);
	}, []);

	const cancelExport = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsRunning(false);
		setError("Exportação cancelada.");
	}, []);

	const startExport = useCallback(async () => {
		if (isRunning) return false;
		setIsRunning(true);
		setError(null);
		setProgress(INITIAL_PROGRESS);

		const controller = new AbortController();
		abortControllerRef.current = controller;

		try {
			const exportedData = await fetchOpportunitiesExportsAll({
				pageSize: input.pageSize,
				funnelsIds: input.funnelsIds,
				responsibles: input.responsibles,
				periodAfter: input.periodAfter ?? undefined,
				periodBefore: input.periodBefore ?? undefined,
				periodField: input.periodField ?? undefined,
				status: input.status,
				signal: controller.signal,
				callbacks: {
					onInit: ({ totalPages, totalItems }) => {
						setProgress((prev) => ({
							...prev,
							opportunitiesFound: totalItems,
							pagesFound: totalPages,
						}));
					},
					onPageDone: ({ page, pagesProcessed, totalPages, opportunitiesProcessed, totalItems }) => {
						setProgress((prev) => ({
							...prev,
							lastProcessedPage: page,
							pagesProcessed,
							pagesFound: totalPages,
							opportunitiesProcessed,
							opportunitiesFound: totalItems,
						}));
					},
				},
			});

			getExcelFromJSON(exportedData, input.fileName);
			setIsRunning(false);
			abortControllerRef.current = null;
			return true;
		} catch (requestError) {
			setIsRunning(false);
			abortControllerRef.current = null;
			setError(getErrorMessage(requestError));
			return false;
		}
	}, [input, isRunning]);

	return {
		input,
		progress,
		isRunning,
		error,
		updateInput,
		startExport,
		cancelExport,
		resetProgress,
	};
}

export type TUseOpportunitiesExportStateHook = ReturnType<typeof useOpportunitiesExportStateHook>;
