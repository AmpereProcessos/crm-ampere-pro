import { useAcquisitionChannels, useCreditors } from "@/utils/queries/utils";
import React, { useState } from "react";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import CreditorUtil from "../Cards/CreditorUtil";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { createUtil } from "@/utils/mutations/utils";
import type { Session } from "next-auth";
import type { TAcquisitionChannel, TAcquisitionChannelDTO, TCreditor } from "@/utils/schemas/utils";
import { Barcode, Megaphone } from "lucide-react";
import { BsCalendarPlus } from "react-icons/bs";
import { formatDateAsLocale, formatToSlug } from "@/lib/methods/formatting";
import Avatar from "../utils/Avatar";

type AcquisitionChannelsBlockProps = {
	session: Session;
};
function AcquisitionChannelsBlock({ session }: AcquisitionChannelsBlockProps) {
	const queryClient = useQueryClient();
	const [acquisitionChannelHolder, setAcquisitionChannelHolder] = useState<{
		value: string;
		slug: string;
	}>({
		value: "",
		slug: "",
	});
	const { data: acquisitionChannels, isLoading, isError, isSuccess } = useAcquisitionChannels();
	const { mutate: handleCreateAcquisitionChannel, isPending } = useMutationWithFeedback({
		mutationKey: ["create-acquisition-channel"],
		mutationFn: createUtil,
		queryClient: queryClient,
		affectedQueryKey: ["acquisition-channels"],
		callbackFn: () => setAcquisitionChannelHolder({ value: "", slug: "" }),
	});
	return (
		<div className="flex min-h-[450px] w-full flex-col rounded border border-blue-500">
			<h1 className="w-full rounded-tl rounded-tr bg-blue-500 p-1 text-center text-sm font-bold text-white">CANAIS DE AQUISIÇÃO</h1>
			<div className="my-1 flex w-full flex-col">
				<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">
					Os canais de aquisição aqui cadastrados serão utilizados para classificar os clientes que entram no sistema.
				</p>
				<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">Se necessário, cadastre um novo canal de aquisição no menu inferior.</p>
			</div>
			<div className="flex w-full grow flex-wrap items-start justify-around gap-2 p-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar canais de aquisição." /> : null}
				{isSuccess ? (
					acquisitionChannels.length > 0 ? (
						acquisitionChannels.map((acquisitionChannel) => (
							<div key={acquisitionChannel._id} className="w-full lg:w-[350px]">
								<AcquisitionChannelUtil acquisitionChannel={acquisitionChannel} />
							</div>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">Nenhum canal de aquisição encontrado.</p>
					)
				) : null}
			</div>
			<div className="flex w-full flex-col gap-2">
				<h1 className="w-full rounded-bl rounded-br bg-[#fead41] p-1 text-center text-xs font-bold text-white">CADASTRO DE CANAL DE AQUISIÇÃO</h1>
				<div className="flex w-full items-center gap-4 p-3 flex-col lg:flex-row">
					<div className="w-full lg:w-2/3">
						<input
							value={acquisitionChannelHolder.value}
							onChange={(e) => {
								setAcquisitionChannelHolder((prev) => ({ ...prev, value: e.target.value }));
							}}
							type="text"
							placeholder="Preencha um nome para o canal de aquisição..."
							onBlur={() => setAcquisitionChannelHolder((prev) => ({ ...prev, slug: formatToSlug(prev.value) }))}
							className="w-full rounded border border-gray-200 p-1 text-center text-xs tracking-tight text-gray-500 shadow-sm outline-none placeholder:italic"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<input
							value={acquisitionChannelHolder.slug}
							onChange={(e) => {
								setAcquisitionChannelHolder((prev) => ({ ...prev, slug: e.target.value }));
							}}
							type="text"
							placeholder="Preencha um slug para o canal de aquisição..."
							className="w-full rounded border border-gray-200 p-1 text-center text-xs tracking-tight text-gray-500 shadow-sm outline-none placeholder:italic"
						/>
					</div>
				</div>
				<div className="w-full flex items-center justify-end p-2">
					<button
						type="button"
						disabled={isPending}
						onClick={() => {
							const util: TAcquisitionChannel = {
								identificador: "ACQUISITION_CHANNEL",
								valor: acquisitionChannelHolder.value,
								slug: acquisitionChannelHolder.slug,
								autor: {
									id: session.user.id,
									nome: session.user.nome,
									avatar_url: session.user.avatar_url,
								},
								dataInsercao: new Date().toISOString(),
							};
							handleCreateAcquisitionChannel({ info: util });
						}}
						className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
					>
						CADASTRAR
					</button>
				</div>
			</div>
		</div>
	);
}

export default AcquisitionChannelsBlock;

function AcquisitionChannelUtil({ acquisitionChannel }: { acquisitionChannel: TAcquisitionChannelDTO }) {
	return (
		<div className="flex w-full flex-col rounded-md border border-gray-200 p-2">
			<div className="flex items-center w-full justify-start gap-2">
				<div className="flex items-center gap-1">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
						<Megaphone className="w-4 h-4 min-w-4 min-h-4" />
					</div>
					<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{acquisitionChannel.valor}</p>
				</div>
				<div className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-primary/80">
					<Barcode className="w-3 min-w-3 h-3 min-h-3" />
					<p>{acquisitionChannel.slug}</p>
				</div>
			</div>
			<div className="mt-2 flex w-full items-center justify-end gap-2">
				<div className="flex items-center gap-2">
					<div className={"flex items-center gap-1"}>
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(acquisitionChannel.dataInsercao)}</p>
					</div>
					<div className="flex items-center gap-1">
						<Avatar fallback={"R"} url={acquisitionChannel.autor.avatar_url || undefined} height={20} width={20} />
						<p className="text-[0.65rem] font-medium text-gray-500">{acquisitionChannel.autor.nome}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
