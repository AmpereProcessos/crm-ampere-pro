import { Phone } from "lucide-react";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { formatPhoneAsBase, formatToPhone } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";

type ClientContactsBlockProps = {
	infoHolder: TClient;
	updateInfoHolder: (changes: Partial<TClient>) => void;
};
export default function ClientContactsBlock({ infoHolder, updateInfoHolder }: ClientContactsBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="CONTATOS DO CLIENTE" sectionTitleIcon={<Phone size={15} />}>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="TELEFONE PRIMÁRIO (*)"
						value={infoHolder.telefonePrimario || ""}
						placeholder="Preencha aqui o telefone primário do cliente."
						handleChange={(value) => updateInfoHolder({ telefonePrimario: formatToPhone(value), telefonePrimarioBase: formatPhoneAsBase(value) })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="TELEFONE SECUNDÁRIO"
						value={infoHolder.telefoneSecundario || ""}
						placeholder="Preencha aqui o telefone secundário do cliente."
						handleChange={(value) => updateInfoHolder({ telefoneSecundario: formatToPhone(value) })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="EMAIL"
						value={infoHolder.email || ""}
						placeholder="Preencha aqui o email do cliente."
						handleChange={(value) => updateInfoHolder({ email: value })}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}
