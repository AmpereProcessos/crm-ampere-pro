import Logo from '@/utils/images/blue-vertical-logo-with-text.png';
import Assinatura from '@/utils/images/signature-diogo.jpg';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import dayjs from 'dayjs';
import Image from 'next/image';

type LaudoTecnicoRuralProps = {
  analysis: TTechnicalAnalysisDTO;
};
function LaudoTecnicoRural({ analysis }: LaudoTecnicoRuralProps) {
  return (
    <div className='h-[29.7cm] w-[21cm]'>
      <div className='flex h-full w-full flex-col'>
        <div className='mt-2 flex w-full items-center justify-around border border-t-0 border-black py-2'>
          <h1 className='font-bold uppercase text-[#15599a]'>LAUDO TÉCNICO - RURAL</h1>
          <div className='h-[47px] w-[47px]'>
            <Image style={{ width: '47px', height: '47px' }} src={Logo} alt='Logo' />
          </div>
        </div>
        <div className='flex flex-col'>
          <h1 className='border-x border-black bg-[#15599a] text-center text-sm font-bold text-white'>INFORMAÇÕES DO CLIENTE</h1>
          <div className='flex'>
            <div className='grid w-[60%] grid-rows-5'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>CLIENTE</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.nome}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>REPRESENTANTE</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.requerente.apelido || analysis.requerente.nome}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>ENDEREÇO</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.localizacao.endereco}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>BAIRRO</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.localizacao.bairro}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>DATA DA VISITA</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{dayjs().format('DD/MM/YYYY')}</p>
              </div>
            </div>
            <div className='grid w-[40%] grid-rows-5'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>TELEFONE</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>-</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>Nº DE PROJETO</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.oportunidade.identificador || 'N/A'}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>NÚMERO</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.localizacao.numeroOuIdentificador}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>MUNICÍPIO</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.localizacao.cidade}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-white'>TIPO DE SOLICITAÇÃO</p>
                <p className='border-r border-black p-1 text-center text-[0.6rem]'>{analysis.tipoSolicitacao}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col'>
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
        <div className='flex flex-col'>
          <h1 className='border border-t-0 border-black bg-[#15599a] text-center text-sm font-bold text-white'>EXECUÇÃO</h1>
          <div className='grid grid-cols-4 border-b border-black'>
            <p className='col-span-2 border-r border-black bg-primary/30 text-center text-xxs font-bold'>ESPAÇO NO QGBT</p>
            <p className='col-span-2 border-r border-black text-center text-xxs'>{analysis.execucao.espacoQGBT ? 'SIM' : 'NÃO'}</p>
          </div>
          <div className='flex'>
            <div className='grid w-[50%] grid-rows-3'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>LOCAL DE ATERRAMENTO</p>
                <p className='border-r border-black text-center text-xxs'>{analysis.locais.aterramento || '-'}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>LOCAL INSTALAÇÃO DO INVERSOR</p>
                <p className='border-r border-black text-center text-xxs'>{analysis.locais.inversor ? analysis.locais.inversor : '-'}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>LOCAL INSTALAÇÃO DOS MÓDULOS</p>
                <p className='border-r border-black text-center text-xxs'>{analysis.locais.modulos ? analysis.locais.modulos : '-'}</p>
              </div>
            </div>
            <div className='grid w-[50%] grid-rows-3'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>DISTÂNCIA DO INVERSOR AO PADRÃO</p>
                <p className='border-r border-black text-center text-xxs'>{analysis.distancias.cabeamentoCA}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>DISTÂNCIA DOS MÓDULOS AO INVERSOR</p>
                <p className='border-r border-black text-center text-xxs'>{analysis.distancias.cabeamentoCC}</p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>DISTÂNCIA DO COMUNICADOR AO ROTEADOR</p>
                <p className='border-r border-black text-center text-xxs'>{analysis.distancias.conexaoInternet}</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <h1 className='border border-t-0 border-black bg-[#fead61] text-center text-xs font-bold text-white'>OBSERVAÇÕES</h1>
            <div className='flex h-[50px] items-center justify-center border border-t-0 border-black p-2 text-center text-xs'>
              {analysis.execucao.observacoes || 'SEM OBSERVAÇÕES PREENCHIDAS'}
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
        <div className='flex flex-col'>
          <h1 className='border border-t-0 border-black bg-[#15599a] text-center text-sm font-bold text-white'>SUPRIMENTOS</h1>
          <div className='flex flex-col'>
            <div className='grid grid-cols-10'>
              <p className='col-span-3 border-b border-r border-black bg-[#fead61] text-center text-sm font-bold text-white'>INSUMO</p>
              <p className='col-span-3 border-b border-r border-black bg-[#fead61] text-center text-sm font-bold text-white'>TIPO</p>
              <p className='col-span-2 border-b border-r border-black bg-[#fead61] text-center text-sm font-bold text-white'>QUANTIDADE</p>
              <p className='col-span-2 border-b border-r border-black bg-[#fead61] text-center text-sm font-bold text-white'>MEDIDA</p>
            </div>
            {analysis.suprimentos && analysis.suprimentos?.itens?.length > 0 ? (
              analysis.suprimentos.itens.map((supply, index) => (
                <div key={index} className='grid grid-cols-10'>
                  <p className='col-span-3 border-b border-r border-black text-center text-xxs font-bold'>{supply.descricao}</p>
                  <p className='col-span-3 border-b border-r border-black text-center text-xxs font-bold'>{supply.tipo}</p>
                  <p className='col-span-2 border-b border-r border-black text-center text-xxs font-bold'>{supply.qtde}</p>
                  <p className='col-span-2 border-b border-r border-black text-center text-xxs font-bold'>{supply.grandeza}</p>
                </div>
              ))
            ) : (
              <div className='flex h-[50px] items-center justify-center border-b border-r border-black italic'>SEM ITENS ADICIONADOS</div>
            )}
          </div>
          <div className='flex flex-col'>
            <h1 className='border border-t-0 border-black bg-[#fead61] text-center text-xs font-bold text-white'>OBSERVAÇÕES</h1>
            <div className='flex h-[50px] items-center justify-center border border-t-0 border-black p-2 text-center text-xs'>
              {analysis.suprimentos?.observacoes ? analysis.suprimentos.observacoes : 'SEM OBSERVAÇÕES'}
            </div>
          </div>
        </div>
        <div className='flex flex-col'>
          <h1 className='border border-t-0 border-black bg-[#15599a] text-center text-sm font-bold text-white'>PROJETOS</h1>
          <div className='flex'>
            <div className='grid w-[50%] grid-cols-2 border-b border-black'>
              <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>CONCESSIONÁRIA</p>
              <p className='border-r border-black text-center text-xxs font-bold'>
                {analysis.detalhes.concessionaria ? analysis.detalhes.concessionaria : '-'}
              </p>
            </div>
            <div className='grid w-[50%] grid-cols-2 border-b border-black'>
              <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>TOPOLOGIA</p>
              <p className='border-r border-black text-center text-xxs font-bold'>
                {analysis.detalhes.topologia ? analysis.detalhes.topologia : '-'}
              </p>
            </div>
          </div>
          <div className='flex flex-col'>
            <h1 className='border border-t-0 border-black bg-[#fead61] text-center text-xs font-bold text-white'>PADRÃO</h1>
            {analysis.padrao.map((paInfo, index) => (
              <div key={index} className='flex w-full flex-col'>
                {analysis.padrao?.length > 1 ? (
                  <h1 className='border border-t-0 border-black bg-[#fead41] text-center text-xs font-bold text-white'>PADRÃO Nº {index + 1}</h1>
                ) : null}
                <div className='flex w-full'>
                  <div className='flex w-[50%] flex-col'>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>PADRÃO ESTÁ</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.tipo}</p>
                    </div>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>ENTRADA</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.tipoEntrada}</p>
                    </div>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>SAÍDA</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.tipoSaida}</p>
                    </div>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>Nº DO MEDIDOR</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.codigoMedidor}</p>
                    </div>
                  </div>
                  <div className='flex w-[50%] flex-col'>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>LIGAÇÃO</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.ligacao}</p>
                    </div>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>AMPERAGEM</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.amperagem}</p>
                    </div>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>Nº DO POSTE DE DERIVAÇÃO</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.codigoPosteDerivacao || '-'}</p>
                    </div>
                    <div className='grid grid-cols-2 border-b border-black'>
                      <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>MODELO DA CAIXA</p>
                      <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.modeloCaixaMedidor}</p>
                    </div>
                  </div>
                </div>
                {paInfo.alteracao ? (
                  <div className='flex w-full flex-col'>
                    <h1 className='w-full border border-t-0 border-black bg-red-500 text-center text-xxs font-bold text-white'>POSSUI ALTERAÇÃO</h1>
                    <div className='flex w-full'>
                      <div className='grid w-[50%] grid-cols-2 border-b border-black'>
                        <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>NOVA LIGAÇÃO</p>
                        <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.novaLigacao || '-'}</p>
                      </div>
                      <div className='grid w-[50%] grid-cols-2 border-b border-black'>
                        <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>NOVA AMPERAGEM</p>
                        <p className='border-r border-black text-center text-xxs font-bold'>{paInfo.novaAmperagem || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className='flex flex-col'>
            <h1 className='border border-t-0 border-black bg-[#fead61] text-center text-xs font-bold text-white'>TRANSFORMADOR</h1>

            <div className='grid grid-rows-2'>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>POTÊNCIA DO TRANSFORMADOR</p>
                <p className='border-r border-black text-center text-xxs font-bold'>
                  {analysis.transformador.potencia ? analysis.transformador.potencia : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>Nº DO TRANSFORMADOR</p>
                <p className='border-r border-black text-center text-xxs font-bold'>
                  {analysis.transformador.codigo ? analysis.transformador.codigo : '-'}
                </p>
              </div>
              <div className='grid grid-cols-2 border-b border-black'>
                <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>PADRÃO ACOPLADO</p>
                <p className='border-r border-black text-center text-xxs font-bold'>{analysis.transformador.acopladoPadrao ? 'SIM' : 'NÃO'}</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <h1 className='border border-t-0 border-black bg-[#fead61] text-center text-xs font-bold text-white'>DESENHO</h1>
            <div className='flex'>
              <div className='grid w-[50%] grid-rows-2'>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>FOTO DO DRONE</p>
                  <p className='border-r border-black text-center text-xxs font-bold'>
                    {analysis.detalhes.imagensDrone ? analysis.detalhes.imagensDrone : '-'}
                  </p>
                </div>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>MEDIDAS NO LOCAL</p>
                  <p className='border-r border-black text-center text-xxs font-bold'>
                    {analysis.detalhes.medicoes ? analysis.detalhes.medicoes : '-'}
                  </p>
                </div>
              </div>
              <div className='grid w-[50%] grid-rows-2'>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>FOTO DA FACHADA</p>
                  <p className='border-r border-black text-center text-xxs font-bold'>
                    {analysis.detalhes.imagensFachada ? analysis.detalhes.imagensFachada : '-'}
                  </p>
                </div>
                <div className='grid grid-cols-2 border-b border-black'>
                  <p className='border-r border-black bg-primary/30 text-center text-xxs font-bold'>GOOGLE EARTH</p>
                  <p className='border-r border-black text-center text-xxs font-bold'>
                    {analysis.detalhes.imagensSatelite ? analysis.detalhes.imagensSatelite : '-'}
                  </p>
                </div>
              </div>
            </div>
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

export default LaudoTecnicoRural;
