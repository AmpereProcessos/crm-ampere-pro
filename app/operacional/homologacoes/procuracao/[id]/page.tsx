export const dynamic = 'force-dynamic';

import ErrorComponent from '@/components/utils/ErrorComponent';
import { getCurrentSession } from '@/lib/auth/session';
import { formatLocation } from '@/lib/methods/formatting';
import { fetchHomologationById } from '@/utils/queries/homologations';
import Logo from '@/utils/svgs/vertical-blue-logo-with-text.svg';
import dayjs from 'dayjs';
import ptBr from 'dayjs/locale/pt-br';
import { ObjectId } from 'mongodb';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { TbWorld } from 'react-icons/tb';
dayjs.locale(ptBr);
async function HomologationProcurationPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();

  if (!session.user || !session.session) {
    return redirect('/auth/signin');
  }

  const awaitedParams = await params;
  const homologationId = awaitedParams.id;
  if (!homologationId || typeof homologationId !== 'string' || !ObjectId.isValid(homologationId)) return <ErrorComponent msg='Oops, ID inválido.' />;

  const homologation = await fetchHomologationById({ id: homologationId });

  return (
    <div className='relative flex h-fit w-full flex-col self-center overflow-hidden bg-background px-12 py-4 lg:h-[297mm] lg:w-[210mm]'>
      <div className='flex min-h-[100px] items-center justify-center'>
        <div className='relative h-[90px] max-h-[90px] min-h-[90px] w-[90px] min-w-[90px] max-w-[90px]'>
          <Image src={Logo} fill={true} alt='Logo da Ampère Energias' />
        </div>
      </div>
      <h1 className='w-full text-center text-[0.9rem] font-black tracking-tight'>INSTRUMENTO PARTICULAR DE PROCURAÇÃO</h1>
      <div className='mt-6 flex w-full flex-col gap-1'>
        <div className='flex w-full items-start gap-1'>
          <h1 className='w-[150px] max-w-[150px] text-[0.9rem] font-black tracking-tight'>Nome</h1>
          <h1 className='grow text-[0.9rem] tracking-tight'>{homologation.titular.nome}</h1>
        </div>
        <div className='flex w-full items-start gap-1'>
          <h1 className='w-[150px] max-w-[150px] text-[0.9rem] font-black tracking-tight'>CPF/CNPJ</h1>
          <h1 className='grow text-[0.9rem] tracking-tight'>{homologation.titular.identificador}</h1>
        </div>
        <div className='flex w-full items-start gap-1'>
          <h1 className='w-[150px] max-w-[150px] text-[0.9rem] font-black tracking-tight'>Endereço</h1>
          <h1 className='grow text-[0.9rem] tracking-tight'>{formatLocation({ location: homologation.localizacao })}</h1>
        </div>
        <div className='flex w-full items-start gap-1'>
          <h1 className='w-[150px] max-w-[150px] text-[0.9rem] font-black tracking-tight'>Cidade</h1>
          <h1 className='grow text-[0.9rem] tracking-tight'>{homologation.localizacao.cidade}</h1>
        </div>
      </div>
      <h2 className='mt-4 w-full text-start text-[0.9rem] tracking-tight'>
        Por este instrumento particular de procuração, nomeio e constituo como PROCURADORES os Senhores abaixo denominados:
      </h2>
      <div className='mt-6 flex w-full flex-col gap-2'>
        <h1 className='w-full text-start text-[0.9rem] tracking-tight'>
          1) DIOGO PAULINO CARVALHO, engenheiro eletricista, brasileiro, solteiro, portador do RG MG 14372057 e CPF: 072.427.186-43. Com registro
          geral CREA nº
          <strong>MG0000222051D</strong>, residente e domiciliado em Ituiutaba-MG.
        </h1>
        <h1 className='w-full text-start text-[0.9rem] tracking-tight'>
          2) POLLIANA CRISTINA DE REZENDE, engenheira eletricista, brasileira, solteira, portador do RG MG 15600702 e CPF: 099.112.586-02. Com
          registro geral CREA nº <strong>MG0000221297D</strong>, residente e domiciliado em Ituiutaba-MG.
        </h1>
      </div>
      <h1 className='mt-6 w-full text-start text-[0.9rem] tracking-tight'>
        Com PODERES junto à distribuidora de energia e ao CREA/CFT para assinar documentos, solicitar Liberação de Carga, Cadastros e Projetos, firmar
        termo de compromisso e responsabilidade enfim, praticar TODOS OS ATOS NECESSÁRIOS ao fiel cumprimento deste mandato e, em especial, a
        aprovação de projeto e execução de geração distribuída e projeto de rede para a(s) unidade(s) consumidora(s) em meu nome. Destacar ainda, que
        as devidas tratativas poderão ser realizadas via e-mail: projetos@ampereenergias.com.br
      </h1>
      <h1 className='mt-6 text-start text-[0.9rem] font-black uppercase tracking-tight'>
        {homologation.localizacao.cidade}, {dayjs().format('DD [de] MMMM [de] YYYY')}
      </h1>
      <div className='mt-16 flex w-full flex-col gap-1'>
        <div className='h-[2px] w-[60%] self-center bg-black' />
        <h1 className='w-full text-center text-[0.9rem] font-black tracking-tight'>{homologation.titular.nome.toUpperCase()}</h1>
        <p className='w-full text-center text-[0.9rem] tracking-tight'>(Outorgante)</p>
        <h1 className='w-full text-center text-[0.9rem] font-black tracking-tight'>{homologation.titular.identificador.toUpperCase()}</h1>
      </div>
      <div className='mt-6 flex w-full flex-col gap-1'>
        <h1 className='w-full text-center text-blue-300'>(34) 3700-7001</h1>
        <div className='mt-6 flex w-full items-center justify-center gap-1'>
          <FaLocationDot size={20} color='rgb(147,197,253)' />
          <p className='text-[0.7rem] tracking-tight text-blue-300'>Avenida Nove, 233, Centro - Ituiutaba/MG - CEP 38.300-150</p>
        </div>
        <div className='flex w-full items-center justify-center gap-2'>
          <div className='flex items-center gap-1'>
            <TbWorld size={20} color='rgb(147,197,253)' />
            <p className='text-[0.7rem] tracking-tight text-blue-300'>www.ampereenergias.com.br</p>
          </div>
          <div className='flex items-center gap-1'>
            <MdEmail size={20} color='rgb(147,197,253)' />
            <p className='text-[0.7rem] tracking-tight text-blue-300'>comercial@ampereenergias.com.br</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomologationProcurationPage;
