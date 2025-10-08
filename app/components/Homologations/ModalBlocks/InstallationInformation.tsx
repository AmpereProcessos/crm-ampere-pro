import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { THomologation } from "@/utils/schemas/homologation.schema";
import {
	ElectricalInstallationGroups,
	EnergyDistributorsOptions,
} from "@/utils/select-options";
import { Building2 } from "lucide-react";
import type React from "react";

type InstallationInformationProps = {
	infoHolder: THomologation;
	setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function InstallationInformation({
	infoHolder,
	setInfoHolder,
}: InstallationInformationProps) {
	return (
		<ResponsiveDialogDrawerSection
			sectionTitleText="INFORMAÇÕES DA INSTALAÇÃO ELÉTRICA"
			sectionTitleIcon={<Building2 className="w-4 h-4 min-w-4 min-h-4" />}
		>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="CONCESSIONÁRIA/DISTRIBUIDORA"
						value={infoHolder.distribuidora}
						options={EnergyDistributorsOptions.map((d) => d)}
						handleChange={(value) =>
							setInfoHolder((prev) => ({ ...prev, distribuidora: value }))
						}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() =>
							setInfoHolder((prev) => ({ ...prev, distribuidora: "" }))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/4">
					<TextInput
						label="NÚMERO DA INSTALAÇÃO ELÉTRICA"
						placeholder="Preencha o número da instalação elétrica..."
						value={infoHolder.instalacao.numeroInstalacao}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								instalacao: { ...prev.instalacao, numeroInstalacao: value },
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/4">
					<TextInput
						label="NÚMERO DO CLIENTE"
						placeholder="Preencha o número do cliente junto a concessionária..."
						value={infoHolder.instalacao.numeroCliente}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								instalacao: { ...prev.instalacao, numeroCliente: value },
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/4">
					<SelectInput
						label="GRUPO DA INSTALAÇÃO"
						value={infoHolder.instalacao.grupo}
						options={ElectricalInstallationGroups}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								instalacao: { ...prev.instalacao, grupo: value },
							}))
						}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() =>
							setInfoHolder((prev) => ({
								...prev,
								instalacao: { ...prev.instalacao, grupo: "RESIDENCIAL" },
							}))
						}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

export default InstallationInformation;
