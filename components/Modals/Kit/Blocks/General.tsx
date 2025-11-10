import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import { MdAttachFile } from "react-icons/md";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import DateInput from "@/components/Inputs/DateInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TUseKitStateHook } from "@/hooks/use-kit-state-hook";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue } from "@/utils/methods";
import { usePricingMethods } from "@/utils/queries/pricing-methods";
import { usePaymentMethods } from "@/utils/queries/payment-methods";
import { StructureTypes } from "@/utils/select-options";

type KitGeneralBlockProps = {
	infoHolder: TUseKitStateHook["state"]["kit"];
	updateInfoHolder: TUseKitStateHook["updateKit"];
	imageHolder: TUseKitStateHook["state"]["kitImageHolder"];
	updateImageHolder: TUseKitStateHook["updateKitImageHolder"];
};

export default function KitGeneralBlock({ infoHolder, updateInfoHolder, imageHolder, updateImageHolder }: KitGeneralBlockProps) {
	const { data: pricingMethods } = usePricingMethods();
	const { data: paymentMethods } = usePaymentMethods();

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="INFORMAÇÕES GERAIS DO KIT" sectionTitleIcon={<LayoutGrid size={15} />}>
			<div className="w-fit self-center">
				<CheckboxInput
					checked={infoHolder.ativo}
					labelFalse="KIT DESATIVADO"
					labelTrue="KIT ATIVADO"
					handleChange={(value) => updateInfoHolder({ ativo: value })}
				/>
			</div>
			<div className="w-full flex items-center lg:items-start flex-col lg:flex-row gap-2">
				<ImageContent imageUrl={infoHolder.imagemCapaUrl} imageHolder={imageHolder} updateImageHolder={updateImageHolder} />
				<div className="h-full w-full lg:grow flex flex-col items-center gap-2">
					<TextInput
						label="NOME DO KIT (*)"
						value={infoHolder.nome}
						placeholder="Preencha aqui o nome do kit."
						handleChange={(value) => updateInfoHolder({ nome: value })}
						width="100%"
					/>
					<NumberInput
						label="POTÊNCIA PICO (kW)"
						value={infoHolder.potenciaPico}
						placeholder="Preencha aqui a potência pico."
						handleChange={(value) => updateInfoHolder({ potenciaPico: Number(value) })}
						width="100%"
					/>
					<NumberInput
						label="PREÇO"
						value={infoHolder.preco}
						placeholder="Preencha aqui o preço do kit."
						handleChange={(value) => updateInfoHolder({ preco: Number(value) })}
						width="100%"
					/>
				</div>
			</div>
			<SelectInput
				label="METODOLOGIA DE PRECIFICAÇÃO (*)"
				value={infoHolder.idMetodologiaPrecificacao ?? null}
				handleChange={(value) => updateInfoHolder({ idMetodologiaPrecificacao: value })}
				onReset={() => updateInfoHolder({ idMetodologiaPrecificacao: "" })}
				resetOptionLabel="NÃO DEFINIDO"
				options={pricingMethods?.map((method) => ({ id: method._id, label: method.nome, value: method._id })) || []}
				width="100%"
			/>
			<SelectInput
				label="TOPOLOGIA"
				value={infoHolder.topologia ?? null}
				handleChange={(value) => updateInfoHolder({ topologia: value as "MICRO-INVERSOR" | "INVERSOR" })}
				onReset={() => updateInfoHolder({ topologia: "MICRO-INVERSOR" })}
				resetOptionLabel="NÃO DEFINIDO"
				options={[
					{ id: 1, label: "MICRO-INVERSOR", value: "MICRO-INVERSOR" },
					{ id: 2, label: "INVERSOR", value: "INVERSOR" },
				]}
				width="100%"
			/>

			<SelectInput
				label="METODOLOGIAS DE PAGAMENTO (*)"
				value={infoHolder.idsMetodologiasPagamento?.[0] ?? null}
				handleChange={(value) => updateInfoHolder({ idsMetodologiasPagamento: value ? [value] : [] })}
				onReset={() => updateInfoHolder({ idsMetodologiasPagamento: [] })}
				resetOptionLabel="NÃO DEFINIDO"
				options={paymentMethods?.map((method) => ({ id: method._id, label: method.nome, value: method._id })) || []}
				width="100%"
			/>

			<SelectInput
				label="ESTRUTURAS COMPATÍVEIS (*)"
				value={infoHolder.estruturasCompativeis?.[0] ?? null}
				handleChange={(value) => updateInfoHolder({ estruturasCompativeis: value ? [value] : [] })}
				onReset={() => updateInfoHolder({ estruturasCompativeis: [] })}
				resetOptionLabel="NÃO DEFINIDO"
				options={StructureTypes}
				width="100%"
			/>

			<DateInput
				label="DATA DE VALIDADE"
				editable={true}
				value={infoHolder.dataValidade ? formatDateForInputValue(infoHolder.dataValidade) : undefined}
				handleChange={(value) => updateInfoHolder({ dataValidade: formatDateOnInputChange(value, "string") as string })}
				width="100%"
			/>
		</ResponsiveDialogDrawerSection>
	);
}

type ImageContentProps = {
	imageUrl?: string | null;
	imageHolder: TUseKitStateHook["state"]["kitImageHolder"];
	updateImageHolder: (holder: Partial<TUseKitStateHook["state"]["kitImageHolder"]>) => void;
};

function ImageContent({ imageUrl, imageHolder, updateImageHolder }: ImageContentProps) {
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
	imageUrl: TUseKitStateHook["state"]["kit"]["imagemCapaUrl"];
	imageHolder: TUseKitStateHook["state"]["kitImageHolder"];
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
