import Logo from '@/utils/images/blue-vertical-logo-with-text.png';
import Assinatura from '@/utils/images/signature-diogo.jpg';
import dayjs from 'dayjs';
import Image from 'next/image';

import { formatToMoney } from '@/lib/methods/formatting';
import { STANDARD_PROFIT_MARGIN, STANDARD_TAX } from '@/utils/constants';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { MdTopic } from 'react-icons/md';

type LaudoSimplesRuralProps = {
  analysis: TTechnicalAnalysisDTO;
};
function LaudoSimplesRural({ analysis }: LaudoSimplesRuralProps) {
  function getAdditionalCostsSum(costs: TTechnicalAnalysisDTO['custos'], addTaxes = false) {
    const sum = costs.reduce((acc, current) => {
      if (!addTaxes && !!current.totalVendaSimples) return acc + current.totalVendaSimples;
      if (!!addTaxes && !!current.totalVendaFaturavel) return acc + current.totalVendaFaturavel;
      const costTotal = current.total || current.qtde * (current.custoUnitario || 0);
      const total = addTaxes ? costTotal / (1 - (STANDARD_PROFIT_MARGIN + STANDARD_TAX)) : costTotal / (1 - STANDARD_PROFIT_MARGIN);
      return acc + total;
    }, 0);
    return sum;
  }
  return (
    <div className='h-[29.7cm] w-[21cm]'>
      <div className='flex h-full w-full flex-col'>
        <div className='mt-2 flex w-full items-center justify-around border border-t-0 border-black py-2'>
          <h1 className='font-bold uppercase text-[#15599a]'>LAUDO TÉCNICO COMERCIAL - RURAL</h1>
          <div className='h-[47px] w-[47px]'>
            <Image style={{ width: '47px', height: '47px' }} src={Logo} alt='Logo' />
          </div>
        </div>
        <div className='flex flex-col'>
          <h1 className='border-x border-black bg-[#15599a] text-center text-sm font-bold text-white'>INFORMAÇÕES DO CLIENTE</h1>
          <div className='flex'>
            <div className='grid w-[60%] grid-rows-5'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>CLIENTE</p>
                <p className='border-r border-black text-center text-xs'>{analysis.nome}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>REPRESENTANTE</p>
                <p className='border-r border-black text-center text-xs'>{analysis.requerente.apelido || analysis.requerente.nome}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>ENDEREÇO</p>
                <p className='border-r border-black text-center text-xs'>{analysis.localizacao.endereco}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>BAIRRO</p>
                <p className='border-r border-black text-center text-xs'>{analysis.localizacao.bairro}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>DATA DA VISITA</p>
                <p className='border-r border-black text-center text-xs'>{dayjs().format('DD/MM/YY')}</p>
              </div>
            </div>
            <div className='grid w-[40%] grid-rows-5'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>TELEFONE</p>
                <p className='border-r border-black text-center text-xs'>-</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>Nº DE PROJETO</p>
                <p className='border-r border-black text-center text-xs'>{analysis.oportunidade.identificador}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>NÚMERO</p>
                <p className='border-r border-black text-center text-xs'>{analysis.localizacao.numeroOuIdentificador}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>MUNICÍPIO</p>
                <p className='border-r border-black text-center text-xs'>{analysis.localizacao.cidade}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black text-center text-xs'>TIPO DE SOLICITAÇÃO</p>
                <p className='border-r border-black text-center text-xs'>{analysis.tipoSolicitacao}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 flex flex-col'>
          <h1 className='bg-[#15599a] text-center text-sm font-bold text-white'>EQUIPAMENTOS</h1>
          <div className='flex'>
            <div className='flex h-full w-[20%] items-center justify-center bg-[#15599a] text-center font-bold text-white'>
              DESCRIÇÃO DO SISTEMA FOTOVOLTAICO
            </div>
            <div className='flex w-[80%] flex-col'>
              <div className='flex w-full items-center'>
                <div className='font-raleway w-1/2 border  border-b-0 border-black bg-[#fead61]  text-center text-sm font-bold text-white'>
                  TOPOLOGIA
                </div>
                <p className='w-1/2 p-1 text-center text-[0.6rem] font-bold'>{analysis.detalhes.topologia}</p>
              </div>
              <h1 className='font-raleway border border-b-0  border-black bg-[#fead61] text-center  text-sm font-bold text-white'>INVERSORES</h1>
              <div className='flex w-full flex-col border border-black'>
                <div className='flex w-full items-center'>
                  <div className='w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold'>QUANTIDADE</div>
                  <div className='w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold'>MODELO</div>
                  <div className='w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold'>POTÊNCIA</div>
                </div>
                {analysis.equipamentos
                  .filter((e) => e.categoria == 'INVERSOR')
                  .map((inverter, index) => (
                    <div key={index} className='flex w-full items-center'>
                      <div className='w-1/3 p-1 text-center text-[0.6rem] font-bold'>{inverter.qtde}</div>
                      <div className='w-1/3 p-1 text-center text-[0.6rem] font-bold'>
                        ({inverter.fabricante}) {inverter.modelo}
                      </div>
                      <div className='w-1/3 p-1 text-center text-[0.6rem] font-bold'>{inverter.potencia}</div>
                    </div>
                  ))}
              </div>
              <h1 className='font-raleway border border-b-0 border-t-0  border-black bg-[#fead61] text-center  text-sm font-bold text-white'>
                MÓDULOS FOTOVOLTÁICOS
              </h1>
              <div className='flex w-full flex-col border border-black'>
                <div className='flex w-full items-center'>
                  <div className='w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold'>QUANTIDADE</div>
                  <div className='w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold'>MODELO</div>
                  <div className='w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold'>POTÊNCIA</div>
                </div>
                {analysis.equipamentos
                  .filter((e) => e.categoria == 'MÓDULO')
                  .map((module, index) => (
                    <div key={index} className='flex w-full items-center'>
                      <div className='w-1/3 p-1 text-center text-[0.6rem] font-bold'>{module.qtde}</div>
                      <div className='w-1/3 p-1 text-center text-[0.6rem] font-bold'>
                        ({module.fabricante}) {module.modelo}
                      </div>
                      <div className='w-1/3 p-1 text-center text-[0.6rem] font-bold'>{module.potencia}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 flex flex-col'>
          <h1 className='border border-b-0 border-black bg-[#15599a] text-center text-sm font-bold text-white'>VISUALIZAÇÃO DO PROJETO</h1>
          <div className='flex h-[600px] items-center border border-black'>
            {analysis.desenho.url ? (
              <div className='relative h-[560px] w-[793.7px]'>
                <Image fill={true} src={analysis.desenho.url} alt='DESENHO' />
              </div>
            ) : (
              <div className='flex h-full w-[793.7px] items-center justify-center'>
                <p className='font-bold italic text-primary/50'>Oops, parece que não há nenhum desenho vinculado para essa análise...</p>
              </div>
            )}
          </div>
        </div>
        <div className='mt-4 flex flex-col'>
          <h1 className='border border-black bg-[#15599a] text-center text-sm font-bold text-white'>CUSTOS ADICIONAIS</h1>
          <div className='flex flex-col'>
            <div className='grid grid-cols-10 border-b border-black bg-[#fead61]'>
              <p className='col-span-3 border-r border-black p-1 text-center text-xs font-bold text-white'>DESCRIÇÃO</p>
              <p className='col-span-2 border-r border-black p-1 text-center text-xs font-bold text-white'>QUANTIDADE</p>
              <p className='col-span-1 border-r border-black p-1 text-center text-xs font-bold text-white'>GRANDEZA</p>
              <p className='col-span-2 border-r border-black p-1 text-center text-xs font-bold text-white'>VALOR</p>
              <p className='col-span-2 border-r border-black p-1 text-center text-xs font-bold text-white'>TOTAL</p>
            </div>
            {analysis.custos?.length > 0 ? (
              analysis.custos.map((cost, index) => (
                <div key={index} className='grid grid-cols-10 border-b border-black'>
                  <p className='col-span-3 border-r border-black p-1 text-center text-xs font-bold'>{cost.descricao}</p>
                  <p className='col-span-2 border-r border-black p-1 text-center text-xs font-bold'>{cost.qtde}</p>
                  <p className='col-span-1 border-r border-black p-1 text-center text-xs font-bold'>{cost.grandeza}</p>
                  <p className='col-span-2 border-r border-black p-1 text-center text-xs font-bold'>
                    {formatToMoney((cost.custoUnitario || 0) / (1 - STANDARD_PROFIT_MARGIN))}
                  </p>
                  <p className='col-span-2 border-r border-black p-1 text-center text-xs font-bold'>
                    {cost.total
                      ? formatToMoney(cost.total / (1 - STANDARD_PROFIT_MARGIN))
                      : formatToMoney((cost.qtde * (cost.custoUnitario || 0)) / (1 - STANDARD_PROFIT_MARGIN))}
                  </p>
                </div>
              ))
            ) : (
              <div className='flex h-[50px] items-center justify-center border-b border-r border-black italic'>SEM CUSTOS ADICIONAIS</div>
            )}
          </div>
          <div className='grid grid-cols-10'>
            <div className='col-span-3 flex items-center justify-center border border-l-0 border-t-0 border-black bg-[#15599a] text-center font-bold text-white'>
              VALOR PARA AJUSTE NA PROPOSTA COMERCIAL
            </div>
            <div className='col-span-7 flex h-full flex-col'>
              <div className='grid grid-cols-7  border-b border-black'>
                <div className='col-span-5 border-r border-black bg-[#fead61] p-1 text-center font-bold text-white'>VALOR À VISTA</div>
                <div className='col-span-2 border-r border-black bg-[#fead61] p-1 text-center font-bold text-white'>
                  R$ {analysis.custos ? getAdditionalCostsSum(analysis.custos).toFixed(2).replace('.', ',') : '-'}
                </div>
              </div>
              <div className='grid grid-cols-7  border-b border-black'>
                <div className='col-span-5 border-r border-black bg-[#15599a] p-1 text-center font-bold text-white'>VALOR FINANCIAMENTO</div>
                <div className='col-span-2 border-r border-black bg-[#15599a] p-1 text-center font-bold text-white'>
                  R$ {analysis.custos ? getAdditionalCostsSum(analysis.custos, true).toFixed(2).replace('.', ',') : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col'>
          <h1 className='border border-t-0 border-black bg-[#15599a] text-center text-sm font-bold text-white'>SERVIÇOS EXTRAS</h1>
          <div className='grid grid-cols-2 border-b border-black'>
            <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>REALIMENTAR</p>
            <p className='border-r border-black text-center text-xxs'>{analysis.servicosAdicionais.realimentar ? 'SIM' : 'NÃO'}</p>
          </div>
          <div className='flex'>
            <div className='grid w-[50%] grid-rows-4'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>CASA DE MÁQUINAS</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.casaDeMaquinas ? analysis.servicosAdicionais.casaDeMaquinas : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>INSTALAÇÃO INTERNET</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.roteador ? analysis.servicosAdicionais.roteador : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>INSTALAÇÃO DE ALAMBRADO</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.alambrado ? analysis.servicosAdicionais.alambrado : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>TERRAPLANAGEM USINA DE SOLO</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.terraplanagem ? analysis.servicosAdicionais.terraplanagem : '-'}
                </p>
              </div>
            </div>
            <div className='grid w-[50%] grid-rows-4'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>CONSTRUÇÃO DE BARRACÃO</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.barracao ? analysis.servicosAdicionais.barracao : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>REDE PARA INTERLIGAR FAZENDA</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.redeReligacao ? analysis.servicosAdicionais.redeReligacao : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>BRITAGEM</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.britagem ? analysis.servicosAdicionais.britagem : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>LIMPEZA DO LOCAL USINA DE SOLO</p>
                <p className='border-r border-black text-center text-xxs'>
                  {analysis.servicosAdicionais.limpezaLocal ? analysis.servicosAdicionais.limpezaLocal : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-2 flex flex-col'>
          <h1 className='border border-t-0 border-black bg-[#fead61] text-center font-bold text-white'>DESCRITIVO DO PROJETO</h1>
          <div className='flex min-h-[60px] flex-col items-center justify-center border border-t-0 border-black text-center text-xs'>
            {analysis.descritivo?.length > 0 ? (
              analysis.descritivo?.map((item, index) => (
                <div key={index} className='mb-1 flex w-full flex-col'>
                  <div className='flex w-full items-center justify-between'>
                    <div className='flex w-full items-center justify-center gap-2 bg-black text-white'>
                      <MdTopic />
                      <h1 className=' text-sm font-bold leading-none  tracking-tight'>{item.topico}</h1>
                    </div>
                  </div>

                  <p className='mt-1 w-full text-center text-xs text-primary/50'>{item.descricao}</p>
                </div>
              ))
            ) : (
              <div className='flex h-full items-center justify-center text-center italic text-primary/60'>SEM DESCRITIVO</div>
            )}
          </div>
        </div>
        <div className='mt-2 flex flex-col'>
          <h1 className='bg-[#15599a] text-center text-sm font-bold text-white'>RESPOSTA DA VISITA TÉCNICA</h1>
          <div className='flex flex-col'>
            <div className='grid grid-cols-2'>
              <div className='col-span-2 grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] py-1 text-center text-sm font-bold text-white'>ESPAÇO PARA PROJETO</p>
                <p className='border-r border-black py-1 text-center text-sm font-bold'>{analysis.conclusao.espaco ? 'SIM' : 'NÃO'}</p>
              </div>
              <div className='grid grid-rows-3'>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-[#fead61] py-1 text-center text-sm font-bold text-white'>PADRÃO</p>
                  <p className='border-r border-black py-1 text-center text-sm font-bold'>
                    {analysis.conclusao.padrao ? analysis.conclusao.padrao : '-'}
                  </p>
                </div>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-[#fead61] py-1 text-center text-sm font-bold text-white'>ESTRUTURA DE INCLINAÇÃO</p>
                  <p className='border-r border-black py-1 text-center text-sm font-bold'>
                    {analysis.conclusao.inclinacao ? analysis.conclusao.inclinacao : '-'}
                  </p>
                </div>
              </div>
              <div className='grid grid-rows-3'>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-[#fead61] py-1 text-center text-sm font-bold text-white'>POSSUI SOMBRA?</p>
                  <p className='border-r border-black py-1 text-center text-sm font-bold'>
                    {analysis.conclusao.sombreamento ? 'É AFETADO' : 'NÃO É AFETADO'}
                  </p>
                </div>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-[#fead61] py-1 text-center text-sm font-bold text-white'>ESTRUTURA CIVIL</p>
                  <p className='border-r border-black py-1 text-center text-sm font-bold'>
                    {analysis.conclusao.estrutura ? analysis.conclusao.estrutura : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-2 flex flex-col'>
          <h1 className='border border-t-0 border-black bg-[#15599a] text-center font-bold text-white'>CONCLUSÃO</h1>
          <div className='flex h-[60px] items-center justify-center border border-t-0 border-black p-2 text-center text-xs'>
            {analysis.conclusao.observacoes ? analysis.conclusao.observacoes : '-'}
          </div>
        </div>
        <div className='mt-2 grid grid-cols-2 gap-x-4'>
          <div className='flex flex-col'>
            <p className='ml-2 text-start text-xxs'>Autorizado por:</p>
            <div className='flex w-full items-center justify-center'>
              <div className='relative flex h-[40px] w-[97px] items-center justify-center text-center'>
                <Image src={Assinatura} fill={true} alt='Assinatura' />
              </div>
            </div>
            <hr className='border-t-2 border-black' />
            <p className='text-center text-xxs'>ASSINATURA DIRETOR DE ENGENHARIA</p>
          </div>
          <div className='flex flex-col'>
            <p className='ml-2 text-start text-xxs'>Realizado por:</p>
            <div className='flex w-full items-center justify-center'>
              <div className='relative flex h-[40px] w-[97px] items-center justify-center text-center'></div>
            </div>
            <hr className='border-t-2 border-black' />
            <p className='text-center text-xxs'>ASSINATURA TÉCNICO RESPONSÁVEL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaudoSimplesRural;
