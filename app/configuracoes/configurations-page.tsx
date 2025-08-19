'use client';
import { useState } from 'react';
import Funnels from '@/components/Configuration/Funnels';
import Goals from '@/components/Configuration/Goals';
import Integrations from '@/components/Configuration/Integrations';
import Partner from '@/components/Configuration/Partner';
import Partners from '@/components/Configuration/Partners';
import PaymentMethods from '@/components/Configuration/PaymentMethods';
import Personalization from '@/components/Configuration/Personalization';
import PricingMethods from '@/components/Configuration/PricingMethods';
import Profile from '@/components/Configuration/Profile';
import ProjectTypes from '@/components/Configuration/ProjectTypes';
import UserGroups from '@/components/Configuration/UserGroups';
import Users from '@/components/Configuration/Users';
import { Sidebar } from '@/components/Sidebar';
import type { TUserSession } from '@/lib/auth/session';

type TConfigurationModes =
  | 'profile'
  | 'partner'
  | 'users'
  | 'user-groups'
  | 'funnels'
  | 'pricing-methods'
  | 'payment-methods'
  | 'integrations'
  | 'project-types'
  | 'partners'
  | 'goals'
  | 'personalization';

type ConfigurationsPageProps = {
  session: TUserSession;
};
function ConfigurationsPage({ session }: ConfigurationsPageProps) {
  const [mode, setMode] = useState<TConfigurationModes>('profile');
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col border-gray-300 border-b px-6 pb-2">
          <h1 className="font-bold text-2xl tracking-tight">Configurações</h1>
          <p className="text-[#71717A]">Gerencie configurações e preferências</p>
        </div>
        <div className="flex grow flex-col items-start gap-2 py-2 lg:flex-row">
          <div className="flex h-fit w-full flex-col gap-1 px-2 py-2 lg:h-full lg:w-1/5">
            <button
              className={`${
                mode === 'profile' ? 'bg-gray-100' : ''
              } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
              onClick={() => setMode('profile')}
              type="button"
            >
              Perfil
            </button>
            {session.user.permissoes.configuracoes.parceiro ? (
              <button
                className={`${
                  mode === 'partner' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('partner')}
                type="button"
              >
                Empresa
              </button>
            ) : null}
            {session.user.permissoes.usuarios.visualizar ? (
              <button
                className={`${
                  mode === 'users' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('users')}
                type="button"
              >
                Usuários
              </button>
            ) : null}
            {session.user.permissoes.configuracoes.gruposUsuarios ? (
              <button
                className={`${
                  mode === 'user-groups' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('user-groups')}
                type="button"
              >
                Grupos de usuários
              </button>
            ) : null}
            {session.user.permissoes.configuracoes.tiposProjeto ? (
              <button
                className={`${
                  mode === 'project-types' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('project-types')}
                type="button"
              >
                Tipos de projeto
              </button>
            ) : null}
            {session.user.permissoes.configuracoes.funis ? (
              <button
                className={`${
                  mode === 'funnels' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('funnels')}
                type="button"
              >
                Funis
              </button>
            ) : null}
            {session.user.permissoes.precos.editar ? (
              <button
                className={`${
                  mode === 'pricing-methods' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('pricing-methods')}
                type="button"
              >
                Metodologias de precificação
              </button>
            ) : null}
            {session.user.permissoes.precos.editar ? (
              <button
                className={`${
                  mode === 'payment-methods' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('payment-methods')}
                type="button"
              >
                Métodos de pagamento
              </button>
            ) : null}
            {session.user.permissoes.parceiros.visualizar ? (
              <button
                className={`${
                  mode === 'partners' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('partners')}
                type="button"
              >
                Parceiros
              </button>
            ) : null}
            {session.user.permissoes.configuracoes.parceiro ? (
              <button
                className={`${
                  mode === 'integrations' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('integrations')}
                type="button"
              >
                Integrações
              </button>
            ) : null}
            {session.user.permissoes.configuracoes.parceiro ? (
              <button
                className={`${
                  mode === 'personalization' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('personalization')}
                type="button"
              >
                Personalizações
              </button>
            ) : null}
            {session.user.permissoes.resultados.visualizarComercial ? (
              <button
                className={`${
                  mode === 'goals' ? 'bg-gray-100' : ''
                } w-full rounded-md px-4 py-2 text-center font-semibold text-gray-600 text-xs duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
                onClick={() => setMode('goals')}
                type="button"
              >
                Metas
              </button>
            ) : null}
          </div>
          <div className="flex h-full w-full flex-col gap-1 px-2 py-2 lg:w-4/5">
            {mode === 'profile' ? <Profile session={session} /> : null}
            {mode === 'partner' ? <Partner session={session} /> : null}
            {mode === 'users' ? <Users session={session} /> : null}
            {mode === 'user-groups' ? <UserGroups session={session} /> : null}
            {mode === 'funnels' ? <Funnels session={session} /> : null}
            {mode === 'pricing-methods' ? <PricingMethods session={session} /> : null}
            {mode === 'payment-methods' ? <PaymentMethods session={session} /> : null}
            {mode === 'partners' ? <Partners session={session} /> : null}
            {mode === 'integrations' ? <Integrations session={session} /> : null}
            {mode === 'project-types' ? <ProjectTypes session={session} /> : null}
            {mode === 'personalization' ? <Personalization session={session} /> : null}
            {mode === 'goals' ? <Goals session={session} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationsPage;
