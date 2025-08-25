import { storage } from '@/services/firebase';
import { fileTypes } from '@/utils/constants';
import { isFile } from '@/utils/methods';
import { IContractRequest, IProposeInfo } from '@/utils/models';
import { TProjectDTO } from '@/utils/schemas/project.schema';
import { FullMetadata, UploadResult, getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsCheckCircleFill } from 'react-icons/bs';

function formatLongString(str: string) {
  if (str.length > 35) {
    return str.substring(0, 35) + '\u2026';
  } else {
    return str;
  }
}
async function getPreviouslyAttachedFiles(
  links: { title: string; link: string; format: string }[],
  attachments: TProjectDTO['anexos'],
  proposeFileLink?: string
) {
  if (attachments) {
    if (attachments.contaDeEnergia) {
      let fileRef = ref(storage, attachments.contaDeEnergia);
      const metadata = await getMetadata(fileRef);
      const md = metadata as FullMetadata;
      links.push({
        title: 'CONTA DE ENERGIA',
        link: attachments.contaDeEnergia,
        format: metadata.contentType && fileTypes[metadata.contentType] ? fileTypes[metadata.contentType].title : 'INDEFINIDO',
      });
    }
    if (attachments.documentoComFoto) {
      let fileRef = ref(storage, attachments.documentoComFoto);
      const metadata = await getMetadata(fileRef);
      const md = metadata as FullMetadata;
      links.push({
        title: 'DOCUMENTO COM FOTO',
        link: attachments.documentoComFoto,
        format: metadata.contentType && fileTypes[metadata.contentType] ? fileTypes[metadata.contentType].title : 'INDEFINIDO',
      });
    }
    if (attachments.iptu) {
      let fileRef = ref(storage, attachments.iptu);
      const metadata = await getMetadata(fileRef);
      const md = metadata as FullMetadata;
      links.push({
        title: 'IPTU',
        link: attachments.iptu,
        format: metadata.contentType && fileTypes[metadata.contentType] ? fileTypes[metadata.contentType].title : 'INDEFINIDO',
      });
    }
    if (proposeFileLink) {
      let fileRef = ref(storage, proposeFileLink);
      const metadata = await getMetadata(fileRef);
      const md = metadata as FullMetadata;
      links.push({
        title: 'PROPOSTA COMERCIAL',
        link: proposeFileLink,
        format: metadata.contentType && fileTypes[metadata.contentType] ? fileTypes[metadata.contentType].title : 'INDEFINIDO',
      });
    }
  }
  return links;
}

type DocumentAttachmentInfoProps = {
  projectInfo?: TProjectDTO;
  requestInfo: IContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<IContractRequest>>;
  sameProjectHolder: boolean;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
  proposeInfo: IProposeInfo;
  documentsFile: { [key: string]: File | string | null };
  setDocumentsFile: React.Dispatch<React.SetStateAction<{ [key: string]: File | string | null }>>;
};
function DocumentAttachmentInfo({
  projectInfo,
  requestInfo,
  setRequestInfo,
  sameProjectHolder,
  goToPreviousStage,
  goToNextStage,
  proposeInfo,
  documentsFile,
  setDocumentsFile,
}: DocumentAttachmentInfoProps) {
  const savingRef = projectInfo ? `formSolicitacao/${projectInfo.nome}` : `formSolicitacao/naodefinido`;
  const [files, setFiles] = useState<{ [key: string]: File | null | string }>({
    contaDeEnergia: projectInfo?.anexos?.contaDeEnergia ? projectInfo?.anexos?.contaDeEnergia : null,
    documentoComFoto: projectInfo?.anexos?.documentoComFoto ? projectInfo?.anexos?.documentoComFoto : null,
    iptu: projectInfo?.anexos?.iptu ? projectInfo?.anexos?.iptu : null,
    propostaComercial: proposeInfo.linkArquivo ? proposeInfo.linkArquivo : null,
  });
  const [uploadOK, setUploadOK] = useState<boolean | 'loading'>(false);
  function validateDocuments() {
    // Checking for general documents attachment
    if (requestInfo.tipoDaLigacao == 'EXISTENTE' && !files.contaDeEnergia) {
      toast.error('Por favor, anexe a conta de energia do cliente.');
      return false;
    }
    if (!files.laudo) {
      toast.error('Por favor, anexe o laudo técnico.');
      return false;
    }
    if (!files.propostaComercial) {
      toast.error('Por favor, anexe a proposta comercial.');
      return false;
    }
    if (!files.comprovanteEnderecoCorrespondente) {
      toast.error('Por favor, anexe um comprovante de endereço (de correspondência) do cliente.');
      return false;
    }
    // Check based on conditions of the contract
    if (requestInfo.tipoDaInstalacao == 'RURAL') {
      if (!files.car) {
        toast.error('Por favor, anexe o CAR.');
        return false;
      }
      if (!files.matricula) {
        toast.error('Por favor, anexe a matrícula de inscrição rural.');
        return false;
      }
    }
    if (requestInfo.tipoDaInstalacao == 'URBANO') {
      if (!files.iptu) {
        toast.error('Por favor, anexe o IPTU.');
      }
    }
    if (requestInfo.tipoDoTitular == 'PESSOA FISICA') {
      if (!files.documentoComFoto) {
        toast.error('Por favor, anexe o documento com foto do cliente.');
        return false;
      }
    }
    if (requestInfo.tipoDoTitular == 'PESSOA JURIDICA') {
      if (!files.contratoSocial) {
        toast.error('Por favor, anexe o contrato social.');
        return false;
      }
      if (!files.cartaoCnpj) {
        toast.error('Por favor, anexe o cartão CNPJ.');
        return false;
      }
      if (!files.comprovanteEnderecoRepresentante) {
        toast.error('Por favor, anexe o comprovante de endereço do representante legal.');
        return false;
      }
      if (!files.documentoComFotoSocios) {
        toast.error('Por favor, anexe documentos com foto dos sócios.');
        return false;
      }
    }
    return true;
  }
  async function uploadFiles() {
    if (validateDocuments()) {
      var holder;
      var links: { title: string; link: string; format: string }[] = [];
      const toastID = toast.loading('Enviando arquivos...');
      try {
        setUploadOK('loading');
        if (files.contaDeEnergia && typeof files.contaDeEnergia != 'string') {
          var imageRef = ref(storage, `${savingRef}/contaDeEnergia${(Math.random() * 10000).toFixed(0)}`);
          let res = await uploadBytes(imageRef, files.contaDeEnergia);
          const uploadResult = res as UploadResult;

          let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
          links.push({
            title: 'CONTA DE ENERGIA',
            link: url,
            format:
              uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                ? fileTypes[uploadResult.metadata.contentType].title
                : 'INDEFINIDO',
          });
        }
        if (files.laudo && typeof files.laudo != 'string') {
          var imageRef = ref(storage, `${savingRef}/laudo${(Math.random() * 10000).toFixed(0)}`);
          let res = await uploadBytes(imageRef, files.laudo);
          const uploadResult = res as UploadResult;
          let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
          links.push({
            title: 'LAUDO',
            link: url,
            format:
              uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                ? fileTypes[uploadResult.metadata.contentType].title
                : 'INDEFINIDO',
          });
        }
        if (files.propostaComercial && typeof files.propostaComercial != 'string') {
          var imageRef = ref(storage, `${savingRef}/propostaComercial${(Math.random() * 10000).toFixed(0)}`);
          let res = await uploadBytes(imageRef, files.propostaComercial);
          const uploadResult = res as UploadResult;
          let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
          links.push({
            title: 'PROPOSTA COMERCIAL',
            link: url,
            format:
              uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                ? fileTypes[uploadResult.metadata.contentType].title
                : 'INDEFINIDO',
          });
        }
        if (files.comprovanteEnderecoCorrespondente && typeof files.comprovanteEnderecoCorrespondente != 'string') {
          var imageRef = ref(
            storage,
            `formSolicitacao/${requestInfo.nomeDoContrato}/comprovanteEnderecoCorrespondente${(Math.random() * 10000).toFixed(0)}`
          );
          let res = await uploadBytes(imageRef, files.comprovanteEnderecoCorrespondente);
          let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
          const uploadResult = res as UploadResult;
          links.push({
            title: 'COMPROVANTE DE ENDEREÇO - CORRESPONDÊNCIA',
            link: url,
            format:
              uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                ? fileTypes[uploadResult.metadata.contentType].title
                : 'INDEFINIDO',
          });
        }
        if (requestInfo.tipoDaInstalacao == 'RURAL') {
          if (files.car && typeof files.car != 'string') {
            var imageRef = ref(storage, `${savingRef}/car${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.car);
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            const uploadResult = res as UploadResult;
            links.push({
              title: 'CAR',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
          if (files.matricula && typeof files.matricula != 'string') {
            var imageRef = ref(storage, `${savingRef}/matricula${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.matricula);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'MATRÍCULA',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
        }
        if (requestInfo.tipoDaInstalacao == 'URBANO') {
          if (files.iptu && typeof files.iptu != 'string') {
            var imageRef = ref(storage, `${savingRef}/iptu${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.iptu);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'IPTU',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
        }
        if (requestInfo.tipoDoTitular == 'PESSOA FISICA') {
          if (files.documentoComFoto && typeof files.documentoComFoto != 'string') {
            var imageRef = ref(storage, `${savingRef}/documentoComFoto${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.documentoComFoto);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'DOCUMENTO COM FOTO',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
          if (!sameProjectHolder) {
            if (files.documentoFotoTitularInstalacao && typeof files.documentoFotoTitularInstalacao != 'string') {
              var imageRef = ref(storage, `${savingRef}/documentoFotoTitularInstalacao${(Math.random() * 10000).toFixed(0)}`);
              let res = await uploadBytes(imageRef, files.documentoFotoTitularInstalacao);
              const uploadResult = res as UploadResult;
              let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
              links.push({
                title: 'DOCUMENTO COM FOTO - TITULAR DA INSTALAÇÃO',
                link: url,
                format:
                  uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                    ? fileTypes[uploadResult.metadata.contentType].title
                    : 'INDEFINIDO',
              });
            }
          }
        }
        if (requestInfo.tipoDoTitular == 'PESSOA JURIDICA') {
          if (files.contratoSocial && typeof files.contratoSocial != 'string') {
            var imageRef = ref(storage, `${savingRef}/contratoSocial${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.contratoSocial);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'CONTRATO SOCIAL',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
          if (files.cartaoCnpj && typeof files.cartaoCnpj != 'string') {
            var imageRef = ref(storage, `${savingRef}/cartaoCnpj${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.cartaoCnpj);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'CARTÃO CNPJ',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
          if (files.comprovanteEnderecoRepresentante && typeof files.comprovanteEnderecoRepresentante != 'string') {
            var imageRef = ref(
              storage,
              `formSolicitacao/${requestInfo.nomeDoContrato}/comprovanteEnderecoRepresentante${(Math.random() * 10000).toFixed(0)}`
            );
            let res = await uploadBytes(imageRef, files.comprovanteEnderecoRepresentante);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'COMPROVANTE DE ENDEREÇO - REPRESENTANTE',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
          if (files.documentoComFotoSocios && typeof files.documentoComFotoSocios != 'string') {
            var imageRef = ref(storage, `${savingRef}/documentoComFotoSocios${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.documentoComFotoSocios);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'DOCUMENTO COM FOTO DOS SÓCIOS',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
        }
        if (requestInfo.aumentoDeCarga == 'SIM' || requestInfo.tipoDaLigacao == 'NOVA') {
          if (files.relacaoDeCargas && typeof files.relacaoDeCargas != 'string') {
            var imageRef = ref(storage, `${savingRef}/relacaoDeCargas${(Math.random() * 10000).toFixed(0)}`);
            let res = await uploadBytes(imageRef, files.relacaoDeCargas);
            const uploadResult = res as UploadResult;
            let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
            links.push({
              title: 'RELAÇÃO DE CARGAS',
              link: url,
              format:
                uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                  ? fileTypes[uploadResult.metadata.contentType].title
                  : 'INDEFINIDO',
            });
          }
        }
        if (requestInfo.possuiDistribuicao == 'SIM') {
          for (let i = 0; i < requestInfo.distribuicoes.length; i++) {
            var imageRef = ref(storage, `${savingRef}/recebedora${i + 1}${(Math.random() * 10000).toFixed(0)}`);
            const key: string = `recebedora${i + 1}`;
            if (isFile(files[key]) && files[key]) {
              // @ts-ignore
              let res = await uploadBytes(imageRef, files[key]);

              const uploadResult = res as UploadResult;
              let url = await getDownloadURL(ref(storage, res.metadata.fullPath));
              links.push({
                title: `RECEBEDORA ${i + 1}`,
                link: url,
                format:
                  uploadResult.metadata.contentType && fileTypes[uploadResult.metadata.contentType]
                    ? fileTypes[uploadResult.metadata.contentType].title
                    : 'INDEFINIDO',
              });
            }
          }
        }
      } catch (error) {
        toast.error('Houve um erro no envio das imagens. Por favor, tente novamente.');
      }
      if (holder === undefined) {
        setUploadOK(true);
        links = await getPreviouslyAttachedFiles(links, projectInfo?.anexos, proposeInfo.linkArquivo);
        setRequestInfo((prev) => ({ ...prev, links: links }));
        toast.dismiss(toastID);
        toast.success('Arquivos enviados com sucesso !');
      }
    }
  }
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DOCUMENTAÇÃO</span>
      <div className='flex w-full grow flex-col'>
        <div className='mt-2 grid w-full grid-cols-1  gap-2 lg:grid-cols-2'>
          {requestInfo.tipoDaLigacao == 'EXISTENTE' ? (
            <div className='flex w-full flex-col items-center justify-center self-center'>
              <div className='flex items-center gap-2'>
                <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='contaDeEnergia'>
                  CONTA DE ENERGIA
                </label>
                {files.contaDeEnergia ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
              </div>

              <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                <div className='absolute'>
                  {files.contaDeEnergia ? (
                    <div className='flex flex-col items-center'>
                      <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                      <span className='block text-center font-normal text-primary/40'>
                        {typeof files.contaDeEnergia != 'string' ? files.contaDeEnergia.name : formatLongString(files.contaDeEnergia)}
                      </span>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center'>
                      <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                      <span className='block font-normal text-primary/40'>Adicione o arquivo aqui...</span>
                    </div>
                  )}
                </div>
                <input
                  onChange={(e) =>
                    setFiles({
                      ...files,
                      contaDeEnergia: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className='h-full w-full opacity-0'
                  type='file'
                  accept='.png, .jpeg, .pdf'
                />
              </div>
            </div>
          ) : null}

          <div className='flex w-full flex-col items-center justify-center self-center'>
            <div className='flex items-center gap-2'>
              <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='laudo'>
                LAUDO COMERCIAL
              </label>
              {files.laudo ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
            </div>
            <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                {files.laudo ? (
                  <div className='flex flex-col items-center'>
                    <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                    <span className='block text-center font-normal text-primary/40'>
                      {typeof files.laudo != 'string' ? files.laudo.name : formatLongString(files.laudo)}
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                    <span className='block font-normal text-primary/40'>Adicione o arquivo aqui...</span>
                  </div>
                )}
              </div>
              <input
                onChange={(e) =>
                  setFiles({
                    ...files,
                    laudo: e.target.files ? e.target.files[0] : null,
                  })
                }
                className='h-full w-full opacity-0'
                type='file'
                accept='.png, .jpeg, .pdf'
              />
            </div>
          </div>

          <div className='flex w-full flex-col items-center justify-center self-center'>
            <div className='flex items-center gap-2'>
              <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='propostaComercial'>
                PROPOSTA COMERCIAL ATUALIZADA
              </label>
              {files.propostaComercial ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
            </div>
            <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                {files.propostaComercial ? (
                  <div className='flex flex-col items-center'>
                    <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                    <span className='block text-center font-normal text-primary/40'>
                      {typeof files.propostaComercial != 'string' ? files.propostaComercial.name : formatLongString(files.propostaComercial)}
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                    <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                  </div>
                )}
              </div>
              <input
                onChange={(e) =>
                  setFiles({
                    ...files,
                    propostaComercial: e.target.files ? e.target.files[0] : null,
                  })
                }
                className='h-full w-full opacity-0'
                type='file'
                accept='.png, .jpeg, .pdf'
              />
            </div>
          </div>
          <div className='flex w-full flex-col items-center justify-center self-center'>
            <div className='flex items-center gap-2'>
              <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='comprovanteEnderecoCorrespondente'>
                COMPROVANTE DE ENDEREÇO (DA CORRESPONDÊNCIA)
              </label>
              {files.comprovanteEnderecoCorrespondente ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
            </div>
            <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                {files.comprovanteEnderecoCorrespondente ? (
                  <div className='flex flex-col items-center'>
                    <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                    <span className='block text-center font-normal text-primary/40'>
                      {typeof files.comprovanteEnderecoCorrespondente != 'string'
                        ? files.comprovanteEnderecoCorrespondente.name
                        : formatLongString(files.comprovanteEnderecoCorrespondente)}
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                    <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                  </div>
                )}
              </div>
              <input
                onChange={(e) =>
                  setFiles({
                    ...files,
                    comprovanteEnderecoCorrespondente: e.target.files ? e.target.files[0] : null,
                  })
                }
                className='h-full w-full opacity-0'
                type='file'
                accept='.png, .jpeg, .pdf'
              />
            </div>
          </div>
          {requestInfo.tipoDaInstalacao == 'RURAL' && (
            <>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='car'>
                    CAR
                  </label>
                  {files.car ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.car ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.car != 'string' ? files.car.name : formatLongString(files.car)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        car: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='matricula'>
                    MATRICULA
                  </label>
                  {files.matricula ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.matricula ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.matricula != 'string' ? files.matricula.name : formatLongString(files.matricula)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        matricula: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
            </>
          )}
          {requestInfo.tipoDaInstalacao == 'URBANO' && (
            <>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='iptu'>
                    IPTU
                  </label>
                  {files.iptu ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.iptu ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.iptu != 'string' ? files.iptu.name : formatLongString(files.iptu)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        iptu: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
            </>
          )}
          {(requestInfo.tipoDoTitular == 'PESSOA FISICA' || requestInfo.tipoDeServico != 'SISTEMA FOTOVOLTAICO') && (
            <>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='documentoComFoto'>
                    DOCUMENTO COM FOTO
                  </label>
                  {files.documentoComFoto ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.documentoComFoto ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.documentoComFoto != 'string' ? files.documentoComFoto.name : formatLongString(files.documentoComFoto)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        documentoComFoto: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
            </>
          )}
          {!sameProjectHolder ? (
            <div className='flex w-full flex-col items-center justify-center self-center'>
              <div className='flex items-center gap-2'>
                <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='documentoFotoTitularInstalacao'>
                  DOCUMENTO COM FOTO - TITULAR DA INSTALAÇÃO
                </label>
                {files.documentoFotoTitularInstalacao ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
              </div>
              <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                <div className='absolute'>
                  {files.documentoFotoTitularInstalacao ? (
                    <div className='flex flex-col items-center'>
                      <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                      <span className='block text-center font-normal text-primary/40'>
                        {typeof files.documentoFotoTitularInstalacao != 'string'
                          ? files.documentoFotoTitularInstalacao.name
                          : formatLongString(files.documentoFotoTitularInstalacao)}
                      </span>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center'>
                      <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                      <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                    </div>
                  )}
                </div>
                <input
                  onChange={(e) =>
                    setFiles({
                      ...files,
                      documentoFotoTitularInstalacao: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className='h-full w-full opacity-0'
                  type='file'
                  accept='.png, .jpeg, .pdf'
                />
              </div>
            </div>
          ) : null}
          {requestInfo.tipoDoTitular == 'PESSOA JURIDICA' && (
            <>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='contratoSocial'>
                    CONTRATO SOCIAL
                  </label>
                  {files.contratoSocial ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.contratoSocial ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.contratoSocial != 'string' ? files.contratoSocial.name : formatLongString(files.contratoSocial)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        contratoSocial: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='cartaoCnpj'>
                    CARTÃO CNPJ
                  </label>
                  {files.cartaoCnpj ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.cartaoCnpj ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.cartaoCnpj != 'string' ? files.cartaoCnpj.name : formatLongString(files.cartaoCnpj)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        cartaoCnpj: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='comprovanteEnderecoRepresentante'>
                    COMPROVANTE DE ENDEREÇO (REPRESENTANTE LEGAL)
                  </label>
                  {files.comprovanteEnderecoRepresentante ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.comprovanteEnderecoRepresentante ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.comprovanteEnderecoRepresentante != 'string'
                            ? files.comprovanteEnderecoRepresentante.name
                            : formatLongString(files.comprovanteEnderecoRepresentante)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        comprovanteEnderecoRepresentante: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
              <div className='flex w-full flex-col items-center justify-center self-center'>
                <div className='flex items-center gap-2'>
                  <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='documentoComFotoSocios'>
                    DOCUMENTO COM FOTO (DE TODOS OS SÓCIOS)
                  </label>
                  {files.documentoComFotoSocios ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                </div>
                <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                  <div className='absolute'>
                    {files.documentoComFotoSocios ? (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block text-center font-normal text-primary/40'>
                          {typeof files.documentoComFotoSocios != 'string'
                            ? files.documentoComFotoSocios.name
                            : formatLongString(files.documentoComFotoSocios)}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center'>
                        <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                        <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                      </div>
                    )}
                  </div>
                  <input
                    onChange={(e) =>
                      setFiles({
                        ...files,
                        documentoComFotoSocios: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className='h-full w-full opacity-0'
                    type='file'
                    accept='.png, .jpeg, .pdf'
                  />
                </div>
              </div>
            </>
          )}
          {requestInfo.possuiDistribuicao == 'SIM' && (
            <>
              {requestInfo.distribuicoes.map((dist, index) => (
                <div key={index} className='flex w-full flex-col items-center justify-center self-center'>
                  <div className='flex items-center gap-2'>
                    <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor={`recebedora${index + 1}`}>
                      RECEBEDORA Nº{index + 1}
                    </label>
                    {files[`recebedora${index + 1}`] ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                  </div>
                  <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                    <div className='absolute'>
                      {files[`recebedora${index + 1}`] ? (
                        <div className='flex flex-col items-center'>
                          <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                          <span className='block text-center font-normal text-primary/40'>
                            {typeof files[`recebedora${index + 1}`] != 'string'
                              ? //@ts-ignore
                                files[`recebedora${index + 1}`]?.name
                              : formatLongString(typeof files[`recebedora${index + 1}`] == 'string' ? typeof files[`recebedora${index + 1}`] : '')}
                          </span>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center'>
                          <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                          <span className='block font-normal text-primary/40'>Adicione o arquivo aqui</span>
                        </div>
                      )}
                    </div>
                    <input
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          [`recebedora${index + 1}`]: e.target.files ? e.target.files[0] : null,
                        })
                      }
                      className='h-full w-full opacity-0'
                      type='file'
                      accept='.png, .jpeg, .pdf'
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button
          onClick={() => {
            goToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/50 duration-300 hover:scale-105'
        >
          Voltar
        </button>
        {uploadOK == true ? (
          <button
            onClick={() => {
              goToNextStage();
            }}
            className='rounded p-2 font-bold disabled:bg-primary/30 hover:bg-black hover:text-white'
          >
            Prosseguir
          </button>
        ) : (
          <button
            onClick={() => {
              uploadFiles();
            }}
            disabled={uploadOK == 'loading'}
            className='rounded p-2 font-bold disabled:bg-primary/30 hover:bg-black hover:text-white'
          >
            {uploadOK == 'loading' ? 'Carregando...' : 'Enviar arquivos'}
          </button>
        )}
      </div>
    </div>
  );
}

export default DocumentAttachmentInfo;
