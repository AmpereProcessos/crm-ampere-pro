import { TechAnalysisSolicitationTypes, customersAcquisitionChannels, structureTypes } from "./constants";

import { stateCities } from "./estados_cidades";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type Funnel = {
	id: number;
	nome: string;
	modo: "RESPONSÁVEL" | "REPRESENTANTE";
	etapas: { id: number; nome: string }[];
};
export interface IMessage {
	text: string;
	color: string;
}
export interface Comissao {
	semRepresentante: number;
	comRepresentante: number;
}
export type InverterType = {
	id: string | number;
	fabricante: string;
	modelo: string;
	qtde: number;
	garantia?: number;
	potenciaNominal: number;
};
export type ModuleType = {
	id: string | number;
	fabricante: string;
	modelo: string;
	qtde: number;
	potencia: number;
	garantia?: number;
};

export interface IKit {
	_id?: string;
	nome: string;
	categoria: "ON-GRID" | "OFF-GRID" | "BOMBA SOLAR";
	tipo: "TRADICIONAL" | "PROMOCIONAL";
	topologia: "INVERSOR" | "MICRO-INVERSOR";
	potPico?: number;
	preco: number;
	ativo: boolean;
	fornecedor: string;
	estruturasCompativeis: string[];
	incluiEstrutura: boolean;
	incluiTransformador: boolean;
	inversores: InverterType[];
	modulos: ModuleType[];
	dataAlteracao?: string;
	dataInsercao?: string;
}
export interface IUsuario {
	id?: string;
	_id?: string;
	nome: string;
	telefone?: string;
	email: string;
	senha: string;
	avatar_url?: string;
	visibilidade: "GERAL" | "PRÓPRIA" | string[];
	funisVisiveis: number[] | "TODOS";
	grupo: {
		id: number;
		nome: string;
	};
	comissao: Comissao | null;
	permissoes: {
		usuarios: {
			visualizar: boolean; // visualizar área de usuário em auth/users
			editar: boolean; // criar usuários e editar informações de usuários em auth/users
		};
		comissoes: {
			visualizar: boolean; // visualizar comissões de todos os usuários
			editar: boolean; // editar comissões de todos os usuários
		};
		kits: {
			visualizar: boolean; // visualizar área de kits e kits possíveis
			editar: boolean; // editar e criar kits
		};
		propostas: {
			visualizar: boolean; // visualizar área de controle de propostas
			editar: boolean; // criar propostas em qualquer projeto e editar propostas de outros usuários
		};
		projetos: {
			serResponsavel: boolean; // habilitado a ser responsável de projetos
			editar: boolean; // editar informações de todos os projetos
		};
		clientes: {
			serRepresentante: boolean; // habilitado a ser representante de clientes
			editar: boolean; // editar informações de todos os clientes
		};
		precos: {
			visualizar: boolean; // visualizar precificacao geral, com custos, impostos, lucro e afins de propostas e kits
			editar: boolean; // editar precificacao de propostas
		};
	};
	metas?: ISaleGoal[];
	ativo: boolean;
	dataInsercao?: string;
}
export interface ISession {
	user: {
		/** The user's postal address. */
		id: string;
		name: string;
		email: string;
		image?: string;
		visibilidade: "GERAL" | "PRÓPRIA" | string[];
		funisVisiveis: number[] | "TODOS";
		comissao: Comissao | null;
		permissoes: {
			usuarios: {
				visualizar: boolean; // visualizar área de usuário em auth/users
				editar: boolean; // criar usuários e editar informações de usuários em auth/users
			};
			comissoes: {
				visualizar: boolean; // visualizar comissões de todos os usuários
				editar: boolean; // editar comissões de todos os usuários
			};
			kits: {
				visualizar: boolean; // visualizar área de kits e kits possíveis
				editar: boolean; // editar e criar kits
			};
			propostas: {
				visualizar: boolean; // visualizar área de controle de propostas
				editar: boolean; // criar propostas em qualquer projeto e editar propostas de outros usuários
			};
			projetos: {
				serResponsavel: boolean; // habilitado a ser responsável de projetos
				editar: boolean; // editar informações de todos os projetos
			};
			clientes: {
				serRepresentante: boolean; // habilitado a ser representante de clientes
				editar: boolean; // editar informações de todos os clientes
			};
			precos: {
				visualizar: boolean; // visualizar precificacao geral, com custos, impostos, lucro e afins de propostas e kits
				editar: boolean; // editar precificacao de propostas
			};
		};
	};
}
export interface IRepresentative {
	nome: string;
	id: string;
	_id?: string;
}
export interface IResponsible {
	nome: string;
	id: string;
	avatar_url?: string;
	telefone?: string;
	email?: string;
	_id?: string;
}
export type aditionalServicesType = {
	padrao?: number;
	estrutura?: number;
	outros?: number;
};

export interface IClient {
	_id?: string;
	representante: {
		id: string;
		nome: string;
	} | null;
	nome: string;
	cpfCnpj?: string;
	telefonePrimario: string;
	telefoneSecundario?: string;
	email?: string;
	cep?: string;
	bairro?: string;
	endereco?: string;
	numeroOuIdentificador?: string;
	complemento?: string;
	uf: keyof typeof stateCities | null;
	cidade?: string | null;
	dataNascimento?: string;
	rg?: string;
	estadoCivil?: any;
	profissao?: string;
	ondeTrabalha?: string;
	canalVenda?: (typeof customersAcquisitionChannels)[number]["value"] | null;
	dataInsercao?: Date | string | null;
	projetos?: any[];
	indicador?: string;
}

export interface IContractRequest {
	nomeVendedor?: string;
	nomeDoProjeto: string;
	telefoneVendedor: string;
	tipoDeServico: any;
	nomeDoContrato: string;
	telefone: string;
	cpf_cnpj: string;
	rg: string;
	dataDeNascimento?: string | null;
	cep: string;
	cidade?: string | null;
	uf: keyof typeof stateCities | null;
	enderecoCobranca: string;
	numeroResCobranca: string;
	bairro: string;
	pontoDeReferencia: string;
	segmento?: any;
	formaAssinatura?: any;
	codigoSVB: string;
	estadoCivil?: any | null;
	email: string;
	profissao: string;
	ondeTrabalha: string;
	possuiDeficiencia: "NÃO" | "SIM";
	qualDeficiencia: string;
	canalVenda?: (typeof customersAcquisitionChannels)[number]["value"] | null;
	nomeIndicador: string;
	telefoneIndicador: string;
	comoChegouAoCliente: string;
	nomeContatoJornadaUm: string;
	telefoneContatoUm: string;
	nomeContatoJornadaDois: string;
	telefoneContatoDois: string;
	cuidadosContatoJornada: string;
	nomeTitularProjeto?: string;
	tipoDoTitular?: "PESSOA FISICA" | "PESSOA JURIDICA" | null;
	tipoDaLigacao?: "NOVA" | "EXISTENTE" | null;
	tipoDaInstalacao?: "URBANO" | "RURAL" | null;
	cepInstalacao: string;
	enderecoInstalacao: string;
	numeroResInstalacao?: string;
	numeroInstalacao?: string;
	bairroInstalacao: string;
	cidadeInstalacao?: string | null;
	ufInstalacao: keyof typeof stateCities | null;
	pontoDeReferenciaInstalacao: string;
	loginCemigAtende: string;
	senhaCemigAtende: string;
	latitude: string;
	longitude: string;
	potPico?: number;
	geracaoPrevista?: number;
	topologia?: "INVERSOR" | "MICRO-INVERSOR" | null;
	marcaInversor: string;
	qtdeInversor: string;
	potInversor: string;
	marcaModulos: string;
	qtdeModulos: string | number;
	potModulos: string;
	tipoEstrutura: (typeof structureTypes)[number]["value"] | null;
	materialEstrutura?: "MADEIRA" | "FERRO" | null;
	estruturaAmpere?: "SIM" | "NÃO";
	responsavelEstrutura?: "NÃO SE APLICA" | "AMPERE" | "CLIENTE";
	formaPagamentoEstrutura?: string | null;
	valorEstrutura?: number | null;
	possuiOeM?: "SIM" | "NÃO";
	planoOeM?: "PLANO SOL +" | "MANUTENÇÃO SIMPLES" | "NÃO SE APLICA" | "PLANO SOL";
	clienteSegurado?: "SIM" | "NÃO";
	tempoSegurado?: string;
	formaPagamentoOeMOuSeguro?: string;
	valorOeMOuSeguro?: number | null;
	aumentoDeCarga?: "SIM" | "NÃO" | null;
	caixaConjugada?: "SIM" | "NÃO" | null;
	tipoDePadrao?: string | null;
	aumentoDisjuntor?: "SIM" | "NÃO" | null;
	respTrocaPadrao?: "NÃO SE APLICA" | "AMPERE" | "CLIENTE" | null;
	formaPagamentoPadrao?: string | null;
	valorPadrao?: number | null;
	nomePagador: string;
	contatoPagador: string;
	necessidaInscricaoRural?: "SIM" | "NÃO" | null;
	inscriçãoRural: string;
	cpf_cnpjNF: string;
	localEntrega?: string | null;
	entregaIgualCobranca?: "NÃO" | "SIM" | "NÃO SE APLICA" | null;
	restricoesEntrega?: string | null;
	valorContrato: number | null;
	origemRecurso?: "FINANCIAMENTO" | "CAPITAL PRÓPRIO" | null;
	numParcelas: number | null;
	valorParcela: number | null;
	credor: any;
	nomeGerente: string;
	contatoGerente: string;
	necessidadeNFAdiantada?: "SIM" | "NÃO" | null;
	necessidadeCodigoFiname?: "SIM" | "NÃO" | null;
	formaDePagamento: string | null;
	descricaoNegociacao: string;
	possuiDistribuicao: "SIM" | "NÃO" | null;
	realizarHomologacao?: boolean;
	obsComercial?: string;
	distribuicoes: { numInstalacao: string; excedente?: number }[];
	links?: { title: string; link: string; format: string }[] | null;
}
export type ProjectActivity = {
	_id?: string;
	projeto: {
		id: string;
		nome: string;
		codigo: string;
	};
	titulo: string;
	categoria: "ATIVIDADE" | null;
	tipo: "LIGAÇÃO" | "REUNIÃO" | "VISITA TÉCNICA";
	dataVencimento?: string;
	observacoes: string;
	dataInsercao?: string;
	dataConclusao?: string | null;
	responsavel: {
		id: string;
		nome: string;
		avatar_url: string | null;
	};
	autor: {
		id: string;
		nome: string;
		avatar_url: string | null;
	};
	status?: "VERDE" | "LARANJA" | "VERMELHO";
};
export type ProjectNote = {
	_id?: string;
	projeto: {
		id: string;
		nome: string;
		codigo: string;
	};
	categoria: "ANOTAÇÃO" | null;
	anotacao: string;
	dataInsercao?: string;
	autor: {
		id: string;
		nome: string;
		avatar_url: string | null;
	};
};
export type ProjectUpdateLog = {
	_id?: string;
	projetoId: string;
	autor: {
		id: string;
		nome: string;
	};
	alteracoes: {
		[key: string]: string;
	};
};
export interface UserGroup {
	_id?: string;
	nome: string;
	dataInsercao: string;
}
export interface INotification {
	_id?: string;
	remetente:
		| {
				id: string;
				nome: string;
				avatar?: string;
				email?: string;
		  }
		| "SISTEMA";
	destinatario: {
		id: string;
		nome: string;
		email?: string;
	};
	projetoReferencia: {
		id: string;
		nome: string;
		identificador: string;
	};
	mensagem: string;
	dataLeitura?: string;
	dataInsercao?: string;
}
export interface ITechnicalAnalysis {
	_id?: string;
	nomeVendedor?: string; //
	nomeDoCliente: string; //
	codigoSVB: string;
	uf?: keyof typeof stateCities | null; //
	cidade?: string; //
	cep: string; //
	bairro: string; //
	logradouro: string; //
	numeroResidencia: string; //
	qtdeInversor: string; //
	potInversor: string; //
	marcaInversor: string; //
	qtdeModulos: string; //
	potModulos: string; //
	marcaModulos: string; //
	amperagem: string; //
	numeroMedidor: string; //
	distanciaInversorRoteador: string; //
	obsInstalacao: string; //
	adaptacaoQGBT: "NÃO SE APLICA" | "CORTE E TRILHO" | "NÃO" | "TRILHO" | "CORTE"; //
	alambrado?: "NÃO" | "SIM - RESPONSABILIDADE DO CLIENTE" | "SIM - RESPONSABILIDADE DA EMPRESA"; //
	avaliarTelhado: "SIM" | "NÃO"; //
	britagem?: "NÃO" | "SIM - RESPONSABILIDADE DO CLIENTE" | "SIM - RESPONSABILIDADE DA EMPRESA"; //
	casaDeMaquinas?: "NÃO" | "SIM - RESPONSABILIDADE DO CLIENTE" | "SIM - RESPONSABILIDADE DA EMPRESA"; //
	concessionaria: string; //
	construcaoBarracao?: "NÃO" | "SIM - RESPONSABILIDADE DO CLIENTE" | "SIM - RESPONSABILIDADE DA EMPRESA"; //
	custosAdicionais: {
		categoria: "PADRÃO" | "ESTRUTURA" | "INSTALAÇÃO" | "OUTROS";
		descricao: string;
		grandeza: string;
		qtde: number;
		custo?: number;
		valor: number;
	}[]; //
	dataDeAbertura: string; //
	dataDeConclusao?: string; //
	descricaoOrcamentacao: string;
	descritivo: {
		texto: string;
		topíco: string;
	}; // pra que serve
	descritivoInfraEletrica: string;
	distanciaInversorPadrao: string; //
	distanciaItbaRural: string; // não usaremos
	distanciaModulosInversores: string; //
	distanciaSistemaInversor: string; //
	distanciaSistemaQuadro: string; //
	dpsQGBT: "SIM" | "NÃO"; // não usaremos
	espacoQGBT: "SIM" | "NÃO" | "NÃO DEFINIDO"; //
	estruturaMontagem?: "TELHADO CONVENCIONAL" | "BARRACÃO À CONSTRUIR" | "ESTRUTURA DE SOLO" | "BEZERREIRO"; //
	fotoDroneDesenho: "SIM" | "NÃO"; //
	fotoFaixada: "SIM" | "NÃO"; //
	fotosDrone: string; //
	googleEarth: "SIM" | "NÃO"; //
	infoPadraoConjugado?: string; //
	infraCabos: "NÃO DEFINIDO" | "KIT NORMAL" | "KIT+MANGUEIRA" | "PERSONALIZADO"; //
	instalacaoRoteador?: "SIM - RESPONSABILIDADE DA EMPRESA" | "SIM - RESPONSABILIDADE DO CLIENTE" | "NÃO"; //
	limpezaLocalUsinaSolo?: "SIM - RESPONSABILIDADE DA EMPRESA" | "SIM - RESPONSABILIDADE DO CLIENTE" | "NÃO"; //
	links: {
		format: string;
		link: string;
		title: string;
	}[]; //
	linkVisualizacaoProjeto: string; //
	localAterramento: string; //
	localInstalacaoInversor: string; //
	localizacaoInstalacao: string; //
	medidasLocal: "SIM" | "NÃO"; //
	modeloCaixa: string; //
	modLeste?: number; //
	modNordeste?: number; //
	modNoroeste?: number; //
	modNorte?: number; //
	modOeste?: number; //
	modSudeste?: number; //
	modSudoeste?: number; //
	modSul?: number; //
	novaAmperagem?: string; //
	novaLigacaoPadrao?: string; //
	numeroPosteDerivacao?: string; //
	numeroPosteTrafo?: string;
	numeroTrafo?: string; //
	obsDesenho: string; //
	obsObras: string; //
	obsProjetos: string; // pensar em campo
	obsSuprimentos: string; //
	obsVisita?: string; // pensar em campo
	orientacaoEstrutura?: string; //
	padraoTrafoAcoplados?: "NÃO" | "SIM"; // pensar em campo
	pendenciasProjetos?: string; //
	pendenciasTrafo?: string; //
	potTrafo?: number; //
	ramalEntrada?: "AÉREO" | "SUBTERRÂNEO"; //
	ramalSaida?: "AÉREO" | "SUBTERRÂNEO"; //
	realimentar: "SIM" | "NÃO"; //
	redeReligacao?: "SIM - RESPONSABILIDADE DA EMPRESA" | "SIM - RESPONSABILIDADE DO CLIENTE" | "NÃO"; //
	respostaConclusao?: string;
	respostaEspacoProjeto?: "SIM" | "NÃO" | "NÃO DEFINIDO"; //
	respostaEstruturaInclinacao?: "SIM" | "NÃO" | "NÃO DEFINIDO"; //
	respostaExplicacaoDetalhada?: "SIM" | "NÃO" | "NÃO DEFINIDO"; //
	respostaMaderamento?: "NÃO DEFINIDO" | "APTO" | "CONDENADO" | "REFORÇAR" | "AVALIAR NA MONTAGEM";
	respostaPadrao?: "NÃO DEFINIDO" | "APTO" | "REFORMA" | "TROCAR PADRÃO";
	respostaPossuiSombra?: "NÃO DEFINIDO" | "SIM" | "NÃO"; //
	solicitacaoContrato?: boolean; //
	status: string; //
	suprimentos?: {
		insumo: string;
		medida: string;
		qtde: number;
		tipo: string;
	}[]; //
	telefoneDoCliente: string; //
	telefoneVendedor: string; //
	telhasReservas?: "NÃO" | "SIM" | "NÃO DEFINIDO"; //
	temEstudoDeCaso?: "NÃO" | "SIM" | "NÃO DEFINIDO"; // UTILIZAR PENDÊNCIAS
	terraplanagemUsinaSolo?: "SIM - RESPONSABILIDADE DA EMPRESA" | "SIM - RESPONSABILIDADE DO CLIENTE" | "NÃO"; //
	tipoDeLaudo?: "ESTUDO SIMPLES (36 HORAS)" | "ESTUDO INTERMEDIÁRIO (48 HORAS)" | "ESTUDO COMPLEXO (72 HORAS)"; //
	tipoDesenho?: "SOLAR EDGE DESIGN" | "REVIT 3D" | "AUTOCAD 2D" | "APENAS VIABILIDADE DE ESPAÇO"; //
	tipoDeSolicitacao?: (typeof TechAnalysisSolicitationTypes)[number]; //
	tipoDisjuntor?: string; //
	tipoEstrutura?: "MADEIRA" | "FERRO"; //
	tipoFixacaoInversores?: string; //
	tipoInversor: "MICRO-INVERSOR" | "INVERSOR" | "NÃO DEFINIDO"; //
	tipoOrcamentacao?: string; // nao utilizaremos
	orcamentacao: {
		categoria: string;
		descricao: string;
	}[]; // utilizar custos
	tipoPadrao?: "CONTRA À REDE - POSTE DO OUTRO LADO DA RUA" | "À FAVOR DA REDE - POSTE DO MESMO LADO DA RUA";
	tipoProjeto?: "NÃO DEFINIDO" | "MICRO GERAÇÃO" | "REDE MÉDIA" | "REDE BAIXA"; //
	tipoTelha?: "PORTUGUESA" | "FRANCESA" | "ROMANA" | "CIMENTO" | "ETHERNIT" | "SANDUÍCHE" | "AMERICANA" | "ZINCO" | "CAPE E BICA" | "LAJE"; //
	kitIds?: string[];
}
export type Charge = {
	descricao: string;
	qtde: number;
	horasFuncionamento: number;
	potencia: number;
};
export interface IPPSCall {
	_id?: string;
	status?: "REALIZADO" | "PENDENTE";
	tipoSolicitacao: any;
	responsavel?: {
		id: string;
		nome: string;
		apelido: string;
		avatar_url: string;
	};
	requerente: {
		idCRM: string;
		nomeCRM: string;
		apelido: string;
		avatar_url: string;
	};
	projeto?: {
		id?: string;
		nome?: string;
		codigo?: string;
	};
	premissas: {
		geracao: number | null;
		cargas?: {
			descricao: string;
			qtde: number;
			horasFuncionamento: number;
			potencia: number;
		}[];
		topologia: "MICRO-INVERSOR" | "INVERSOR" | null;
		tipoEstrutura: (typeof structureTypes)[number]["value"] | null;
		valorFinanciamento: number | null;
	};
	cliente: {
		nome?: string;
		tipo?: any;
		telefone?: string;
		cep?: string;
		uf?: IClient["uf"];
		bairro: IClient["bairro"];
		cidade?: IClient["cidade"];
		endereco?: IClient["endereco"];
		numeroOuIdentificador?: IClient["numeroOuIdentificador"];
		cpfCnpj?: IClient["cpfCnpj"];
		dataNascimento?: IClient["dataNascimento"];
		email?: string;
		renda?: number | null;
		profissao?: string | null;
	};
	links?: {
		format: string;
		link: string;
		title: string;
	}[];
	observacoes: string;
	anotacoes?: string;
	dataInsercao?: string;
	dataEfetivacao?: string;
}
export interface ISaleGoal {
	_id?: string;
	periodo: string;
	vendedor: {
		id: string;
		nome: string;
	};
	metas: {
		potenciaPico?: number | null;
		valorVendido?: number | null;
		projetosVendidos?: number | null;
		projetosEnviados?: number | null;
		conversao?: number | null;
		projetosCriados?: number | null;
	};
}
