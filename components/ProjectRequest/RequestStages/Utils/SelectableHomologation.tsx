import Avatar from '@/components/utils/Avatar';
import { getInverterPeakPowerByProducts, getModulesPeakPotByProducts } from '@/lib/methods/extracting';
import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials } from '@/lib/methods/formatting';
import { THomologationDTO } from '@/utils/schemas/homologation.schema';
import { TProductItem } from '@/utils/schemas/kits.schema';
import { BsCalendarPlus, BsCode } from 'react-icons/bs';
import { FaSolarPanel } from 'react-icons/fa';
import { FaBolt } from 'react-icons/fa6';
import { ImPower } from 'react-icons/im';

function getTagColor(status: string) {
  if (status == 'PENDENTE') return 'bg-primary/80';
  if (status == 'ELABORANDO DOCUMENTAÇÕES') return 'bg-blue-500';
  if (['AGUARDANDO ASSINATURA', 'AGUARDANDO FATURAMENTO', 'AGUARDANDO PENDÊNCIAS'].includes(status)) return 'bg-orange-500';
  if (status == 'REPROVADO COM REDUÇÃO') return 'bg-orange-700';
  if (['APROVADO COM OBRAS', 'APROVADO COM REDUÇÃO'].includes(status)) return 'bg-green-700';
  if (status == 'APROVADO') return 'bg-green-500';
  return 'bg-primary/80';
}
function getStatusTag(status: string) {
  if (status == 'PENDENTE')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-primary/50 p-1 text-center text-[0.6rem] font-black text-primary/50`}>{status}</h1>
    );
  if (status == 'ELABORANDO DOCUMENTAÇÕES')
    return <h1 className={`w-fit self-center rounded-sm border border-blue-500 p-1 text-center text-[0.6rem] font-black text-blue-500`}>{status}</h1>;
  if (['AGUARDANDO ASSINATURA', 'AGUARDANDO FATURAMENTO', 'AGUARDANDO PENDÊNCIAS'].includes(status))
    return (
      <h1 className={`w-fit self-center rounded-sm border border-orange-500 p-1 text-center text-[0.6rem] font-black text-orange-500`}>{status}</h1>
    );
  if (status == 'REPROVADO COM REDUÇÃO')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-orange-700 p-1 text-center text-[0.6rem] font-black text-orange-700`}>{status}</h1>
    );
  if (['APROVADO COM OBRAS', 'APROVADO COM REDUÇÃO'].includes(status))
    return (
      <h1 className={`w-fit self-center rounded-sm border border-green-700 p-1 text-center text-[0.6rem] font-black text-green-700`}>{status}</h1>
    );
  if (status == 'APROVADO')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500`}>{status}</h1>
    );
  return (
    <h1 className={`w-fit self-center rounded-sm border border-primary/50 p-1 text-center text-[0.6rem] font-black text-primary/50`}>{status}</h1>
  );
}
type SelectableHomologationProps = {
  homologation: THomologationDTO;
  selectHomologation: (id: string) => void;
};
function SelectableHomologation({ homologation, selectHomologation }: SelectableHomologationProps) {
  return (
    <div className='flex w-full items-center rounded-md border border-primary/30'>
      <div className={`h-full w-[5px] rounded-bl-md rounded-tl-md ${getTagColor(homologation.status)}`}></div>
      <div className='flex grow flex-col p-3'>
        <div className='flex w-full flex-col items-center justify-between lg:flex-row lg:items-start'>
          <div className='flex flex-col'>
            <h1 className='grow cursor-pointer text-center text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500 lg:text-start'>
              {homologation.titular.nome}
            </h1>
            <div className='flex items-center gap-1'>
              <BsCode />
              <p className='text-xs font-medium tracking-tight text-primary/50'>INSTALAÇÃO Nº {homologation.instalacao.numeroInstalacao}</p>
            </div>
          </div>

          {getStatusTag(homologation.status)}
        </div>
        <div className='mt-2 flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
          <div className='flex flex-col items-center lg:items-start'>
            <h1 className='text-[0.65rem] font-light leading-none tracking-tight text-primary/50 lg:text-xs'>REQUISITADO</h1>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1 rounded-sm p-1'>
                <FaSolarPanel />
                <p className='text-[0.55rem] font-medium tracking-tight text-primary/50 lg:text-xs'>
                  {formatDecimalPlaces(getModulesPeakPotByProducts(homologation.equipamentos as TProductItem[]))} kWp EM MÓDULOS
                </p>
              </div>
              <div className='flex items-center gap-1 rounded-sm p-1'>
                <ImPower />
                <p className='text-[0.55rem] font-medium tracking-tight text-primary/50 lg:text-xs'>
                  {formatDecimalPlaces(getInverterPeakPowerByProducts(homologation.equipamentos as TProductItem[]))} kWp EM INVERSORES
                </p>
              </div>
            </div>
          </div>
          {!!homologation.potencia && homologation.potencia > 0 ? (
            <div className='flex flex-col items-center lg:items-end'>
              <h1 className='text-[0.65rem] font-light leading-none tracking-tight text-primary/50 lg:text-xs'>LIBERADO</h1>
              <div className='flex items-center gap-1 rounded-sm bg-green-50 p-1 text-green-500'>
                <FaBolt />
                <p className='text-[0.55rem] font-medium tracking-tight lg:text-xs'>{formatDecimalPlaces(homologation.potencia)} kWp EM INVERSORES</p>
              </div>
            </div>
          ) : null}
        </div>
        <div className='mt-2 flex w-full flex-col items-center justify-center gap-2 lg:flex-row lg:justify-end'>
          <div className='flex flex-col items-center gap-2 lg:flex-row'>
            <div className='flex items-center gap-1'>
              <BsCalendarPlus />
              <p className='text-[0.65rem] font-medium text-primary/50'>{formatDateAsLocale(homologation.dataInsercao, true)}</p>
            </div>
            <div className='flex items-center gap-1'>
              <Avatar
                url={homologation.autor.avatar_url || undefined}
                fallback={formatNameAsInitials(homologation.autor.nome)}
                height={20}
                width={20}
              />
              <p className='text-[0.65rem] font-medium text-primary/50'>{homologation.autor.nome}</p>
            </div>
          </div>
        </div>
        <div className='mt-1 flex w-full items-center justify-end'>
          <button
            onClick={() => selectHomologation(homologation._id)}
            className='rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-white duration-300 ease-in-out hover:bg-blue-700 lg:text-xs'
          >
            SELECIONAR
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectableHomologation;
