import React from 'react';
type AttachFileProps = {
  files: { [key: string]: File | null };
  setFiles: React.Dispatch<
    React.SetStateAction<{
      [key: string]: File | null;
    }>
  >;
  clientIdentifier: string;
};

function AttachFile({ files, setFiles, clientIdentifier }: AttachFileProps) {
  const isCPF = clientIdentifier.length == 14;
  const isCNPJ = clientIdentifier.length == 18;
  if (clientIdentifier.length < 14)
    return (
      <div className='flex w-full flex-col gap-2'>
        <h1 className='mt-4 w-full rounded-md bg-primary/80 p-2 text-center font-bold text-primary-foreground'>ANEXO DE ARQUIVOS</h1>
        <p className='py-2 text-center text-sm italic text-red-500'>Preencha um CPF/CNPJ válido.</p>
      </div>
    );
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='mt-4 w-full rounded-md bg-primary/80 p-2 text-center font-bold text-primary-foreground'>ANEXO DE ARQUIVOS</h1>
      {isCPF ? (
        <>
          <div className='flex w-full flex-col'>
            <label htmlFor={'comprovanteEndereco'} className='font-sans font-bold  text-primary'>
              COMPROVANTE DE ENDEREÇO
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.comprovanteEndereco ? files.comprovanteEndereco.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    comprovanteEndereco: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'comprovanteEndereco'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'comprovanteRenda'} className='font-sans font-bold  text-primary'>
              COMPROVANTE DE RENDA
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.comprovanteRenda ? files.comprovanteRenda.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    comprovanteRenda: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'comprovanteRenda'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'documentoPessoal'} className='font-sans font-bold  text-primary'>
              DOCUMENTO PESSOAL (COM CPF/CNPJ)
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.documentoPessoal ? files.documentoPessoal.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    documentoPessoal: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'documentoPessoal'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
        </>
      ) : null}
      {isCNPJ ? (
        <>
          <div className='flex w-full flex-col'>
            <label htmlFor={'cartaoCNPJ'} className='font-sans font-bold  text-primary'>
              CARTÃO CNPJ
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.cartaoCNPJ ? files.cartaoCNPJ.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    cartaoCNPJ: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'cartaoCNPJ'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'contratoSocial'} className='font-sans font-bold  text-primary'>
              CONTRATO SOCIAL
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.contratoSocial ? files.contratoSocial.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    contratoSocial: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'contratoSocial'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'comprovanteEndereco'} className='font-sans font-bold  text-primary'>
              COMPROVANTE DE ENDEREÇO DA INSTALAÇÃO
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.comprovanteEndereco ? files.comprovanteEndereco.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    comprovanteEndereco: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'comprovanteEndereco'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'comprovanteRenda'} className='font-sans font-bold  text-primary'>
              COMPROVANTE DE RENDA (REPRESENTANTE LEGAL)
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.comprovanteRenda ? files.comprovanteRenda.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    comprovanteRenda: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'comprovanteRenda'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'declaracaoFaturamento'} className='font-sans font-bold  text-primary'>
              DECLARAÇÃO DE FATURAMENTO (12 MESES)
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.declaracaoFaturamento ? files.declaracaoFaturamento.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    declaracaoFaturamento: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'declaracaoFaturamento'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <label htmlFor={'documentoPessoal'} className='font-sans font-bold  text-primary'>
              DOCUMENTO PESSOAL (REPRESENTANTE LEGAL)
            </label>
            <div className='relative flex h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
              <div className='absolute'>
                <div className='flex flex-col items-center'>
                  <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                  <span className='block text-center text-sm font-normal text-primary/40'>
                    {files.documentoPessoal ? files.documentoPessoal.name : `Anexe aqui o comprovante de endereço...`}
                  </span>
                </div>
              </div>
              <input
                onChange={(e) => {
                  setFiles((prev) => ({
                    ...prev,
                    documentoPessoal: e.target.files ? e.target.files[0] : null,
                  }));
                }}
                className='h-full w-full opacity-0'
                type='file'
                id={'documentoPessoal'}
                accept={'.png, .jpeg, .jpg, .pdf, .docx, .doc'}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default AttachFile;
