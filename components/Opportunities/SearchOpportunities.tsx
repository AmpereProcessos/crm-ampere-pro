import React, { useState } from "react";

import { AiOutlineSearch } from "react-icons/ai";
import LoadingComponent from "../utils/LoadingComponent";
import Link from "next/link";
import { TOpportunitiesByFastSearchParams, useOpportunitiesBySearch } from "@/utils/queries/opportunities";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import TextInput from "../Inputs/TextInput";
import ErrorComponent from "../utils/ErrorComponent";
import { TOpportunityDTO, TOpportunitySimplifiedDTO } from "@/utils/schemas/opportunity.schema";
import { Trophy } from "lucide-react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { getErrorMessage } from "@/lib/methods/errors";
import GeneralQueryPaginationMenu from "../utils/GeneralQueryPaginationMenu";
import { useDebounceMemo } from "@/lib/hooks";
import { MdDashboard } from "react-icons/md";
import Avatar from "../utils/Avatar";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { FaPhone, FaUser } from "react-icons/fa";
import { useDebounce } from "usehooks-ts";

function SearchOpportunities() {
	const [searchMenuIsOpen, setSearchMenuIsOpen] = useState<boolean>(false);

	return (
		<div className="relative flex items-center justify-center">
			<button
				onClick={() => setSearchMenuIsOpen((prev) => !prev)}
				className={`h-[46.6px] w-fit rounded-md border border-[#fead61] p-2 px-3 ${searchMenuIsOpen ? "bg-[#fead61]" : "bg-transparent text-[#fead41]"} bg-[#fead61]`}
			>
				<AiOutlineSearch />
			</button>
			{searchMenuIsOpen ? <FilterMenu closeMenu={() => setSearchMenuIsOpen(false)} /> : null}
		</div>
	);
}

export default SearchOpportunities;

type FilterMenuProps = {
	closeMenu: () => void;
};
function FilterMenu({ closeMenu }: FilterMenuProps) {
	const [queryParams, setSearchParams] = useState<TOpportunitiesByFastSearchParams>({ searchParam: "", page: 1 });
	const debouncedSearchParam = useDebounce(queryParams.searchParam, 1000);
	const finalQueryParams = {
		searchParam: debouncedSearchParam,
		page: queryParams.page,
	};
	const { data: opportunitiesResult, isLoading, isError, isSuccess, isFetching, error } = useOpportunitiesBySearch(finalQueryParams);

	const opportunities = opportunitiesResult?.opportunities;
	const opportunitiesShowing = opportunities?.length || 0;
	const opportunitiesMatched = opportunitiesResult?.opportunitiesMatched || 0;
	const totalPages = opportunitiesResult?.totalPages || 0;
	return (
		<Sheet open onOpenChange={closeMenu}>
			<SheetContent className="sm:max-w-1/2 w-full lg:w-1/2">
				<div className="flex h-full w-full flex-col">
					<SheetHeader>
						<SheetTitle>FILTRAR OPORTUNIDADES</SheetTitle>
						<SheetDescription>Escolha aqui parâmetros para filtrar as oportunidades.</SheetDescription>
					</SheetHeader>
					<TextInput
						label="NOME DO TITULAR"
						showLabel={false}
						value={queryParams.searchParam}
						placeholder={"Preenha aqui o nome do titular para filtro."}
						handleChange={(value) => setSearchParams((prev) => ({ ...prev, searchParam: value }))}
						width={"100%"}
					/>
					<GeneralQueryPaginationMenu
						activePage={queryParams.page}
						selectPage={(page) => setSearchParams((prev) => ({ ...prev, page }))}
						totalPages={totalPages}
						itemsMatched={opportunitiesMatched}
						itemsShowing={opportunitiesShowing}
						queryLoading={isFetching}
					/>
					<div className="flex h-full flex-col gap-y-4 overflow-y-auto overscroll-y-auto p-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						{isLoading ? <LoadingComponent /> : null}
						{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
						{isSuccess && opportunities ? opportunities.map((opportunity) => <OpportunityCard key={opportunity._id} opportunity={opportunity} />) : null}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function OpportunityCard({ opportunity }: { opportunity: TOpportunitySimplifiedDTO }) {
	function getOpportunityStatusTag(opportunity: TOpportunitySimplifiedDTO) {
		if (!!opportunity.ganho?.data)
			return (
				<div className="flex min-w-fit items-center gap-1 rounded-lg bg-green-600 px-2 py-0.5 text-white">
					<Trophy size={10} />
					<h1 className="text-[0.5rem]">GANHA</h1>
				</div>
			);
		if (!!opportunity.perda?.data)
			return (
				<div className="flex min-w-fit items-center gap-1 rounded-lg bg-red-600 px-2 py-0.5 text-white">
					<Trophy size={10} />
					<h1 className="text-[0.5rem]">PERDIDA</h1>
				</div>
			);
		return (
			<div className="flex min-w-fit items-center gap-1 rounded-lg bg-blue-600 px-2 py-0.5 text-white">
				<Trophy size={10} />
				<h1 className="text-[0.5rem]">EM ANDAMENTO</h1>
			</div>
		);
	}
	return (
		<div key={opportunity._id} className="flex w-full flex-col gap-1 rounded border border-primary bg-[#fff] p-2 shadow-md">
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-sm font-bold leading-none tracking-tight text-[#fead41]">{opportunity.identificador}</p>
					<p className="text-sm font-bold leading-none tracking-tight">{opportunity.nome}</p>
					{opportunity.idMarketing ? (
						<div className="flex min-w-fit items-center gap-1 rounded-lg bg-[#3e53b2] px-2 py-0.5 text-white">
							<BsFillMegaphoneFill size={10} />
							<h1 className="text-[0.5rem]">INBOUND</h1>
						</div>
					) : null}
					{getOpportunityStatusTag(opportunity)}
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex w-full flex-wrap items-center justify-center gap-2 lg:grow lg:justify-start">
					<div className="flex items-center gap-1">
						<MdDashboard size={12} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">{opportunity.tipo.titulo}</h1>
					</div>
					<div className="flex items-center gap-1">
						<FaPhone size={12} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">{opportunity.cliente?.telefonePrimario}</h1>
					</div>
					<div className="flex items-center gap-1">
						<FaUser size={12} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">RESPONSÁVEIS</h1>
						<div className="flex -space-x-1 overflow-hidden">
							{opportunity.responsaveis.map((responsible) => (
								<Avatar key={responsible.id} url={responsible.avatar_url || undefined} width={20} height={20} fallback={formatNameAsInitials(responsible.nome)} />
							))}
						</div>
					</div>
				</div>
				<div className="flex w-full flex-wrap items-center justify-center gap-2 lg:min-w-fit lg:justify-end">
					<Link href={`/comercial/oportunidades/id/${opportunity._id}`}>
						<p className="rounded-lg bg-black px-2 py-1 text-[0.55rem] tracking-tight text-white duration-300 ease-in-out hover:bg-gray-800">VER OPORTUNIDADE</p>
					</Link>
				</div>
			</div>
		</div>
	);
}
