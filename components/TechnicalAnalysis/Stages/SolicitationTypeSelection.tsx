import { TechnicalAnalysisSolicitationTypes } from '@/utils/select-options';
import { MdAssessment } from 'react-icons/md';
type SolicitationTypeSelectionProps = {
  selectType: (string: (typeof TechnicalAnalysisSolicitationTypes)[number]['value']) => void;
};
function SolicitationTypeSelection({ selectType }: SolicitationTypeSelectionProps) {
  return (
    <div className='flex max-h-full flex-col overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
      <span className='py-2 text-center text-lg font-black uppercase text-[#15599a]'>SELECIONE O TIPO DE ANÁLISE</span>
      <div className='flex w-full flex-col flex-wrap items-start justify-around gap-4 lg:flex-row'>
        {TechnicalAnalysisSolicitationTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => selectType(type.value)}
            className='flex min-h-[250px] w-full cursor-pointer flex-col rounded-md border border-primary/50 p-3 duration-300 ease-in-out hover:scale-[1.025] hover:border-blue-500 hover:bg-blue-50 lg:w-[45%]'
          >
            <h1 className='w-full text-center text-lg font-black tracking-tight'>{type.label}</h1>
            <div className='flex w-full items-center justify-center py-2'>
              <MdAssessment size={35} color='#000' />
            </div>
            <div className='flex w-full flex-col gap-2'>
              {type.descriptions.map((desc, index) => (
                <p key={`description-${index}`} className='w-full text-sm font-medium leading-none tracking-tight text-primary/50 lg:text-base'>
                  {desc}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* <div className="flex w-full items-center gap-2">
        <div
          onClick={() => selectType('VISITA TÉCNICA REMOTA - URBANA')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#fead61', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">VISITA TÉCNICA REMOTA - URBANA</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia uma avaliação técnica.</p>
          <p className="text-center text-sm text-primary/50">
            Uma vez realizada uma visita técnica de uma instalação urbana, preencha um formulário com as informações e imagens coletadas.
          </p>
          <p className="text-center text-sm text-primary/50">
            Concluída a requisição, o formulário passará pela avaliação e estudo da engenharia, que em um prazo máximo de 72 horas úteis retornará um
            laudo técnico para futuras operações.
          </p>
        </div>
        <div
          onClick={() => selectType('VISITA TÉCNICA REMOTA - RURAL')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#fead61', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">VISITA TÉCNICA REMOTA - RURAL</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia uma avaliação técnica.</p>
          <p className="text-center text-sm text-primary/50">
            Uma vez realizada uma visita técnica de uma instalação rural, preencha um formulário com as informações e imagens coletadas.
          </p>
          <p className="text-center text-sm text-primary/50">
            Concluída a requisição, o formulário passará pela avaliação e estudo da engenharia, que em um prazo máximo de 72 horas úteis retornará um
            laudo técnico para futuras operações.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center gap-2">
        <div
          onClick={() => selectType('VISITA TÉCNICA IN LOCO - URBANA')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#15599a', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">VISITA TÉCNICA IN LOCO - URBANA</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia uma avaliação técnica.</p>
          <p className="text-center text-sm text-primary/50">
            Preencha um conjunto de informações acerca do cliente e do projeto a ser avaliado e nosso time de engenharia realizará uma visita técnica
            para coleta e elaboração de um laudo técnico.
          </p>
          <p className="text-center text-sm text-primary/50">Uma vez requisitada, um resultado será informado em um prazo de 72 horas úteis.</p>
        </div>
        <div
          onClick={() => selectType('VISITA TÉCNICA IN LOCO - RURAL')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#15599a', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">VISITA TÉCNICA IN LOCO - RURAL</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia uma avaliação técnica.</p>
          <p className="text-center text-sm text-primary/50">
            Preencha um conjunto de informações acerca do cliente e do projeto a ser avaliado e nosso time de engenharia realizará uma visita técnica
            para coleta e elaboração de um laudo técnico.
          </p>
          <p className="text-center text-sm text-primary/50">Uma vez requisitada, um resultado será informado em um prazo de 72 horas úteis.</p>
        </div>
      </div>
      <div className="flex w-full items-center gap-2">
        <div
          onClick={() => selectType('DESENHO PERSONALIZADO')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#000', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">DESENHO PERSONALIZADO</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia um desenho personalizado.</p>
          <Image src={DrawIcon} alt="DESENHO TÉCNICO" height={50} />
          <p className="text-center text-sm text-primary/50">Uma vez requisitado, um resultado será informado em um prazo de 72 horas úteis.</p>
        </div>
        <div
          onClick={() => selectType('ORÇAMENTAÇÃO')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#000', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">ORÇAMENTAÇÃO</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia uma orçamentação personalizada.</p>
          <FaCalculator style={{ color: 'rgb(34,197,94)', fontSize: '50px' }} />
          <p className="text-center text-sm text-primary/50">Uma vez requisitado, um resultado será informado em um prazo de 72 horas úteis.</p>
        </div>
      </div>
      <div className="flex w-full items-center gap-2">
        <div
          onClick={() => selectType('ALTERAÇÃO DE PROJETO')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#000', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">ALTERAÇÃO DE PROJETO</h1>
          <p className="text-center text-sm text-primary/50">
            Requisite ao nosso time de engenharia uma análise com base em uma alteração/alternativa referente à uma análise prévia.
          </p>
          <FaEdit style={{ color: '#57375D', fontSize: '50px' }} />

          <p className="text-center text-sm text-primary/50">Uma vez requisitado, um resultado será informado em um prazo de 72 horas úteis.</p>
        </div>
        <div
          onClick={() => selectType('AUMENTO DE SISTEMA')}
          className="flex h-[300px] w-full cursor-pointer flex-col items-center gap-2 rounded-xs border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-100 lg:w-[50%]"
        >
          <MdAssessment style={{ color: '#000', fontSize: '35px' }} />
          <h1 className="text-center text-lg font-bold">AUMENTO DE SISTEMA</h1>
          <p className="text-center text-sm text-primary/50">Requisite ao nosso time de engenharia a análise de um aumento de projeto.</p>
          <FaExpandArrowsAlt style={{ color: '#57375D', fontSize: '50px' }} />

          <p className="text-center text-sm text-primary/50">Uma vez requisitado, um resultado será informado em um prazo de 72 horas úteis.</p>
        </div>
      </div> */}
    </div>
  );
}

export default SolicitationTypeSelection;
