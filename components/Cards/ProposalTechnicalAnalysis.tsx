import { formatToMoney } from '@/lib/methods/formatting';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { BsFillClipboardDataFill } from 'react-icons/bs';

type ProposalTechnicalAnalysisProps = {
  isSelected: boolean;
  analysis: TTechnicalAnalysisDTO;
  vinculateAnalysis: (analysis: TTechnicalAnalysisDTO) => void;
  unvinculateAnalysis: () => void;
  userHasPricingViewPermission: boolean;
};
function ProposalTechnicalAnalysis({
  isSelected,
  analysis,
  vinculateAnalysis,
  unvinculateAnalysis,
  userHasPricingViewPermission,
}: ProposalTechnicalAnalysisProps) {
  return (
    <div className='flex w-full gap-2 rounded-md border border-primary/50 bg-background font-Inter shadow-md'>
      <div className='flex grow flex-col gap-2 p-4'>
        <div className='flex w-full items-center justify-between gap-2'>
          <div className='flex items-center gap-1'>
            <div className='flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1'>
              <BsFillClipboardDataFill size={12} />
            </div>
            <h1 className='text-sm font-black leading-none tracking-tight'>{analysis.tipoSolicitacao}</h1>
          </div>
          {isSelected ? (
            <button
              onClick={() => unvinculateAnalysis()}
              className='rounded-full bg-green-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'
            >
              SELECIONADA
            </button>
          ) : (
            <button
              onClick={() => vinculateAnalysis(analysis)}
              className='rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'
            >
              UTILIZAR ANÁLISE
            </button>
          )}
        </div>
        <h1 className='my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-primary/70 lg:text-xs'>CONCLUSÃO</h1>
        <h1 className='w-full rounded-md bg-primary/10 p-2 py-1 text-center text-xs font-medium text-primary/70'>
          {analysis.conclusao.observacoes || 'SEM OBSERVAÇÃO PARA A ANÁLISE'}
        </h1>
        <div className='flex w-full flex-wrap items-center justify-around gap-2'>
          <div
            className={`flex items-center gap-1 rounded-sm p-1 ${analysis.conclusao.espaco ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
          >
            <p className='text-xs font-medium tracking-tight'>
              {analysis.conclusao.espaco ? 'POSSUI ESPAÇO PARA INSTALAÇÃO' : 'NÃO POSSUI ESPAÇO PARA INSTALAÇÃO'}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 rounded-sm p-1 ${!analysis.conclusao.inclinacao ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
          >
            <p className='text-xs font-medium tracking-tight'>
              {!analysis.conclusao.inclinacao ? 'NÃO NECESSÁRIO ESTRUTURA DE INCLINAÇÃO' : 'NECESSÁRIO ESTRUTURA DE INCLINAÇÃO'}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 rounded-sm p-1 ${!analysis.conclusao.sombreamento ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
          >
            <p className='text-xs font-medium tracking-tight'>
              {!analysis.conclusao.sombreamento ? 'NÃO SOFRERÁ COM SOMBREAMENTO' : 'SOFRERÁ COM SOMBREAMENTO'}
            </p>
          </div>
        </div>
        <h1 className='my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-primary/70 lg:text-xs'>CUSTOS ADICIONAIS</h1>
        <div className='mt-1 flex w-full flex-wrap items-center justify-around gap-2'>
          {analysis.custos.map((cost, index) => (
            <div key={index} className='flex items-center gap-2 rounded-sm border border-primary/50 p-2'>
              <h1 className='text-xs font-medium leading-none tracking-tight lg:text-sm'>{cost.descricao}</h1>
              {userHasPricingViewPermission ? (
                <h1 className='min-w-fit rounded-full bg-primary/80 px-2 py-1 text-[0.58rem] font-medium text-primary-foreground lg:text-xs'>
                  {formatToMoney(cost.total || 0)}
                </h1>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProposalTechnicalAnalysis;
