import { formatDateAsLocale, formatLocation, formatNameAsInitials, formatToMoney } from "@/lib/methods/formatting";
import { TPurchaseDTO } from "@/utils/schemas/purchase.schema";
import React from "react";
import { BsBox2, BsCalendar, BsCalendarPlus, BsCart, BsPatchCheck, BsTagFill } from "react-icons/bs";
import { FaStoreAlt, FaTruck, FaWarehouse } from "react-icons/fa";
import Avatar from "../utils/Avatar";
import { FaLocationDot } from "react-icons/fa6";

function renderDeliveryText(delivery: TPurchaseDTO["entrega"]) {
	const deliveryForecast = delivery.previsao;
	const deliveryDate = delivery.efetivacao;
	const locationText = formatLocation({ location: delivery.localizacao, includeCity: true, includeUf: true });
	if (!deliveryForecast) return { dates: null, location: locationText };
	var datesText = `ENTREGA PREVISTA PARA ${formatDateAsLocale(deliveryForecast)}`;
	if (deliveryDate) datesText + ` E ENTREGE NO DIA ${formatDateAsLocale(deliveryDate)}`;
	return { dates: datesText, location: locationText };
}

function getStatusTag(status?: string | null) {
	if (status == "AGUARDANDO LIBERAÇÃO") return <h1 className="rounded-md bg-gray-500 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">{status}</h1>;

	if (status == "AGUARDANDO PAGAMENTO") return <h1 className="rounded-md bg-blue-500 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">{status}</h1>;

	if (status == "PENDÊNCIA COMERCIAL") return <h1 className="rounded-md bg-green-800 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">{status}</h1>;

	if (status == "PENDÊNCIA OPERACIONAL") return <h1 className="rounded-md bg-blue-800 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">{status}</h1>;

	if (status == "PENDÊNCIA EXTERNA") return <h1 className="rounded-md bg-gray-800 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">{status}</h1>;

	if (status == "CONCLUÍDA") return <h1 className="rounded-md bg-green-500 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">{status}</h1>;

	return <h1 className="rounded-md bg-gray-500 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">NÃO DEFINIDO</h1>;
}
type PurchaseCardProps = {
	purchase: TPurchaseDTO;
	handleClick: (id: string) => void;
};
function PurchaseCard({ purchase, handleClick }: PurchaseCardProps) {
	const { dates: deliveryDatesText, location: deliveryLocationText } = renderDeliveryText(purchase.entrega);
	const total = purchase.total;
	return (
		<div className="flex w-full flex-col gap-2 rounded-md border border-gray-500 bg-[#fff] p-2">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-1">
					{getStatusTag(purchase.status)}
					{true ? (
						<h1 onClick={() => handleClick(purchase._id)} className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500">
							{purchase.titulo}
						</h1>
					) : (
						<h1 className="text-sm font-black leading-none tracking-tight">{purchase.titulo}</h1>
					)}
				</div>
				<h1 className="rounded-lg bg-black px-2 py-0.5 text-center text-[0.65rem] font-bold text-white lg:py-1">{formatToMoney(purchase.total)}</h1>
			</div>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex items-center gap-2">
					<div className="hidden w-full flex-wrap items-center gap-1 xl:flex">
						<BsCart size={12} />
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">ITENS:</p>
						{purchase.composicao.map((item, index) => (
							<div key={index} className="rounded border border-gray-500 bg-[#f8f8f8] p-2 text-center shadow-md">
								<p className="text-[0.6rem] font-medium leading-none tracking-tight">
									{item.qtde} x {item.descricao}
								</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<Avatar url={purchase.liberacao.autor?.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(purchase.liberacao.autor?.nome || "NA")} />
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">
							LIBERADO POR {purchase.liberacao.autor?.nome} EM {formatDateAsLocale(purchase.liberacao.data)}
						</p>
					</div>
					<div className={`flex items-center gap-1`}>
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(purchase.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
			{/* 
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <BsPatchCheck size={12} />
          <p className="text-[0.65rem] font-medium text-gray-500">LIBERAÇÃO</p>
        </div>
        {!!purchase.liberacao.data ? (
          <div className="flex items-center gap-2">
            <Avatar
              url={purchase.liberacao.autor?.avatar_url || undefined}
              height={20}
              width={20}
              fallback={formatNameAsInitials(purchase.liberacao.autor?.nome || 'NA')}
            />
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">
              LIBERADO POR {purchase.liberacao.autor?.nome} EM {formatDateAsLocale(purchase.liberacao.data)}
            </p>
          </div>
        ) : (
          <p className="text-[0.6rem] font-medium leading-none tracking-tight">NÃO LIBERADO</p>
        )}
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center gap-1">
          <BsCart size={12} />
          <p className="text-[0.65rem] font-medium text-gray-500">COMPOSIÇÃO</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          {purchase.composicao.map((item, index) => (
            <div key={index} className="rounded border border-gray-500 bg-[#f8f8f8] p-2 text-center shadow-md">
              <p className="text-[0.6rem] font-medium leading-none tracking-tight">
                {item.qtde} x {item.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="flex flex-col items-center gap-1 lg:items-start">
          <div className="flex items-center gap-1">
            <BsTagFill size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">PEDIDO</p>
          </div>
          {!!purchase.pedido.data ? (
            <div className="flex items-center gap-2">
              <p className="text-[0.6rem] font-medium leading-none tracking-tight">
                PEDIDO REALIZADO EM {formatDateAsLocale(purchase.pedido.data)} COM O(A) {purchase.pedido.fornecedor.nome || 'FORNECEDOR NÃO DEFINIDO'}
              </p>
            </div>
          ) : (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">PEDIDO NÃO REALIZADO</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <div className="flex items-center gap-1">
            <FaTruck size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">TRANSPORTE</p>
          </div>
          {purchase.transporte.transportadora.nome.trim().length > 0 ? (
            <div className="flex items-center gap-2">
              <p className="text-[0.6rem] font-medium leading-none tracking-tight">TRANSPORTE SERÁ REALIZADO POR {purchase.transporte.transportadora.nome}</p>
            </div>
          ) : (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">TRANSPORTADORA NÃO DEFINIDA</p>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="flex flex-col items-center gap-1 lg:items-start">
          <div className="flex items-center gap-1">
            <FaTruck size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">FATURAMENTO</p>
          </div>
          {!!purchase.faturamento.data ? (
            <div className="flex items-center gap-2">
              <p className="text-[0.6rem] font-medium leading-none tracking-tight">
                FATURAMENTO FEITO EM {formatDateAsLocale(purchase.faturamento.data)} COM O CÓDIGO {purchase.faturamento.codigoNotaFiscal}
              </p>
            </div>
          ) : (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">FATURAMENTO NÃO REALIZADO</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <div className="flex items-center gap-1">
            <BsBox2 size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">ENTREGA</p>
          </div>
          {renderDeliveryText(purchase.entrega).dates ? (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">{renderDeliveryText(purchase.entrega).dates}</p>
          ) : null}
          {renderDeliveryText(purchase.entrega).location ? (
            <div className="flex items-center justify-start gap-1">
              <FaLocationDot size={12} />
              <p className="break-words text-[0.6rem] font-medium leading-none tracking-tight">{renderDeliveryText(purchase.entrega).location}</p>
            </div>
          ) : (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">LOCALIZAÇÃO DE ENTREGA NÃO DEFINIDA</p>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-end">
        <div className={`flex items-center gap-1`}>
          <BsCalendarPlus />
          <p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(purchase.dataInsercao, true)}</p>
        </div>
      </div> */}
		</div>
	);
}

export default PurchaseCard;
