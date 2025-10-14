import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import Avatar from "@/components/utils/Avatar";
import { formatDateAsLocale, formatLocation } from "@/lib/methods/formatting";
import {
	formatPhoneAsBase,
	formatToCPForCNPJ,
	formatToPhone,
} from "@/utils/methods";
import { useAcquisitionChannels } from "@/utils/queries/utils";
import type {
	TClient,
	TSimilarClientSimplifiedDTO,
} from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { CustomersAcquisitionChannels } from "@/utils/select-options";
import { UserRound } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { BsCalendarPlus } from "react-icons/bs";
import { FaPhone, FaUser } from "react-icons/fa";
import { FaRegIdCard } from "react-icons/fa6";
import { MdEmail, MdLocationPin } from "react-icons/md";

type OpportunityClientInformationBlockProps = {
	opportunity: TOpportunity;
	setOpportunity: Dispatch<SetStateAction<TOpportunity>>;
	client: TClient;
	setClient: Dispatch<SetStateAction<TClient>>;
	similarClient: TSimilarClientSimplifiedDTO | null;
	setSimilarClient: Dispatch<
		SetStateAction<TSimilarClientSimplifiedDTO | null>
	>;
	similarClients: TSimilarClientSimplifiedDTO[];
};
function OpportunityClientInformationBlock({
	opportunity,
	setOpportunity,
	client,
	setClient,
	similarClient,
	setSimilarClient,
	similarClients,
}: OpportunityClientInformationBlockProps) {
	const { data: acquisitionChannels } = useAcquisitionChannels();
	function clearSimilarClient() {
		setSimilarClient(null);
	}
	const location: TOpportunity["localizacao"] = {
		cep: client.cep,
		uf: client.uf,
		cidade: client.cidade,
		bairro: client.bairro,
		endereco: client.endereco,
		numeroOuIdentificador: client.numeroOuIdentificador,
		complemento: client.complemento,
	};
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<UserRound size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">
					INFORMAÇÕES PESSOAIS DO CLIENTE
				</h1>
			</div>
			{similarClient ? (
				<div className="flex w-full flex-col gap-2 rounded-md border border-primary/50 bg-background font-Inter shadow-md">
					<h1 className="w-full rounded-tl rounded-tr bg-cyan-500 text-center font-bold text-primary-foreground">
						CLIENTE VINCULADO
					</h1>
					<div className="flex w-full flex-col gap-2 p-4">
						<div className="flex w-full items-center justify-between gap-2">
							<div className="flex  items-center gap-1">
								<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
									<FaUser />
								</div>
								<p className="text-sm font-black leading-none tracking-tight">
									{client.nome}
								</p>
							</div>

							<h1 className="rounded-full bg-green-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs">
								SELECIONADO
							</h1>
						</div>
						<div className="mt-2 flex w-full flex-wrap items-center justify-between">
							<div className="flex items-center gap-2">
								<MdLocationPin />
								<p className="text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs">
									{formatLocation({
										location,
										includeCity: true,
										includeUf: true,
									})}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<FaPhone />
								<p className="text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs">
									{client.telefonePrimario}
								</p>
							</div>
						</div>
						<div className="flex w-full flex-wrap items-center justify-between">
							<div className="flex items-center gap-2">
								<MdEmail />
								<p className="text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs">
									{client.email || "NÃO PREENCHIDO"}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<FaRegIdCard />
								<p className="text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs">
									{client.cpfCnpj || "NÃO PREENCHIDO"}
								</p>
							</div>
						</div>
						<div className="mt-2 flex w-full items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<div className={"flex items-center gap-2"}>
									<BsCalendarPlus />
									<p className="text-xs font-medium text-primary/70">
										{formatDateAsLocale(client.dataInsercao)}
									</p>
								</div>
								<div className="flex items-center justify-center gap-2">
									<Avatar
										fallback={"U"}
										height={25}
										width={25}
										url={client.autor?.avatar_url || undefined}
									/>
									<p className="text-xs font-medium text-primary/70">
										{client.autor?.nome}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => clearSimilarClient()}
								className="rounded-full bg-primary/60 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs"
							>
								LIMPAR
							</button>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-1/2">
							<TextInput
								label="NOME"
								value={client.nome}
								placeholder="Preencha aqui o nome do cliente."
								handleChange={(value) =>
									setClient((prev) => ({ ...prev, nome: value }))
								}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/2">
							<TextInput
								label="CPF/CNPJ"
								value={client.cpfCnpj || ""}
								placeholder="Preencha aqui o CPF ou CNPJ do cliente."
								handleChange={(value) =>
									setClient((prev) => ({
										...prev,
										cpfCnpj: formatToCPForCNPJ(value),
									}))
								}
								width="100%"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-1/2">
							<TextInput
								label="TELEFONE PRIMÁRIO"
								value={client.telefonePrimario}
								placeholder="Preencha aqui o telefone primário do cliente."
								handleChange={(value) =>
									setClient((prev) => ({
										...prev,
										telefonePrimario: formatToPhone(value),
										telefonePrimarioBase: formatPhoneAsBase(value),
									}))
								}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/2">
							<TextInput
								label="TELEFONE SECUNDÁRIO"
								value={client.telefoneSecundario || ""}
								placeholder="Preencha aqui o telefone secundário do cliente."
								handleChange={(value) =>
									setClient((prev) => ({
										...prev,
										telefoneSecundario: formatToPhone(value),
									}))
								}
								width="100%"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-1/2">
							<TextInput
								label="EMAIL"
								value={client.email || ""}
								placeholder="Preencha aqui o email do cliente."
								handleChange={(value) =>
									setClient((prev) => ({ ...prev, email: value }))
								}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/2">
							<SelectInput
								label="CANAL DE AQUISIÇÃO"
								value={client.canalAquisicao || ""}
								handleChange={(value) => {
									setClient((prev) => ({
										...prev,
										canalAquisicao: value,
										idMarketing: value === "SMBOT" ? "SMBOT" : prev.idMarketing,
									}));
									if (value === "SMBOT")
										setOpportunity((prev) => ({
											...prev,
											idMarketing: "SMBOT",
										}));
								}}
								options={
									acquisitionChannels?.map((channel) => ({
										id: channel._id,
										label: channel.valor,
										value: channel.valor,
									})) || []
								}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setClient((prev) => ({
										...prev,
										canalAquisicao: CustomersAcquisitionChannels[0].value,
									}))
								}
								width="100%"
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default OpportunityClientInformationBlock;
