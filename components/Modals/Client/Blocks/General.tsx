import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import { MdAttachFile } from "react-icons/md";
import DateInput from "@/components/Inputs/DateInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TUseClientStateHook } from "@/hooks/use-client-state-hook";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue, formatToCPForCNPJ, formatToPhone } from "@/utils/methods";
import { useAcquisitionChannels } from "@/utils/queries/utils";
import { MaritalStatus } from "@/utils/select-options";

type ClientGeneralBlockProps = {
	infoHolder: TUseClientStateHook["state"]["client"];
	updateInfoHolder: TUseClientStateHook["updateClient"];
	avatarHolder: TUseClientStateHook["state"]["clientAvatarHolder"];
	updateAvatarHolder: TUseClientStateHook["updateClientAvatarHolder"];
};
export default function ClientGeneralBlock({ infoHolder, updateInfoHolder, avatarHolder, updateAvatarHolder }: ClientGeneralBlockProps) {
	const { data: acquisitionChannels } = useAcquisitionChannels();

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="INFORMAÇÕES DO CLIENTE" sectionTitleIcon={<LayoutGrid size={15} />}>
			<div className="w-full flex items-center lg:items-start flex-col lg:flex-row gap-2">
				<ImageContent imageUrl={infoHolder.conecta?.avatar_url} imageHolder={avatarHolder} updateImageHolder={updateAvatarHolder} />
				<div className="h-full w-full lg:grow flex flex-col items-center gap-2">
					<TextInput
						label="NOME (*)"
						value={infoHolder.nome}
						placeholder="Preencha aqui o nome do cliente."
						handleChange={(value) => updateInfoHolder({ nome: value })}
						width="100%"
					/>
					<TextInput
						label="CPF/CNPJ"
						value={infoHolder.cpfCnpj ?? ""}
						placeholder="Preencha aqui o CPF ou CNPJ do cliente."
						handleChange={(value) => updateInfoHolder({ cpfCnpj: formatToCPForCNPJ(value) })}
						width="100%"
					/>
					<DateInput
						label={"DATA DE NASCIMENTO"}
						editable={true}
						value={infoHolder.dataNascimento ? formatDateForInputValue(infoHolder.dataNascimento) : undefined}
						handleChange={(value) => updateInfoHolder({ dataNascimento: formatDateOnInputChange(value, "string") as string })}
						width={"100%"}
					/>
				</div>
			</div>

			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="PROFISSÃO"
						value={infoHolder.profissao ?? ""}
						placeholder="Preencha aqui a profissão do cliente."
						handleChange={(value) => updateInfoHolder({ profissao: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<SelectInput
						label="ESTADO CIVIL"
						value={infoHolder.estadoCivil ?? null}
						options={MaritalStatus}
						handleChange={(value) => updateInfoHolder({ estadoCivil: value })}
						onReset={() => updateInfoHolder({ estadoCivil: null })}
						resetOptionLabel="NÃO DEFINIDO"
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="CANAL DE AQUISIÇÃO"
						value={infoHolder.canalAquisicao ?? null}
						options={
							acquisitionChannels?.map((c) => ({
								id: c._id,
								label: c.valor,
								value: c.valor,
							})) || []
						}
						handleChange={(value) => updateInfoHolder({ canalAquisicao: value })}
						onReset={() => updateInfoHolder({ canalAquisicao: undefined })}
						resetOptionLabel="NÃO DEFINIDO"
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="NOME DO INDICADOR (SE INDICAÇÃO)"
						value={infoHolder.indicador.nome || ""}
						placeholder="Preencha aqui o nome do indicador..."
						handleChange={(value) => updateInfoHolder({ indicador: { ...infoHolder.indicador, nome: value } })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="TELEFONE DO INDICADOR (SE INDICAÇÃO)"
						value={infoHolder.indicador.contato ?? ""}
						placeholder="Preencha aqui o contato do indicador..."
						handleChange={(value) => updateInfoHolder({ indicador: { ...infoHolder.indicador, contato: formatToPhone(value) } })}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

function ImageContent({
	imageUrl,
	imageHolder,
	updateImageHolder,
}: {
	imageUrl: Exclude<TUseClientStateHook["state"]["client"]["conecta"], undefined | null>["avatar_url"];
	imageHolder: TUseClientStateHook["state"]["clientAvatarHolder"];
	updateImageHolder: TUseClientStateHook["updateClientAvatarHolder"];
}) {
	return (
		<div className="flex items-center justify-center min-h-[250px] min-w-[250px]">
			<label className="relative aspect-square w-full max-w-[250px] cursor-pointer overflow-hidden rounded-lg" htmlFor="dropzone-file">
				<ImagePreview imageHolder={imageHolder} imageUrl={imageUrl} />
				<input
					accept=".png,.jpeg,.jpg"
					className="absolute h-full w-full cursor-pointer opacity-0"
					id="dropzone-file"
					multiple={false}
					onChange={(e) => {
						const file = e.target.files?.[0] ?? null;
						updateImageHolder({
							file,
							previewUrl: file ? URL.createObjectURL(file) : null,
						});
					}}
					tabIndex={-1}
					type="file"
				/>
			</label>
		</div>
	);
}

function ImagePreview({
	imageUrl,
	imageHolder,
}: {
	imageUrl: Exclude<TUseClientStateHook["state"]["client"]["conecta"], undefined | null>["avatar_url"];
	imageHolder: TUseClientStateHook["state"]["clientAvatarHolder"];
}) {
	if (imageHolder.previewUrl) {
		return <Image alt="Avatar do cliente." fill={true} objectFit="cover" src={imageHolder.previewUrl} />;
	}
	if (imageUrl) {
		return <Image alt="Avatar do cliente." fill={true} objectFit="cover" src={imageUrl} />;
	}

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-primary/20">
			<MdAttachFile className="h-6 w-6" />
			<p className="text-center font-medium text-xs">DEFINIR AVATAR</p>
		</div>
	);
}
