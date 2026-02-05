import { Info } from "lucide-react";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TFunnel } from "@/utils/schemas/funnel.schema";
import type { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";

type FunnelBasicInfoSectionProps = {
	infoHolder: TFunnel;
	setInfoHolder: React.Dispatch<React.SetStateAction<TFunnel>>;
	partners: TPartnerSimplifiedDTO[] | undefined;
};

export default function FunnelBasicInfoSection({ infoHolder, setInfoHolder, partners }: FunnelBasicInfoSectionProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="INFORMACOES BASICAS" sectionTitleIcon={<Info className="w-4 h-4 min-w-4 min-h-4" />}>
			<TextInput
				label="NOME DO FUNIL"
				placeholder="Preencha o nome a ser dado ao funil..."
				value={infoHolder.nome}
				handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
				width="100%"
			/>
			<TextInput
				label="DESCRICAO DO FUNIL"
				placeholder="Preencha a descricao a ser dada ao funil..."
				value={infoHolder.descricao}
				handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
				width="100%"
			/>
			<SelectWithImages
				label="VISIBILIDADE DE PARCEIRO"
				value={infoHolder.idParceiro || null}
				options={partners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
				resetOptionLabel="TODOS"
				handleChange={(value) => setInfoHolder((prev) => ({ ...prev, idParceiro: value }))}
				onReset={() => setInfoHolder((prev) => ({ ...prev, idParceiro: null }))}
				width="100%"
			/>
		</ResponsiveDialogDrawerSection>
	);
}
