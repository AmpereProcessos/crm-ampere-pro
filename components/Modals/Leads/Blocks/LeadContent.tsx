import SelectInput from "@/components/Inputs/SelectInput";
import SelectInputVirtualized from "@/components/Inputs/SelectInputVirtualized";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import TextInput from "@/components/Inputs/TextInput";
import { DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES } from "@/lib/leads";
import { getErrorMessage } from "@/lib/methods/errors";
import { renderIconWithClassNames } from "@/lib/methods/rendering";
import { cn } from "@/lib/utils";
import { BrazilianCitiesOptionsFromUF, BrazilianStatesOptions } from "@/utils/estados_cidades";
import { formatToPhone } from "@/utils/methods";
import { useVinculationClient } from "@/utils/queries/clients";
import { useOpportunityCreators } from "@/utils/queries/users";
import { TLead } from "@/utils/schemas/leads.schema";
import { CustomersAcquisitionChannels } from "@/utils/select-options";
import { Code, LayoutGrid, Mail, Phone, Upload, UserRound } from "lucide-react";
import { memo, useEffect, useMemo } from "react";

type GeneralBlockProps = {
	name: TLead["nome"];
	phone: TLead["telefone"];
	uf: TLead["uf"];
	city: TLead["cidade"];
	acquisitionChannel: TLead["canalAquisicao"];
	updateInfoHolder: (newInfo: Partial<TLead>) => void;
};
export const GeneralBlock = memo(({ name, phone, uf, city, acquisitionChannel, updateInfoHolder }: GeneralBlockProps) => {
	const { data: client, isLoading, isSuccess, isError, error } = useVinculationClient({ phone, cpfCnpj: "" });
	useEffect(() => {
		console.log("client", client);
		if (client) {
			updateInfoHolder({
				nome: client.nome,
				idCliente: client._id,
				canalAquisicao: client.canalAquisicao || "PROSPECÇÃO ATIVA",
				cidade: client.cidade,
				uf: client.uf,
			});
		}
	}, [client]);
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<LayoutGrid size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DO LEAD</h1>
			</div>
			<div className="w-full flex flex-col gap-3">
				{isLoading ? <p className="text-xs font-medium text-primary/80 animate-pulse text-center">Buscando cliente existente...</p> : null}
				{isError ? <p className="text-xs font-medium text-orange-500 text-center">{getErrorMessage(error)}</p> : null}
				{isSuccess ? (
					<div className="flex w-full flex-col gap-2 rounded-xl shadow-sm px-3 py-1.5 bg-primary/50 text-primary-foreground">
						<div className="w-full flex items-center justify-between gap-2">
							<h3 className="text-[0.65rem] font-medium">CLIENTE ENCONTRADO</h3>
							<div className="flex items-center gap-1">
								<Code className="w-3 h-3 min-w-3 min-h-3" />
								<p className="text-[0.65rem] font-medium ">{client._id}</p>
							</div>
						</div>
						<div className="w-full flex items-center justify-center gap-2 flex-wrap">
							<div className="flex items-center gap-1">
								<UserRound className="w-3 h-3 min-w-3 min-h-3" />
								<p className="text-xs font-medium">{client.nome}</p>
							</div>
							<div className="flex items-center gap-1">
								<Phone className="w-3 h-3 min-w-3 min-h-3" />
								<p className="text-xs font-medium">{client.telefonePrimario}</p>
							</div>
							<div className="flex items-center gap-1">
								<Mail className="w-3 h-3 min-w-3 min-h-3" />
								<p className="text-xs font-medium">{client.email}</p>
							</div>
						</div>
					</div>
				) : null}
				<TextInput
					label="NOME DO LEAD"
					placeholder="Preencha aqui o nome do lead..."
					value={name ?? ""}
					handleChange={(value) => updateInfoHolder({ nome: value })}
					width="100%"
				/>
				<TextInput
					label="TELEFONE DO LEAD"
					placeholder="Preencha aqui o telefone do lead..."
					value={phone ?? ""}
					handleChange={(value) => updateInfoHolder({ telefone: formatToPhone(value) })}
					width="100%"
				/>
				<SelectInputVirtualized
					label="ESTADO"
					value={uf ?? null}
					handleChange={(value) => updateInfoHolder({ uf: value, cidade: BrazilianCitiesOptionsFromUF(value)[0]?.value })}
					options={BrazilianStatesOptions}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() => updateInfoHolder({ uf: null })}
					width="100%"
				/>
				<SelectInputVirtualized
					label="CIDADE"
					value={city ?? null}
					handleChange={(value) => updateInfoHolder({ cidade: value })}
					options={BrazilianCitiesOptionsFromUF(uf ?? "")}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() => updateInfoHolder({ cidade: null })}
					width="100%"
				/>
				<SelectInput
					label="CANAL DE AQUISIÇÃO"
					value={acquisitionChannel ?? null}
					handleChange={(value) => updateInfoHolder({ canalAquisicao: value })}
					options={CustomersAcquisitionChannels}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() => updateInfoHolder({ canalAquisicao: "PROSPECÇÃO ATIVA" })}
					width="100%"
				/>
			</div>
		</div>
	);
});

type QualificationBlockProps = {
	qualification: TLead["qualificacao"];
	updateQualification: (newInfo: Partial<TLead["qualificacao"]>) => void;
};
export const QualificationBlock = memo(({ qualification, updateQualification }: QualificationBlockProps) => {
	const { data: opportunityCreators } = useOpportunityCreators();
	console.log("QualificationBlock re-rendered");
	const computeLeadScore = (attributes: TLead["qualificacao"]["atributos"]): number => {
		let totalScore = 0;
		for (const config of DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES) {
			const selectedAttribute = attributes.find((a) => a.identificador === config.identifier);
			if (!selectedAttribute) continue;
			let weightMultipler = 0;
			if (config.inputType === "select") {
				const selectedOption = config.inputOptions.find((opt) => opt.value === selectedAttribute.valor);
				weightMultipler = selectedOption ? selectedOption.weightMultipler : 0;
			} else if (config.inputType === "text") {
				weightMultipler = selectedAttribute.valor.trim() ? 1 : 0;
			}
			totalScore += config.weight * weightMultipler;
		}
		const clamped = Math.max(0, Math.min(10, totalScore));
		return Number(clamped.toFixed(2));
	};

	const upsertQualificationAttribute = (
		prevAttributes: TLead["qualificacao"]["atributos"],
		params: { identifier: string; name: string; weight: number; value: string },
	): TLead["qualificacao"]["atributos"] => {
		const { identifier, name, weight, value } = params;
		const exists = prevAttributes.some((a) => a.identificador === identifier);
		if (exists) {
			return prevAttributes.map((attr) => (attr.identificador === identifier ? { ...attr, valor: value, nome: name, peso: weight } : attr));
		}
		return [...prevAttributes, { identificador: identifier, nome: name, valor: value, peso: weight }];
	};

	useEffect(() => {
		const nextScore = computeLeadScore(qualification.atributos);
		if (qualification.score === nextScore) return;
		updateQualification({ score: nextScore });
	}, [qualification.atributos, qualification.score, updateQualification]);

	const opportunityCreatorOptions = useMemo(
		() =>
			opportunityCreators?.map((creator) => ({
				id: creator._id,
				value: creator._id,
				label: creator.nome,
				url: creator.avatar_url || undefined,
			})) || [],
		[opportunityCreators],
	);

	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<Upload size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">QUALIFICAÇÃO DO LEAD</h1>
			</div>
			<div className="w-full flex flex-col gap-3">
				<h3
					className={cn("px-2 py-0.5 rounded-lg bg-primary/20 text-xs font-medium self-center", {
						"bg-green-200 text-green-700": qualification.score >= 7,
						"bg-yellow-200 text-yellow-700": qualification.score >= 4 && qualification.score < 7,
						"bg-red-200 text-red-700": qualification.score < 4,
					})}
				>
					NOTA {qualification.score}
				</h3>
				<SelectWithImages
					label="RESPONSÁVEL PELA QUALIFICAÇÃO"
					value={qualification.responsavel?.id ?? ""}
					options={opportunityCreatorOptions}
					handleChange={(value) => {
						{
							const selectedUser = opportunityCreators?.find((creator) => creator._id === value);
							if (!selectedUser) return updateQualification({ responsavel: null });
							return updateQualification({
								responsavel: { id: selectedUser._id, nome: selectedUser.nome, avatar_url: selectedUser.avatar_url },
							});
						}
					}}
					onReset={() => updateQualification({ responsavel: null })}
					resetOptionLabel="NÃO DEFINIDO"
					width="100%"
				/>
				{DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES.map((attribute) => (
					<div key={attribute.identifier} className="flex w-full flex-col gap-4 p-6 border border-primary/20 rounded-xl bg-card shadow-sm">
						<div className="w-full flex flex-col gap-1">
							<div className="w-full flex items-center gap-2">
								{renderIconWithClassNames(attribute.icon)}
								<h1 className="text-sm font-bold leading-none tracking-tight">{attribute.name}</h1>
							</div>
							<p className="text-xs font-light leading-none text-primary/80">{attribute.call}</p>
						</div>
						{attribute.inputType === "text" ? (
							<TextInput
								label={attribute.name}
								labelClassName="text-[0.6rem]"
								holderClassName="text-xs p-2 min-h-[34px]"
								placeholder={attribute.inputPlaceholder}
								value={qualification.atributos.find((a) => a.identificador === attribute.identifier)?.valor || ""}
								handleChange={(value) => {
									const newAttributes = upsertQualificationAttribute(qualification.atributos, {
										identifier: attribute.identifier,
										name: attribute.name,
										weight: attribute.weight,
										value,
									});
									updateQualification({ atributos: newAttributes });
								}}
								width="100%"
							/>
						) : null}
						{attribute.inputType === "select" ? (
							<SelectInput
								label={attribute.name}
								labelClassName="text-[0.6rem]"
								holderClassName="text-xs p-2 min-h-[34px]"
								value={qualification.atributos.find((a) => a.identificador === attribute.identifier)?.valor || ""}
								options={attribute.inputOptions}
								handleChange={(value) => {
									const newAttributes = upsertQualificationAttribute(qualification.atributos, {
										identifier: attribute.identifier,
										name: attribute.name,
										weight: attribute.weight,
										value,
									});
									updateQualification({ atributos: newAttributes });
								}}
								onReset={() => {
									const newAttributes = upsertQualificationAttribute(qualification.atributos, {
										identifier: attribute.identifier,
										name: attribute.name,
										weight: attribute.weight,
										value: "",
									});
									updateQualification({ atributos: newAttributes });
								}}
								resetOptionLabel="NÃO DEFINIDO"
								width="100%"
							/>
						) : null}
					</div>
				))}
			</div>
		</div>
	);
});
