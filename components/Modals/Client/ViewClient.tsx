import ResponsiveDialogDrawerViewOnly from '@/components/utils/ResponsiveDialogDrawerViewOnly';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { getErrorMessage } from '@/lib/methods/errors';
import { useClientById } from '@/utils/queries/clients';
import { AtSign, FileText, MapPin, Phone, UserRound } from 'lucide-react';

export default function ViewClient({ clientId, closeModal }: { clientId: string; closeModal: () => void }) {
  const { data: client, isLoading, isError, error } = useClientById({ id: clientId });
  const address = client ? [client.endereco, client.numeroOuIdentificador, client.bairro, client.cidade, client.uf].filter(Boolean).join(', ') : '';

  return (
    <ResponsiveDialogDrawerViewOnly
      menuTitle='Visualizar cliente'
      menuDescription='Dados cadastrais e de contato disponíveis no seu escopo.'
      menuCancelButtonText='Fechar'
      closeMenu={closeModal}
      dialogContentClassName='max-w-2xl'
    >
      {isLoading ? <LoadingComponent /> : null}
      {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
      {client ? (
        <div className='grid gap-3 sm:grid-cols-2'>
          <ClientDetail icon={UserRound} label='Cliente' value={client.nome} className='sm:col-span-2' />
          <ClientDetail icon={FileText} label='CPF / CNPJ' value={client.cpfCnpj} />
          <ClientDetail
            icon={Phone}
            label='Telefone'
            value={client.telefonePrimario}
            href={client.telefonePrimario ? `tel:${client.telefonePrimario}` : undefined}
          />
          <ClientDetail icon={AtSign} label='E-mail' value={client.email} href={client.email ? `mailto:${client.email}` : undefined} />
          <ClientDetail icon={MapPin} label='Localização' value={address} className='sm:col-span-2' />
        </div>
      ) : null}
    </ResponsiveDialogDrawerViewOnly>
  );
}

function ClientDetail({
  icon: Icon,
  label,
  value,
  href,
  className,
}: {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
  href?: string;
  className?: string;
}) {
  const content = value || 'Não informado';
  return (
    <div className={`rounded-xl border border-border/70 bg-muted/20 p-3 ${className ?? ''}`}>
      <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
        <Icon className='size-3.5 text-primary' />
        {label}
      </div>
      {href && value ? (
        <a href={href} className='mt-1.5 block break-words text-sm font-semibold text-primary hover:underline'>
          {content}
        </a>
      ) : (
        <p className='mt-1.5 break-words text-sm font-semibold text-foreground'>{content}</p>
      )}
    </div>
  );
}
