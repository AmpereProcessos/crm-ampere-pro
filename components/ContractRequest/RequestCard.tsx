import { formatDateAsLocale } from '@/lib/methods/formatting';
import { TContractRequestPartialDTO } from '@/utils/schemas/contract-request';
import { BsCalendarPlus } from 'react-icons/bs';
import { FaCity, FaCode, FaUser } from 'react-icons/fa';
import { TbCategoryFilled } from 'react-icons/tb';

function getCardStatus({ approved, contractMade }: { approved?: boolean | null; contractMade: boolean }) {
  if (approved && contractMade)
    return (
      <div className='flex min-w-fit items-center gap-2 rounded-full bg-green-600 px-2 py-1 '>
        <h1 className='text-[0.65rem] font-medium text-white lg:text-xs'>FINALIZADO</h1>
      </div>
    );
  if (approved)
    return (
      <div className='flex min-w-fit items-center gap-2 rounded-full bg-blue-500 px-2 py-1 '>
        <h1 className='text-[0.65rem] font-medium text-white lg:text-xs'>APROVADO</h1>
      </div>
    );
  if (approved == false)
    return (
      <div className='flex min-w-fit items-center gap-2 rounded-full bg-red-500 px-2 py-1 '>
        <h1 className='text-[0.65rem] font-medium text-white lg:text-xs'>REPROVADO</h1>
      </div>
    );
  return (
    <div className='flex min-w-fit items-center gap-2 rounded-full bg-orange-500 px-2 py-1 '>
      <h1 className='text-[0.65rem] font-medium text-white lg:text-xs'>PENDENTE</h1>
    </div>
  );
}
type RequestCardProps = {
  request: TContractRequestPartialDTO;
  openModal: (id: string) => void;
};
function RequestCard({ request, openModal }: RequestCardProps) {
  return (
    <div className='flex w-full flex-col rounded-md border border-primary/30 p-4 lg:w-[450px]'>
      <div className='flex w-full items-center justify-between gap-2'>
        <h1
          onClick={() => openModal(request._id)}
          className='cursor-pointer text-xs font-black leading-none tracking-tight hover:text-cyan-500 lg:text-sm'
        >
          {request.nomeDoContrato}
        </h1>
        {getCardStatus({ approved: request.aprovacao, contractMade: !!request.confeccionado })}
      </div>
      <div className='mt-2 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <FaCity />
          <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/50 lg:text-xs'>{request.cidade}</p>
        </div>
        <div className='flex items-center gap-2 text-blue-800'>
          <FaUser color={'rgb(30,64,175)'} />
          <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/50 lg:text-xs'>{request.nomeVendedor}</p>
        </div>
      </div>
      <div className='mt-2 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          {request.idProjetoCRM ? <FaCode color={'rgb(34,197,94)'} /> : null}
          <h1 className='text-[0.6rem] leading-none tracking-tight text-primary/50'>
            IDENTIFICADOR: <strong>{request.codigoSVB}</strong>
          </h1>
        </div>
        {request.idVisitaTecnica ? (
          <div className='flex items-center gap-2'>
            {request.idVisitaTecnica ? <FaCode color={'rgb(34,197,94)'} /> : null}
            <h1 className='text-[0.6rem] leading-none tracking-tight text-primary/50'>VISITA VINCULADA</h1>
          </div>
        ) : (
          <h1 className='text-[0.6rem] leading-none tracking-tight text-primary/50'>SEM VISITA VINCULADA</h1>
        )}
      </div>
      <div className='mt-2 flex items-center justify-between gap-2'>
        <div className={`flex items-center gap-2`}>
          <TbCategoryFilled />
          <p className='text-xs font-medium text-primary/50'>{request.tipoDeServico}</p>
        </div>
        <div className={`flex items-center gap-2`}>
          <BsCalendarPlus />
          <p className='text-xs font-medium text-primary/50'>{formatDateAsLocale(request.dataSolicitacao)}</p>
        </div>
      </div>
    </div>
  );
}

export default RequestCard;
