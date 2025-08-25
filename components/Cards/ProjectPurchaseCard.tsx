import { formatDateAsLocale, formatLocation, formatNameAsInitials } from '@/lib/methods/formatting';
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema';
import { BsBox2, BsCart, BsPatchCheck, BsTagFill } from 'react-icons/bs';
import { FaTruck } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import Avatar from '../utils/Avatar';

function renderDeliveryText(delivery: TPurchaseDTO['entrega']) {
  const deliveryForecast = delivery.previsao;
  const deliveryDate = delivery.efetivacao;
  const locationText = formatLocation({ location: delivery.localizacao, includeCity: true, includeUf: true });
  if (!deliveryForecast) return { dates: null, location: locationText };
  var datesText = `ENTREGA PREVISTA PARA ${formatDateAsLocale(deliveryForecast)}`;
  if (deliveryDate) datesText + ` E ENTREGE NO DIA ${formatDateAsLocale(deliveryDate)}`;
  return { dates: datesText, location: locationText };
}

function getStatusTag(status?: string | null) {
  if (status == 'AGUARDANDO LIBERAÇÃO')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-primary/50 p-1 text-center text-[0.6rem] font-black text-primary/70`}>{status}</h1>
    );

  if (status == 'AGUARDANDO PAGAMENTO')
    return <h1 className={`w-fit self-center rounded-sm border border-blue-500 p-1 text-center text-[0.6rem] font-black text-blue-500`}>{status}</h1>;

  if (status == 'PENDÊNCIA COMERCIAL')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-green-800 p-1 text-center text-[0.6rem] font-black text-green-800`}>{status}</h1>
    );

  if (status == 'PENDÊNCIA OPERACIONAL')
    return <h1 className={`w-fit self-center rounded-sm border border-blue-800 p-1 text-center text-[0.6rem] font-black text-blue-800`}>{status}</h1>;

  if (status == 'PENDÊNCIA EXTERNA')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-primary/80 p-1 text-center text-[0.6rem] font-black text-primary/80`}>{status}</h1>
    );

  if (status == 'CONCLUÍDA')
    return (
      <h1 className={`w-fit self-center rounded-sm border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500`}>{status}</h1>
    );

  return (
    <h1 className={`w-fit self-center rounded-sm border border-primary/50 p-1 text-center text-[0.6rem] font-black text-primary/70`}>NÃO DEFINIDO</h1>
  );
}
type ProjectPurchaseCardProps = {
  purchase: TPurchaseDTO;
};
function ProjectPurchaseCard({ purchase }: ProjectPurchaseCardProps) {
  const { dates: deliveryDatesText, location: deliveryLocationText } = renderDeliveryText(purchase.entrega);
  console.log(deliveryLocationText);
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/30 bg-background p-3'>
      <div className='flex w-full items-center justify-between'>
        <h1 className='text-sm font-black leading-none tracking-tight'>{purchase.titulo}</h1>
        <div className='flex items-center gap-2'>{getStatusTag(purchase.status)}</div>
      </div>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1'>
          <BsPatchCheck size={12} />
          <p className='text-[0.65rem] font-medium text-primary/70'>LIBERAÇÃO</p>
        </div>
        {!!purchase.liberacao.data ? (
          <div className='flex items-center gap-2'>
            <Avatar
              url={purchase.liberacao.autor?.avatar_url || undefined}
              height={20}
              width={20}
              fallback={formatNameAsInitials(purchase.liberacao.autor?.nome || 'NA')}
            />
            <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
              LIBERADO POR {purchase.liberacao.autor?.nome} EM {formatDateAsLocale(purchase.liberacao.data)}
            </p>
          </div>
        ) : (
          <p className='text-[0.6rem] font-medium leading-none tracking-tight'>NÃO LIBERADO</p>
        )}
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex items-center gap-1'>
          <BsCart size={12} />
          <p className='text-[0.65rem] font-medium text-primary/70'>COMPOSIÇÃO</p>
        </div>
        <div className='flex w-full flex-wrap items-center gap-2'>
          {purchase.composicao.map((item, index) => (
            <div key={index} className='rounded border border-primary/50 bg-[#f8f8f8] p-2 text-center shadow-md'>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                {item.qtde} x {item.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
        <div className='flex flex-col items-center gap-1 lg:items-start'>
          <div className='flex items-center gap-1'>
            <BsTagFill size={12} />
            <p className='text-[0.65rem] font-medium text-primary/70'>PEDIDO</p>
          </div>
          {!!purchase.pedido.data ? (
            <div className='flex items-center gap-2'>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                PEDIDO REALIZADO EM {formatDateAsLocale(purchase.pedido.data)} COM O(A) {purchase.pedido.fornecedor.nome || 'FORNECEDOR NÃO DEFINIDO'}
              </p>
            </div>
          ) : (
            <p className='text-[0.6rem] font-medium leading-none tracking-tight'>PEDIDO NÃO REALIZADO</p>
          )}
        </div>
        <div className='flex flex-col items-center gap-1 lg:items-end'>
          <div className='flex items-center gap-1'>
            <FaTruck size={12} />
            <p className='text-[0.65rem] font-medium text-primary/70'>TRANSPORTE</p>
          </div>
          {purchase.transporte.transportadora.nome.trim().length > 0 ? (
            <div className='flex items-center gap-2'>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                TRANSPORTE SERÁ REALIZADO POR {purchase.transporte.transportadora.nome}
              </p>
            </div>
          ) : (
            <p className='text-[0.6rem] font-medium leading-none tracking-tight'>TRANSPORTADORA NÃO DEFINIDA</p>
          )}
        </div>
      </div>
      <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
        <div className='flex flex-col items-center gap-1 lg:items-start'>
          <div className='flex items-center gap-1'>
            <FaTruck size={12} />
            <p className='text-[0.65rem] font-medium text-primary/70'>FATURAMENTO</p>
          </div>
          {!!purchase.faturamento.data ? (
            <div className='flex items-center gap-2'>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                FATURAMENTO FEITO EM {formatDateAsLocale(purchase.faturamento.data)} COM O CÓDIGO {purchase.faturamento.codigoNotaFiscal}
              </p>
            </div>
          ) : (
            <p className='text-[0.6rem] font-medium leading-none tracking-tight'>FATURAMENTO NÃO REALIZADO</p>
          )}
        </div>
        <div className='flex flex-col items-center gap-1 lg:items-end'>
          <div className='flex items-center gap-1'>
            <BsBox2 size={12} />
            <p className='text-[0.65rem] font-medium text-primary/70'>ENTREGA</p>
          </div>
          {renderDeliveryText(purchase.entrega).dates ? (
            <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{renderDeliveryText(purchase.entrega).dates}</p>
          ) : null}
          {renderDeliveryText(purchase.entrega).location ? (
            <div className='flex items-center gap-1'>
              <FaLocationDot size={12} />
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{renderDeliveryText(purchase.entrega).location}</p>
            </div>
          ) : (
            <p className='text-[0.6rem] font-medium leading-none tracking-tight'>LOCALIZAÇÃO DE ENTREGA NÃO DEFINIDA</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectPurchaseCard;
