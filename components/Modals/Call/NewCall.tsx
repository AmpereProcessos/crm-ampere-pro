import AttachFile from '@/components/Calls/AttachFile';
import ChargeMenu from '@/components/Calls/ChargeMenu';
import DateInput from '@/components/Inputs/DateInput';
import DropdownSelect from '@/components/Inputs/DropdownSelect';
import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import Avatar from '@/components/utils/Avatar';
import type { TUserSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/methods/errors';
import { storage } from '@/services/firebase/storage-config';
import { fileTypes, structureTypes } from '@/utils/constants';
import { stateCities } from '@/utils/estados_cidades';
import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods';
import { Charge, IKit, IPPSCall } from '@/utils/models';
import { createPPSCall } from '@/utils/mutations/pps-calls';
import { TPPSCall } from '@/utils/schemas/integrations/app-ampere/pps-calls.schema';
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import { PPSCallTypes } from '@/utils/select-options';
import dayjs from 'dayjs';
import { UploadResult, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsCalendarFill } from 'react-icons/bs';
import { VscChromeClose } from 'react-icons/vsc';

const filesIdentifier = {
  comprovanteEndereco: 'COMPROVANTE DE ENDEREÇO',
  comprovanteRenda: 'COMPROVANTE DE RENDA',
  documentoPessoal: 'DOCUMENTO PESSOAL',
  cartaoCNPJ: 'CARTÃO CNPJ',
  contratoSocial: 'CONTRATO SOCIAL',
  declaracaoFaturamento: 'DECLARAÇÃO DE FATURAMENTO',
};

type NewCallProps = {
  opportunity?: TOpportunityDTOWithClient;
  session: TUserSession;
  closeModal: () => void;
};
function NewCall({ opportunity, session, closeModal }: NewCallProps) {
  const [infoHolder, setInfoHolder] = useState<TPPSCall>({
    status: 'PENDENTE',
    anotacoes: '',
    tipoSolicitacao: null,
    requerente: {
      idCRM: session?.user?.id || '',
      nomeCRM: session?.user.nome || '',
      apelido: '',
      avatar_url: session?.user.avatar_url || '',
    },
    projeto: {
      id: opportunity?._id,
      nome: opportunity?.nome,
      codigo: opportunity?.identificador,
    },
    premissas: {
      geracao: null,
      cargas: undefined,
      topologia: null,
      tipoEstrutura: null,
      valorFinanciamento: null,
    },
    cliente: {
      nome: opportunity?.cliente?.nome || '',
      tipo: opportunity?.instalacao.tipoTitular == 'PESSOA JURÍDICA' ? 'CNPJ' : 'CPF',
      telefone: opportunity?.cliente?.telefonePrimario || '',
      cep: opportunity?.cliente?.cep,
      uf: opportunity?.cliente?.uf || '',
      cidade: opportunity?.cliente?.cidade || '',
      bairro: opportunity?.cliente?.bairro,
      endereco: opportunity?.cliente?.endereco,
      numeroOuIdentificador: opportunity?.cliente?.numeroOuIdentificador,
      cpfCnpj: opportunity?.cliente?.cpfCnpj || '',
      dataNascimento: opportunity?.cliente?.dataNascimento,
      email: opportunity?.cliente?.email || '',
      renda: null,
      profissao: null,
    },
    observacoes: '',
    dataInsercao: new Date().toISOString(),
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  // Charges
  function addCharge(charge: Charge) {
    const { descricao, qtde, horasFuncionamento, potencia } = charge;
    var chargesArr = [...(infoHolder.premissas.cargas || [])];
    chargesArr.push({ descricao, qtde, horasFuncionamento, potencia });
    setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, cargas: chargesArr } }));
    toast.success('Carga adicionada !');
    return;
  }
  function removeCharge(index: number) {
    var chargesArr = [...(infoHolder.premissas.cargas || [])];
    chargesArr.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, cargas: chargesArr } }));
    toast.success('Carga removida!');
    return;
  }
  // Call creation
  function validateFields() {
    if (!infoHolder.tipoSolicitacao) {
      toast.error('Preencha o tipo de solicitação desejada.');
      return false;
    }
    if (infoHolder.tipoSolicitacao == 'DUVIDAS E AUXILIOS TÉCNICOS') {
      if (infoHolder.observacoes.trim().length < 5) {
        toast.error('Preencha a dúvida/questionamento/demanda no campo de observações.');
        return false;
      }
    }
    if (infoHolder.tipoSolicitacao == 'PROPOSTA COMERCIAL (ON GRID)') {
      if (!infoHolder.projeto?.id) {
        toast.error('Vincule um projeto do CRM para requisitar uma proposta comercial.');
        return false;
      }
      if (!infoHolder.premissas.geracao || infoHolder.premissas.geracao <= 0) {
        toast.error('Preencha uma geração válida para requisitar uma proposta comercial.');
        return false;
      }
      if (!infoHolder.premissas.tipoEstrutura) {
        toast.error('Preencha o tipo de estrutura para requisitar uma proposta comercial.');
        return false;
      }
      if (!infoHolder.premissas.topologia) {
        toast.error('Preencha a topologia desejada para requisitar uma proposta comercial.');
        return false;
      }
    }
    if (infoHolder.tipoSolicitacao == 'PROPOSTA COMERCIAL (OFF GRID)') {
      if (!infoHolder.premissas.cargas || infoHolder.premissas.cargas?.length == 0) {
        toast.error('Adicione cargas para requisitar uma proposta comercial OFF GRID.');
        return false;
      }
    }
    if (infoHolder.tipoSolicitacao == 'ANÁLISE DE CRÉDITO') {
      if (!infoHolder.cliente.cpfCnpj || infoHolder.cliente.cpfCnpj.length < 14) {
        toast.error('Preencha um CPF/CNPJ válido.');
        return false;
      }
      if (!infoHolder.premissas.valorFinanciamento) {
        toast.error('Preencha o valor a ser financiado.');
        return false;
      }
      if (!infoHolder.cliente.renda || infoHolder.cliente.renda <= 0) {
        toast.error('Preencha a renda mensal média do cliente.');
        return false;
      }
      if (!infoHolder.cliente.profissao) {
        toast.error('Preencha a profissão do cliente.');
        return false;
      }
      const isCPF = infoHolder.cliente.cpfCnpj.length == 14;
      const isCNPJ = infoHolder.cliente.cpfCnpj.length == 18;
      if (!files.comprovanteEndereco) {
        toast.error('Anexe um arquivo de comprovante de endereço.');
        return false;
      }
      if (!files.comprovanteRenda) {
        toast.error('Anexe um arquivo de comprovante de renda do cliente ou representante legal.');
        return false;
      }
      if (!files.documentoPessoal) {
        toast.error('Anexe um arquivo de documento pessoal do cliente ou representante legal.');
        return false;
      }
      if (isCNPJ) {
        if (!files.cartaoCNPJ) {
          toast.error('Anexe o cartão CNPJ.');
          return false;
        }
        if (!files.contratoSocial) {
          toast.error('Anexe o arquivo do contrato social.');
          return false;
        }
        if (!files.declaracaoFaturamento) {
          toast.error('Anexe uma declaração de faturamento da empresa do cliente.');
          return false;
        }
      }
    }
    return true;
  }
  async function handleUploadFiles() {
    if (!files) {
      return;
    }
    var links: { title: string; link: string; format: string }[] = [];
    const uploadPromises = Object.keys(files).map(async (key) => {
      const file = files[key];
      if (!file) return;
      const storageStr = `chamadosPPS/${infoHolder.cliente.nome}/${filesIdentifier[key as keyof typeof filesIdentifier]}`;
      const fileRef = ref(storage, storageStr);
      const firebaseUploadResponse = await uploadBytes(fileRef, file);
      const uploadResult = firebaseUploadResponse as UploadResult;
      const fileUrl = await getDownloadURL(ref(storage, firebaseUploadResponse.metadata.fullPath));
      const linkObj = {
        title: filesIdentifier[key as keyof typeof filesIdentifier],
        link: fileUrl,
        format: fileTypes[uploadResult.metadata.contentType || '']?.title || 'NÃO DEFINIDO',
      };
      links.push(linkObj);
    });
    await Promise.all(uploadPromises);
    setInfoHolder((prev) => ({ ...prev, links: links }));
    return links;
  }
  async function handleCallCreation() {
    if (!validateFields()) return;
    const loadingToastId = toast.loading('Criando chamado...');
    try {
      const links = await handleUploadFiles();
      const response = await createPPSCall({ ...infoHolder, links: links });
      toast.dismiss(loadingToastId);
      toast.success(response);
      resetState();
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.dismiss(loadingToastId);
      toast.error(msg);
    }
  }
  function resetState() {
    setInfoHolder({
      status: 'PENDENTE',
      anotacoes: '',
      tipoSolicitacao: null,
      requerente: {
        idCRM: session?.user?.id || '',
        nomeCRM: session?.user.nome || '',
        apelido: '',
        avatar_url: session?.user.avatar_url || '',
      },
      projeto: {
        id: opportunity?._id,
        nome: opportunity?.nome,
        codigo: opportunity?.identificador,
      },
      premissas: {
        geracao: null,
        cargas: undefined,
        topologia: null,
        tipoEstrutura: null,
        valorFinanciamento: null,
      },
      cliente: {
        nome: opportunity?.cliente?.nome || '',
        tipo: opportunity?.instalacao.tipoTitular == 'PESSOA JURÍDICA' ? 'CNPJ' : 'CPF',
        telefone: opportunity?.cliente?.telefonePrimario || '',
        cep: opportunity?.cliente?.cep,
        uf: opportunity?.cliente?.uf || '',
        cidade: opportunity?.cliente?.cidade || '',
        bairro: opportunity?.cliente?.bairro,
        endereco: opportunity?.cliente?.endereco,
        numeroOuIdentificador: opportunity?.cliente?.numeroOuIdentificador,
        cpfCnpj: opportunity?.cliente?.cpfCnpj || '',
        dataNascimento: opportunity?.cliente?.dataNascimento,
        email: opportunity?.cliente?.email || '',
        renda: null,
        profissao: null,
      },
      observacoes: '',
      dataInsercao: new Date().toISOString(),
    });
  }
  return (
    <div id='newCost' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[90%] w-[60%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>NOVO CHAMADO</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex grow flex-col overflow-y-auto overscroll-y-auto py-4 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <div className='mt-4 flex items-center justify-center gap-4'>
              <div className='flex items-center gap-2'>
                <Avatar fallback={'U'} height={25} width={25} url={session?.user.avatar_url || undefined} />

                <p className='text-xs font-medium text-primary/50'>{session?.user.nome}</p>
              </div>
              <div className='flex items-center gap-2 text-primary/50'>
                <BsCalendarFill />
                <p className='text-xs font-medium'>{dayjs().format('DD/MM/YYYY HH:mm')}</p>
              </div>
            </div>
            <h1 className='mt-4 w-full rounded-md bg-primary/80 p-2 text-center font-bold text-white'>TIPO DE SOLICITAÇÃO</h1>
            <SelectInput
              label='TIPO DE SOLICITAÇÃO'
              showLabel={false}
              value={infoHolder.tipoSolicitacao}
              options={PPSCallTypes.map((type, index) => ({ id: index + 1, label: type.label, value: type.value }))}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, tipoSolicitacao: value }))}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => setInfoHolder((prev) => ({ ...prev, tipoSolicitacao: null }))}
              width='100%'
            />
            <h1 className='mt-4 w-full rounded-tl-md rounded-tr-md bg-primary/80 p-2 text-center font-bold text-white'>ANOTAÇÕES</h1>
            <textarea
              value={infoHolder.observacoes}
              onChange={(e) => setInfoHolder((prev) => ({ ...prev, observacoes: e.target.value }))}
              placeholder='`Preencha aqui as observações do chamado ou dúvidas.'
              className='h-fit min-h-[100px] grow resize-none bg-primary/30 p-3 text-center text-sm outline-hidden scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30 placeholder:italic'
            />
            {infoHolder.projeto ? (
              <>
                <h1 className='mt-4 w-full rounded-md bg-primary/80 p-2 text-center font-bold text-white'>PROJETO</h1>
                <div className='mt-4 flex flex-col items-center gap-1'>
                  <p className='w-full text-center font-Raleway font-bold text-[#fead41]'>#{infoHolder.projeto.codigo}</p>
                  <h1 className='w-full text-center font-Raleway text-xl font-bold leading-none tracking-tight'>{infoHolder.projeto.nome}</h1>
                </div>
              </>
            ) : null}
            <h1 className='mt-4 w-full rounded-md bg-primary/80 p-2 text-center font-bold text-white'>CLIENTE</h1>
            <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='NOME DO CLIENTE'
                  value={infoHolder?.cliente.nome || ''}
                  placeholder='Preencha aqui o nome do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, nome: value } }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='CPF/CNPJ DO CLIENTE'
                  value={infoHolder?.cliente.cpfCnpj || ''}
                  placeholder='Preencha aqui o CPF ou CNPJ do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, cpfCnpj: formatToCPForCNPJ(value) } }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='TELEFONE'
                  value={infoHolder?.cliente.telefone || ''}
                  placeholder='Preencha aqui o telefone do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, telefone: formatToPhone(value) } }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='EMAIL'
                  value={infoHolder?.cliente.email || ''}
                  placeholder='Preencha aqui o email do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, email: value } }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[50%]'>
                <DropdownSelect
                  resetOptionLabel='ESTADO'
                  categoryName='ESTADO'
                  value={infoHolder.cliente.uf ? Object.keys(stateCities).indexOf(infoHolder.cliente.uf) + 1 : null}
                  options={Object.keys(stateCities).map((state, index) => ({
                    id: index + 1,
                    label: state,
                    value: state,
                  }))}
                  onChange={(selectedItem) => {
                    const value = selectedItem.value as keyof typeof stateCities;
                    setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, uf: value } }));
                  }}
                  onReset={() => {
                    setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, uf: '' } }));
                  }}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[50%]'>
                <DropdownSelect
                  resetOptionLabel='CIDADE'
                  categoryName='CIDADE'
                  value={
                    infoHolder.cliente.cidade && infoHolder.cliente.uf
                      ? stateCities[infoHolder.cliente.uf as keyof typeof stateCities].indexOf(infoHolder.cliente.cidade)
                      : null
                  }
                  options={
                    infoHolder.cliente.uf
                      ? stateCities[infoHolder.cliente.uf as keyof typeof stateCities].map((city, index) => {
                          return {
                            id: index,
                            value: city,
                            label: city,
                          };
                        })
                      : null
                  }
                  onChange={(selectedItem) => {
                    setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, cidade: selectedItem.value } }));
                  }}
                  onReset={() => {
                    setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, cidade: '' } }));
                  }}
                  width='100%'
                />
              </div>
            </div>
            <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='BAIRRO'
                  value={infoHolder?.cliente.bairro || ''}
                  placeholder='Preencha aqui o bairro do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, bairro: value } }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='LOGRADOURO'
                  value={infoHolder?.cliente.endereco || ''}
                  placeholder='Preencha aqui o endereco do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, endereco: value } }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label='NÚMERO/IDENTIFICADOR'
                  value={infoHolder?.cliente.numeroOuIdentificador || ''}
                  placeholder='Preencha aqui o numero ou identificador do cliente'
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, numeroOuIdentificador: value } }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[50%]'>
                <DateInput
                  label='DATA DE NASCIMENTO'
                  value={infoHolder?.cliente.dataNascimento || ''}
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, dataNascimento: value } }))}
                  width='100%'
                />
              </div>
            </div>
            {infoHolder.tipoSolicitacao == 'ANÁLISE DE CRÉDITO' ? (
              <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='RENDA DO CLIENTE'
                    value={infoHolder?.cliente.renda || 0}
                    placeholder='Preencha aqui a renda do cliente'
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, renda: value } }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-[50%]'>
                  <TextInput
                    label='PROFISSÃO'
                    value={infoHolder?.cliente.profissao || ''}
                    placeholder='Preencha aqui a profissão do cliente'
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cliente: { ...prev.cliente, profissao: value } }))}
                    width='100%'
                  />
                </div>
              </div>
            ) : null}
            <h1 className='mt-4 w-full rounded-md bg-primary/80 p-2 text-center font-bold text-white'>PREMISSAS</h1>
            {infoHolder.tipoSolicitacao != 'ANÁLISE DE CRÉDITO' ? (
              <div className='mt-1 flex w-full flex-col items-center gap-2 lg:flex-row'>
                <div className='w-full lg:w-1/3'>
                  <NumberInput
                    label='GERAÇÃO (kWh)'
                    value={infoHolder?.premissas.geracao || 0}
                    placeholder='Preencha aqui a geração desejada'
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, geracao: value } }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-1/3'>
                  <SelectInput
                    label='TIPO DA ESTRUTURA'
                    value={infoHolder?.premissas.tipoEstrutura || ''}
                    options={structureTypes.map((type, index) => ({ id: index + 1, label: type.label, value: type.value }))}
                    handleChange={(value) =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        premissas: { ...prev.premissas, tipoEstrutura: value as IPPSCall['premissas']['tipoEstrutura'] },
                      }))
                    }
                    resetOptionLabel='NÃO DEFINIDO'
                    onReset={() => setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, tipoEstrutura: null } }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-1/3'>
                  <SelectInput
                    label='TOPOLOGIA'
                    value={infoHolder?.premissas.topologia || ''}
                    options={[
                      { id: 1, label: 'MICRO-INVERSOR', value: 'MICRO-INVERSOR' },
                      { id: 2, label: 'INVERSOR', value: 'INVERSOR' },
                    ]}
                    handleChange={(value) =>
                      setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, topologia: value as IKit['topologia'] } }))
                    }
                    resetOptionLabel='NÃO DEFINIDO'
                    onReset={() => setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, topologia: null } }))}
                    width='100%'
                  />
                </div>
              </div>
            ) : null}

            {infoHolder.tipoSolicitacao == 'ANÁLISE DE CRÉDITO' ? (
              <div className='mt-1 flex w-full items-center justify-center gap-2'>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='VALOR DO FINANCIAMENTO'
                    placeholder='Preencha o valor do financiamento...'
                    value={infoHolder.premissas?.valorFinanciamento || null}
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, valorFinanciamento: value } }))}
                    width='100%'
                  />
                </div>
              </div>
            ) : null}
            {infoHolder.tipoSolicitacao == 'PROPOSTA COMERCIAL (OFF GRID)' ? (
              <ChargeMenu charges={infoHolder.premissas.cargas} addCharge={addCharge} removeCharge={removeCharge} />
            ) : null}
            {infoHolder.tipoSolicitacao == 'ANÁLISE DE CRÉDITO' ? (
              <AttachFile files={files} setFiles={setFiles} clientIdentifier={infoHolder.cliente.cpfCnpj || ''} />
            ) : null}
          </div>
          <div className='my-2 flex w-full items-center justify-end gap-4 px-4'>
            <button onClick={() => handleCallCreation()} className='font-medium text-[#15599a] duration-300 ease-in-out hover:scale-110'>
              CRIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewCall;
