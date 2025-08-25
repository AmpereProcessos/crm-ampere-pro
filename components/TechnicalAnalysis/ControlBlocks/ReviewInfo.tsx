import CheckboxInput from '@/components/Inputs/CheckboxInput';
import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { storage } from '@/services/firebase';
import { fileTypes } from '@/utils/constants';
import { stateCities } from '@/utils/estados_cidades';
import { getCEPInfo } from '@/utils/methods';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import { AmperageOptions, EnergyMeterBoxModels, EnergyPAConnectionTypes, EnergyPATypes, StructureTypes } from '@/utils/select-options';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { UploadResult, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai';
import { BsClipboardCheckFill } from 'react-icons/bs';
import { ImAttachment } from 'react-icons/im';
import { IoMdBarcode } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import { TbBoxModel2, TbCategory2 } from 'react-icons/tb';
import RoofTilesImage from '../../../utils/images/roofTiles.png';
type ReviewInfoProps = {
  requestInfo: TTechnicalAnalysis;
  setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  requireFiles?: boolean;
  goToNextStage: () => void;
  files:
    | {
        [key: string]: {
          title: string;
          file: File | null | string;
        };
      }
    | undefined;
  setFiles: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: {
            title: string;
            file: File | null | string;
          };
        }
      | undefined
    >
  >;
  projectId?: string;
};
function getJoinedSystemInfo({ brand, qty, power }: { brand: string; qty: string; power: string }) {
  let splitBrand = brand.split('/');
  let splitQty = qty.split('/');
  let splitPower = power.split('/');
  let holder = [];
  for (let i = 0; i < splitBrand.length; i++) {
    const brandStr = splitBrand[i];
    const qtyStr = splitQty[i] ? splitQty[i] : 'NÃO DEFINIDO';
    const powerStr = splitPower[i] ? splitPower[i] : 'NÃO DEFINIDO';
    let str = `${qtyStr}x${brandStr}(${powerStr}W)`;
    holder.push(str);
  }
  return holder.join(' - ');
}
function getJoinedPAInfo({ type, amperage, meterNumber }: { type: string; amperage: string; meterNumber: string }) {
  let splitType = type.split('/');
  let splitAmperage = amperage.split('/');
  let splitMeterNumber = meterNumber.split('/');
  let holder = [];
  for (let i = 0; i < splitType.length; i++) {
    const typeStr = splitType[i];
    const amperageStr = splitAmperage[i] ? splitAmperage[i] : 'NÃO DEFINIDO';
    const meterNumberStr = splitMeterNumber[i] ? splitMeterNumber[i] : 'NÃO DEFINIDO';

    let str = `${typeStr} de ${amperageStr} com Nº(${meterNumberStr})`;
    holder.push(str);
  }
  return holder;
}
function ReviewInfo({ requestInfo, setRequestInfo, requireFiles = true, files, setFiles, goToNextStage, projectId }: ReviewInfoProps) {
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const {
    mutate: createTechAnalysisRequest,
    isLoading,
    isSuccess, //64adb93249f94d9354becb64
  } = useMutation({
    mutationKey: ['createTechAnalysisRequest'],
    mutationFn: async () => {
      var links = requestInfo.arquivos;
      try {
        if (requireFiles) {
          links = await uploadFiles();
        }

        const { data } = await axios.post(`/api/integration/app-ampere/technical-analysis`, {
          ...requestInfo,
          // idProjetoCRM: projectId,
          arquivos: links,
        });
        if (data.message) toast.success(data.message);
      } catch (error) {
        if (error instanceof AxiosError) {
          let errorMsg = error.response?.data.error.message;
          toast.error(errorMsg);
          return;
        }
        if (error instanceof Error) {
          let errorMsg = error.message;
          toast.error(errorMsg);
          return;
        }
      }
    },
  });
  const [paInfoHolder, setPaInfoHolder] = useState<TTechnicalAnalysis['padrao'][number]>({
    alteracao: false,
    tipo: 'CONTRA À REDE',
    tipoEntrada: 'AÉREO',
    tipoSaida: 'AÉREO',
    amperagem: '',
    ligacao: '',
    novaAmperagem: null,
    novaLigacao: null,
    codigoMedidor: '',
    modeloCaixaMedidor: null,
    codigoPosteDerivacao: null,
  });
  function addEnergyPA() {
    const energyPAList = requestInfo.padrao ? [...requestInfo.padrao] : [];
    energyPAList.push(paInfoHolder);
    setRequestInfo((prev) => ({ ...prev, padrao: energyPAList }));
    setPaInfoHolder({
      alteracao: false,
      tipo: 'CONTRA À REDE',
      tipoEntrada: 'AÉREO',
      tipoSaida: 'AÉREO',
      amperagem: '',
      ligacao: '',
      novaAmperagem: null,
      novaLigacao: null,
      codigoMedidor: '',
      modeloCaixaMedidor: null,
      codigoPosteDerivacao: null,
    });
    return toast.success('Padrão adicionado com sucesso.');
  }
  function removeEnergyPA(index: number) {
    const energyPAList = requestInfo.padrao ? [...requestInfo.padrao] : [];
    energyPAList.splice(index, 1);
    setRequestInfo((prev) => ({ ...prev, padrao: energyPAList }));
    return toast.success('Padrão removido com sucesso.');
  }
  // async function uploadFiles() {
  //   if (!files) return;
  //   try {
  //     setUploadingFiles(true);
  //     var links: { title: string; link: string; format: string }[] = [];
  //     Object.keys(files).forEach(async (key) => {
  //       const fileObj = files[key];
  //       const fileRef = ref(
  //         storage,
  //         `clientes/${requestInfo.nomeDoCliente}-${requestInfo.codigoSVB}/${
  //           fileObj.title
  //         }${(Math.random() * 10000).toFixed(0)}`
  //       );
  //       if (typeof fileObj.file == "string" || fileObj.file == null) return;
  //       // @ts-ignore
  //       const firebaseRes = await uploadBytes(fileRef, fileObj);
  //       const uploadResult = firebaseRes as UploadResult;
  //       let fileUrl = await getDownloadURL(
  //         ref(storage, firebaseRes.metadata.fullPath)
  //       );
  //       console.log("ARQUIVO", fileUrl);
  //       links.push({
  //         title: fileObj.title,
  //         link: fileUrl,
  //         format:
  //           uploadResult.metadata.contentType &&
  //           fileTypes[uploadResult.metadata.contentType]
  //             ? fileTypes[uploadResult.metadata.contentType].title
  //             : "INDEFINIDO",
  //       });
  //     });
  //     setRequestInfo((prev) => ({ ...prev, links: links }));
  //     setUploadingFiles(false);
  //     createTechAnalysisRequest();
  //     return links;
  //   } catch (error) {
  //     toast.error(
  //       "Houve um erro ao fazer upload dos arquivos, por favor, tente novamente."
  //     );
  //   }
  // }
  async function uploadFiles() {
    if (!files) return [];

    try {
      setUploadingFiles(true);
      var links: { descricao: string; url: string; formato: string }[] = [];

      // Create an array to store all the promises for file uploads
      const uploadPromises = Object.keys(files).map(async (key) => {
        const fileObj = files[key];
        var fileRef = ref(
          storage,
          `clientes/${requestInfo.nome}-${requestInfo.projeto?.identificador || 'NA'}/${fileObj.title}-${(Math.random() * 10000).toFixed(0)}`
        );

        if (typeof fileObj.file == 'string' || fileObj.file == null) return;
        const firebaseRes = await uploadBytes(fileRef, fileObj.file);
        const uploadResult = firebaseRes as UploadResult;
        const fileUrl = await getDownloadURL(ref(storage, firebaseRes.metadata.fullPath));

        links.push({
          descricao: fileObj.title,
          url: fileUrl,
          formato:
            uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
              ? fileTypes[uploadResult.metadata.contentType].title
              : 'INDEFINIDO',
        });
      });

      // Wait for all file upload promises to resolve
      await Promise.all(uploadPromises);

      setRequestInfo((prev) => ({ ...prev, arquivos: links }));
      setUploadingFiles(false);

      // Return the links array after all files are uploaded
      return links;
    } catch (error) {
      toast.error('Houve um erro ao fazer upload dos arquivos, por favor, tente novamente.');
      throw error;
    }
  }
  async function setAddressDataByCEP(cep: string) {
    const addressInfo = await getCEPInfo(cep);
    const toastID = toast.loading('Buscando informações sobre o CEP...', {
      duration: 2000,
    });
    setTimeout(() => {
      if (addressInfo) {
        toast.dismiss(toastID);
        toast.success('Dados do CEP buscados com sucesso.', {
          duration: 1000,
        });
        setRequestInfo((prev) => ({
          ...prev,
          localizacao: {
            ...prev.localizacao,
            endereco: addressInfo.logradouro,
            bairro: addressInfo.bairro,
            uf: addressInfo.uf as keyof typeof stateCities,
            cidade: addressInfo.localidade.toUpperCase(),
          },
        }));
      }
    }, 1000);
  }
  if (isSuccess)
    return (
      <div className='flex w-full grow flex-col items-center justify-center gap-4'>
        <BsClipboardCheckFill style={{ color: 'rgb(34,197,94)', fontSize: '60px' }} />
        <h1 className='text-lg font-medium italic text-primary/60'>Solicitação criada com sucesso !</h1>
      </div>
    );
  else
    return (
      <div className='flex w-full grow flex-col bg-background px-2'>
        <span className='py-2 text-center text-xl font-bold uppercase text-green-500'>REVISÃO DAS INFORMAÇÕES</span>
        <div className='w-full grow flex-col'>
          <div className='flex w-full grow flex-col bg-background px-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS GERAIS</span>
            <div className='flex w-full grow flex-col gap-2'>
              <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                <div className='flex w-full items-center justify-center self-center lg:w-[50%]'>
                  <TextInput
                    label={'NOME DO CLIENTE'}
                    placeholder='Digite aqui o nome do cliente...'
                    width={'100%'}
                    value={requestInfo.nome}
                    handleChange={(value) => setRequestInfo((prev) => ({ ...prev, nome: value }))}
                  />
                </div>
              </div>
              <div className='flex w-full items-center justify-center'>
                <div className='w-full lg:w-[450px]'>
                  <TextInput
                    label={'CEP'}
                    placeholder='Digite aqui o nome do cliente...'
                    width={'100%'}
                    value={requestInfo.localizacao.cep || ''}
                    handleChange={(value) => {
                      if (value.length == 9) {
                        setAddressDataByCEP(value);
                      }
                      setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cep: value } }));
                    }}
                  />
                </div>
              </div>
              <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                <div className='flex w-full items-center justify-center lg:w-[50%]'>
                  <SelectInput
                    width={'100%'}
                    label={'UF'}
                    editable={true}
                    options={Object.keys(stateCities).map((state, index) => ({
                      id: index + 1,
                      label: state,
                      value: state,
                    }))}
                    value={requestInfo.localizacao.uf}
                    handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: value } }))}
                    resetOptionLabel='NÃO DEFINIDO'
                    onReset={() => {
                      setRequestInfo((prev) => ({ ...prev, uf: undefined }));
                    }}
                  />
                </div>
                <div className='flex w-full items-center justify-center lg:w-[50%]'>
                  <SelectInput
                    width={'100%'}
                    label={'CIDADE'}
                    editable={true}
                    value={requestInfo.localizacao.cidade}
                    options={
                      requestInfo.localizacao.uf
                        ? stateCities[requestInfo.localizacao.uf as keyof typeof stateCities].map((city, index) => {
                            return {
                              id: index,
                              value: city,
                              label: city,
                            };
                          })
                        : null
                    }
                    handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))}
                    onReset={() => {
                      setRequestInfo((prev) => ({
                        ...prev,
                        cidade: undefined,
                      }));
                    }}
                    resetOptionLabel='NÃO DEFINIDO'
                  />
                </div>
              </div>
              <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                <div className='flex w-full items-center justify-center lg:w-[50%]'>
                  <TextInput
                    label={'BAIRRO'}
                    placeholder='Digite aqui o bairro do cliente..'
                    width={'100%'}
                    value={requestInfo.localizacao.bairro}
                    handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))}
                  />
                </div>
                <div className='flex w-full items-center justify-center lg:w-[50%]'>
                  <TextInput
                    label={'LOGRADOURO'}
                    placeholder='Digite o logradouro do cliente...'
                    width={'100%'}
                    value={requestInfo.localizacao.endereco}
                    handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))}
                  />
                </div>
              </div>
              <div className='flex w-full items-center justify-center'>
                <div className='w-full lg:w-[450px]'>
                  <TextInput
                    label={'NÚMERO OU IDENTIFICADOR'}
                    placeholder='Digite aqui o número/identificador da residência...'
                    width={'100%'}
                    value={requestInfo.localizacao.numeroOuIdentificador}
                    handleChange={(value) => {
                      setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col  bg-background pb-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DO SISTEMA</span>
            <p className='text-center text-lg italic text-primary/70'>
              {getJoinedSystemInfo({
                brand: requestInfo.equipamentos.modulos.modelo || '',
                qty: requestInfo.equipamentos.modulos.qtde || '',
                power: requestInfo.equipamentos.modulos.potencia || '',
              })}
            </p>
          </div>
          <div className='flex w-full flex-col  bg-background pb-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DO PADRÃO</span>
            <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/4'>
                <SelectInput
                  label='LIGAÇÃO'
                  options={[
                    { id: 1, label: 'MONOFÁSICO', value: 'MONOFÁSICO' },
                    { id: 2, label: 'BIFÁSICO', value: 'BIFÁSICO' },
                    { id: 3, label: 'TRIFÁSICO', value: 'TRIFÁSICO' },
                  ]}
                  value={paInfoHolder.ligacao}
                  handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, ligacao: value }))}
                  onReset={() => setPaInfoHolder((prev) => ({ ...prev, ligacao: '' }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/4'>
                <SelectInput
                  label='AMPERAGEM'
                  options={AmperageOptions}
                  value={paInfoHolder.amperagem}
                  handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, amperagem: value }))}
                  onReset={() => setPaInfoHolder((prev) => ({ ...prev, amperagem: '' }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/4'>
                <SelectInput
                  label='TIPO'
                  options={EnergyPATypes}
                  value={paInfoHolder.tipo}
                  handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipo: value }))}
                  onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipo: 'CONTRA À REDE' }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  width={'100%'}
                />
              </div>
              {requestInfo.localizacao?.uf == 'GO' ? (
                <div className='w-full lg:w-1/4'>
                  <TextInput
                    label={'CÓDIGO DO POSTE DE DERIVAÇÃO'}
                    placeholder={'Preencha o código do poste de derivação...'}
                    value={paInfoHolder.codigoPosteDerivacao || ''}
                    handleChange={(value) => {
                      setPaInfoHolder((prev) => ({ ...prev, codigoPosteDerivacao: value }));
                    }}
                    width={'100%'}
                  />
                </div>
              ) : null}
            </div>
            <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/4'>
                <SelectInput
                  label='TIPO DO RAMAL DE ENTRADA'
                  options={EnergyPAConnectionTypes}
                  value={paInfoHolder.tipoEntrada}
                  handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: value }))}
                  onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: 'AÉREO' }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/4'>
                <SelectInput
                  label='TIPO DO RAMAL DE ENTRADA'
                  options={EnergyPAConnectionTypes}
                  value={paInfoHolder.tipoSaida}
                  handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: value }))}
                  onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: 'AÉREO' }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/4'>
                <TextInput
                  label={'CÓDIGO DO MEDIDOR'}
                  placeholder={'Preencha o código do medidor de energia...'}
                  value={paInfoHolder.codigoMedidor || ''}
                  handleChange={(value) => {
                    setPaInfoHolder((prev) => ({ ...prev, codigoMedidor: value }));
                  }}
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/4'>
                <SelectInput
                  label='MODELO DA CAIXA DO INVERSOR'
                  options={EnergyMeterBoxModels}
                  value={paInfoHolder.modeloCaixaMedidor}
                  handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: value }))}
                  onReset={() => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: null }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  width={'100%'}
                />
              </div>
            </div>
            <div className='mt-2 flex w-full items-center justify-end'>
              <button
                onClick={addEnergyPA}
                className='rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-primary-foreground'
              >
                ADICIONAR ITEM
              </button>
            </div>
            <div className='mt-2 flex w-full flex-col gap-2'>
              {requestInfo.padrao.map((paInfo, index) => (
                <div key={index} className='flex w-full flex-col border border-primary/30 p-2 shadow-md'>
                  <div className='flex w-full items-center justify-between'>
                    <h1 className='font-medium leading-none tracking-tight text-primary/70'>
                      PADRÃO <strong className='text-[#fead41]'>{paInfo.ligacao} </strong> de{' '}
                      <strong className='text-[#fead41]'>{paInfo.amperagem}</strong>
                    </h1>
                    <button
                      onClick={() => removeEnergyPA(index)}
                      className='w-fit cursor-pointer text-[20px] text-red-500 opacity-40 duration-300 ease-in hover:scale-110 hover:text-red-500 hover:opacity-100'
                    >
                      <MdDelete />
                    </button>
                  </div>

                  <div className='mt-2 flex w-full flex-wrap items-center justify-around'>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <TbCategory2 />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>TIPO:</strong> {paInfo.tipo}
                      </p>
                    </div>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <AiOutlineArrowDown />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>ENTRADA:</strong> {paInfo.tipoEntrada}
                      </p>
                    </div>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <AiOutlineArrowUp />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>SAÍDA:</strong> {paInfo.tipoSaida}
                      </p>
                    </div>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <IoMdBarcode />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>Nº DO MEDIDOR:</strong> {paInfo.codigoMedidor}
                      </p>
                    </div>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <TbBoxModel2 />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>MODELO DA CAIXA:</strong>: {paInfo.modeloCaixaMedidor || 'NÃO DEFINIDO'}
                      </p>
                    </div>
                    {paInfo.codigoPosteDerivacao ? (
                      <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                        <IoMdBarcode />
                        <p className='text-xs lg:text-sm'>
                          <strong className='text-cyan-500'>Nº DO POSTE DE DERIVAÇÃO:</strong> {paInfo.codigoPosteDerivacao}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='flex w-full flex-col  bg-background pb-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DO TRANSFORMADOR</span>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/3'>
                <CheckboxInput
                  width='100%'
                  labelFalse='TRANSFORMADOR E PADRÃO ACOPLADOS'
                  labelTrue='TRANSFORMADOR E PADRÃO ACOPLADOS'
                  checked={requestInfo.transformador.acopladoPadrao}
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, transformador: { ...prev.transformador, acopladoPadrao: value } }))}
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <NumberInput
                  width='100%'
                  label='POTÊNCIA DO TRANSFORMADOR'
                  placeholder='Preencha aqui a potência do transformador...'
                  value={requestInfo.transformador.potencia}
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, transformador: { ...prev.transformador, potencia: value } }))}
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  width='100%'
                  label='Nº DO TRANSFORMADOR'
                  placeholder='Preencha o número transformador...'
                  value={requestInfo.transformador.codigo}
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, transformador: { ...prev.transformador, codigo: value } }))}
                />
              </div>
            </div>
          </div>
          <div className='flex w-full flex-col  bg-background pb-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DO ESTRUTURA</span>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <SelectInput
                  label='ESTRUTURA DE MONTAGEM'
                  width='100%'
                  value={requestInfo.detalhes?.tipoEstrutura}
                  options={StructureTypes}
                  resetOptionLabel='NÃO DEFINIDO'
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        tipoEstrutura: value,
                      },
                    }))
                  }
                  onReset={() =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        tipoEstrutura: null,
                      },
                    }))
                  }
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <SelectInput
                  label='TIPO DA ESTRUTURA'
                  width='100%'
                  value={requestInfo.detalhes?.materialEstrutura}
                  options={[
                    { id: 1, label: 'MADEIRA', value: 'MADEIRA' },
                    { id: 2, label: 'FERRO', value: 'FERRO' },
                  ]}
                  resetOptionLabel='NÃO DEFINIDO'
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        materialEstrutura: value,
                      },
                    }))
                  }
                  onReset={() =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        materialEstrutura: null,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <SelectInput
                  label='TIPO DA TELHA'
                  width='100%'
                  value={requestInfo.detalhes?.tipoTelha}
                  options={[
                    { id: 1, label: 'PORTUGUESA', value: 'PORTUGUESA' },
                    { id: 2, label: 'FRANCESA', value: 'FRANCESA' },
                    { id: 3, label: 'ROMANA', value: 'ROMANA' },
                    { id: 4, label: 'CIMENTO', value: 'CIMENTO' },
                    { id: 5, label: 'ETHERNIT', value: 'ETHERNIT' },
                    { id: 6, label: 'SANDUÍCHE', value: 'SANDUÍCHE' },
                    { id: 7, label: 'AMERICANA', value: 'AMERICANA' },
                    { id: 8, label: 'ZINCO', value: 'ZINCO' },
                    { id: 9, label: 'CAPE E BICA', value: 'CAPE E BICA' },
                    {
                      id: 9,
                      label: 'ESTRUTURA DE SOLO',
                      value: 'ESTRUTURA DE SOLO',
                    },
                  ]}
                  resetOptionLabel='NÃO DEFINIDO'
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        tipoTelha: value,
                      },
                    }))
                  }
                  onReset={() =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        tipoTelha: null,
                      },
                    }))
                  }
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <SelectInput
                  label='CLIENTE POSSUIU TELHAS RESERVAS ?'
                  width='100%'
                  value={requestInfo.detalhes?.telhasReservas}
                  options={[
                    { id: 1, label: 'SIM', value: 'SIM' },
                    { id: 3, label: 'NÃO', value: 'NÃO' },
                  ]}
                  resetOptionLabel='NÃO DEFINIDO'
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        telhasReservas: value,
                      },
                    }))
                  }
                  onReset={() =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        telhasReservas: null,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className='my-3 flex h-[165px] w-[300px] flex-col items-center justify-center self-center border border-primary/30 p-1 py-2 lg:h-[250px] lg:w-[450px]'>
              <h1 className='text-sm font-bold text-[#fead41]'>TIPOS DE TELHAS</h1>
              <Image src={RoofTilesImage} alt='Tipos de Telhas' width={300} height={145} />
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='LINK DE ARQUIVOS AUXILIARES (EX: PASTA FOTOS DE DRONE)'
                  width='100%'
                  value={requestInfo.arquivosAuxiliares || ''}
                  placeholder='Preencha aqui o link para uma pasta na nuvem dos arquivos auxiliares.'
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      arquivosAuxiliares: value,
                    }))
                  }
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='ORIENTAÇÃO DOS MÓDULOS'
                  width='100%'
                  value={requestInfo.detalhes?.orientacao ? requestInfo.detalhes?.orientacao : ''}
                  placeholder='Preencha aqui a orientação dos módulos. (EX: 10° NORTE)'
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      detalhes: {
                        ...prev.detalhes,
                        orientacao: value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className='flex w-full flex-col  bg-background pb-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DA INSTALAÇÃO</span>
            <div className='flex w-full flex-col gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='LOCAL DE ATERRAMENTO'
                  placeholder='Preencha o local de aterramento...'
                  value={requestInfo.locais.aterramento || ''}
                  handleChange={(value) => {
                    setRequestInfo((prev) => ({ ...prev, locais: { ...prev.locais, aterramento: value } }));
                  }}
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='LOCAL DE INSTALAÇÃO DO(S) INVERSOR(ES)'
                  placeholder='Preencha o local de instalação do(s) inversor(es)...'
                  value={requestInfo.locais.inversor || ''}
                  handleChange={(value) => {
                    setRequestInfo((prev) => ({ ...prev, locais: { ...prev.locais, inversor: value } }));
                  }}
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='LOCAL DE INSTALAÇÃO DOS MÓDULOS'
                  placeholder='Preencha o local de instalação dos módulos...'
                  value={requestInfo.locais.modulos || ''}
                  handleChange={(value) => {
                    setRequestInfo((prev) => ({ ...prev, locais: { ...prev.locais, modulos: value } }));
                  }}
                  width={'100%'}
                />
              </div>
            </div>
            <div className='flex w-full flex-col gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='DISTANCIA DO INVERSOR AO PADRÃO'
                  placeholder='Preencha a distância para cabeamento CA...'
                  value={requestInfo.distancias.cabeamentoCA || ''}
                  handleChange={(value) => {
                    setRequestInfo((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCA: value } }));
                  }}
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='DISTANCIA DOS MÓDULOS AO INVERSOR'
                  placeholder='Preencha a distância para cabeamento CC..'
                  value={requestInfo.distancias.cabeamentoCC || ''}
                  handleChange={(value) => {
                    setRequestInfo((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCC: value } }));
                  }}
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='DISTÂNCIA DO INVERSOR ATÉ O ROTEADOR'
                  placeholder='Preencha a distância do comunicador ao roteador...'
                  value={requestInfo.distancias.conexaoInternet || ''}
                  handleChange={(value) => {
                    setRequestInfo((prev) => ({ ...prev, distancias: { ...prev.distancias, conexaoInternet: value } }));
                  }}
                  width={'100%'}
                />
              </div>
            </div>
            <div className='flex w-full flex-col'>
              <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-primary-foreground'>OBSERVAÇÕES</h1>
              <textarea
                placeholder='SEM OBSERVAÇÕES PREENCHIDAS...'
                value={requestInfo.comentarios || ''}
                onChange={(e) => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    comentarios: e.target.value,
                  }));
                }}
                className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
              />
            </div>
          </div>
          {requestInfo.tipoSolicitacao == 'VISITA TÉCNICA REMOTA - RURAL' ? (
            <div className='flex w-full flex-col  bg-background pb-2'>
              <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>SERVIÇOS ADICIONAIS</span>
              <div className='flex w-full grow flex-col gap-2'>
                <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'CASA DE MÁQUINAS'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.casaDeMaquinas}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, casaDeMaquinas: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, casaDeMaquinas: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'ALAMBRADO'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.alambrado}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, alambrado: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, alambrado: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                </div>
                <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'BRITAGEM'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.britagem}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, britagem: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, britagem: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'CONSTRUÇÃO DE BARRACÃO'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.barracao}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, barracao: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, barracao: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                </div>
                <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'INSTALAÇÃO DE ROTEADOR'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.roteador}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, roteador: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, roteador: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'REDE DE RELIGAÇÃO DA FAZENDA'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.redeReligacao}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, redeReligacao: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, redeReligacao: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                </div>
                <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'LIMPEZA DO LOCAL DA USINA DE SOLO'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.limpezaLocal}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, limpezaLocal: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, limpezaLocal: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                  <div className='flex w-full items-center justify-center lg:w-[50%]'>
                    <SelectInput
                      width={'100%'}
                      label={'TERRAPLANAGEM PARA USINA DE SOLO'}
                      editable={true}
                      value={requestInfo.servicosAdicionais.terraplanagem}
                      options={[
                        {
                          id: 1,
                          label: 'SIM - RESPONSABILIDADE DA EMPRESA',
                          value: 'SIM - RESPONSABILIDADE DA EMPRESA',
                        },
                        {
                          id: 2,
                          label: 'SIM - RESPONSABILIDADE DO CLIENTE',
                          value: 'SIM - RESPONSABILIDADE DO CLIENTE',
                        },
                        { id: 3, label: 'NÃO', value: 'NÃO' },
                      ]}
                      handleChange={(value) =>
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, terraplanagem: value } }))
                      }
                      onReset={() => {
                        setRequestInfo((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, terraplanagem: null } }));
                      }}
                      resetOptionLabel='NÃO DEFINIDO'
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className='w-fll flex flex-col bg-background pb-2'>
            <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>ARQUIVOS</span>
            {files
              ? Object.keys(files).map((key, index) => {
                  return (
                    <div key={index} className='flex items-center justify-center gap-2'>
                      <p className='text-sm italic text-primary/70'>{files[key].title}</p>
                      <ImAttachment />
                    </div>
                  );
                })
              : requestInfo.arquivos.map((file, index) => (
                  <div key={index} className='flex items-center justify-center gap-2'>
                    <p className='text-sm italic text-primary/70'>{file.descricao}</p>
                    <ImAttachment />
                  </div>
                ))}
          </div>
        </div>
        <div className='mt-2 flex w-full flex-wrap justify-end  gap-2'>
          {/* <button
            onClick={() => {
              goToPreviousStage();
            }}
            className="rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105"
          >
            Voltar
          </button> */}
          <button
            disabled={isLoading || isSuccess || uploadingFiles}
            className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
            onClick={() => {
              createTechAnalysisRequest();
            }}
          >
            {isLoading ? 'Criando solicitação...' : null}
            {isSuccess ? 'Criação concluida!' : null}
            {!isLoading && !isSuccess && !uploadingFiles ? 'Criar solicitação' : null}
          </button>
        </div>
      </div>
    );
}

export default ReviewInfo;
