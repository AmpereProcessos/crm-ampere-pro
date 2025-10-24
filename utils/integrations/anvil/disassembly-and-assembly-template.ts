import { formatDecimalPlaces } from "@/lib/methods/formatting";
import { formatToMoney } from "@/utils/methods";

export function getDisassemblyAndAssemblyTemplateData(
	client: TClientDTO,
	project: TProjectDTOWithReferences,
	propose: IProposeDisassemblyAssemblyInfo,
	seller?: {
		name: string;
		phone: string;
	},
) {
	var addressFormatted;
	if (!!propose.premissas.novoEndereco) {
		addressFormatted = `${propose.premissas.novoEndereco?.endereco}, Nº ${propose.premissas.novoEndereco?.numeroOuIdentificador}, ${propose.premissas.novoEndereco?.bairro} - ${propose.premissas.novoEndereco?.cidade} - ${propose.premissas.novoEndereco?.uf}`;
	} else {
		addressFormatted = `${project.localizacao?.endereco}, Nº ${project.localizacao?.numeroOuIdentificador}, ${project.localizacao?.bairro} - ${project.localizacao?.cidade} - ${project.localizacao?.uf}`;
	}
	const moduleQty = getModulesQty(propose.kit?.modulos);
	const obj = {
		title: propose.projeto.nome,
		fontSize: 10,
		textColor: "#333333",
		data: {
			nomeCliente: client.nome,
			nomeVendedor: seller?.name,
			cpfCnpjCliente: client.cpfCnpj,
			cidadeUfCliente: project.localizacao?.cidade,
			enderecoCliente: project.localizacao?.endereco,
			potPico: formatDecimalPlaces(propose.potenciaPico || 0),
			qtdeModulos: moduleQty,
			qtdeInversores: getInverterQty(propose.kit?.inversores),
			casta13048403c6a11eea0aa5bd3ab8a54a3: "",
			enderecoRemontagem: addressFormatted,
			valorProposta: formatToMoney(propose.valorProposta || 0),
		},
	};
	return obj;
}
