'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { BsBookmarksFill, BsCart, BsFillClipboardDataFill, BsFillFunnelFill } from 'react-icons/bs';
import { FaPercent, FaProjectDiagram, FaTag, FaUser } from 'react-icons/fa';
import { MdDashboard, MdLogout, MdOutlineMiscellaneousServices } from 'react-icons/md';
import { TfiAngleRight } from 'react-icons/tfi';
import Logo from '../utils/images/ampere-logo-azul.png';
import SidebarItem from './SidebarItem';

import type { TUserSession } from '@/lib/auth/session';
import { usePathname } from 'next/navigation';
import { BiStats } from 'react-icons/bi';
import { IoMdSettings } from 'react-icons/io';
import NotificationBlock from './NotificationBlock';
import { ThemeToggle } from './utils/ThemeToggle';

//react-icons.github.io/react-icons

type SidebarProps = {
  session: TUserSession;
};
export const Sidebar = ({ session }: SidebarProps) => {
  const [sidebarExtended, setSidebarExtended] = useState(false);
  const pathname = usePathname();
  if (pathname?.includes('/auth/signin')) return null;
  return (
    <>
      <motion.div
        layout={true}
        transition={{
          type: 'keyframes',
          ease: 'easeInOut',
          delay: 0.1,
        }}
        style={{
          maxHeight: '100vh',
          overflow: 'visible',
        }}
        className={`sticky top-0 z-90 hidden flex-col border-r border-primary/30 bg-background px-2 py-4 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30 md:flex ${
          sidebarExtended ? 'w-[210px] min-w-[210px]' : 'w-[70px] min-w-[70px]'
        }`}
      >
        <div className='flex h-[70px] w-full items-start justify-center'>
          <div className='relative h-[37px] w-[37px]'>
            <Image src={Logo} alt='LOGO' title='LOGO' fill={true} />
          </div>
        </div>
        <div className='flex w-full grow flex-col overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          <motion.div
            animate={sidebarExtended ? 'active' : 'inactive'}
            variants={{
              inactive: {
                rotate: 0,
              },
              active: {
                rotate: 180,
              },
            }}
            onClick={() => setSidebarExtended((prev) => !prev)}
            className={'my-2  flex w-fit cursor-pointer items-center justify-center self-center rounded-sm p-2 duration-300 ease-in hover:scale-105'}
          >
            <TfiAngleRight />
          </motion.div>
          {sidebarExtended ? <h2 className='h-[18px] text-xs text-primary/50'>PRINCIPAL</h2> : <div className='h-[18px] w-full ' />}
          <SidebarItem text='Dashboard' isOpen={sidebarExtended} url='/' icon={<BiStats className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />} />
          <SidebarItem
            text='Oportunidades'
            isOpen={sidebarExtended}
            url='/comercial/oportunidades'
            icon={<BsFillFunnelFill className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
          />
          <SidebarItem
            text='Comissões'
            isOpen={sidebarExtended}
            url='/comercial/oportunidades/comissoes'
            icon={<FaPercent className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
          />
          <SidebarItem text='Clientes' isOpen={sidebarExtended} url='/clientes' icon={<FaUser className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />} />
          {sidebarExtended ? <h2 className='mt-2 h-[18px] text-xs text-primary/50'>COMPOSIÇÕES</h2> : <div className='mt-2 h-[18px]' />}
          <SidebarItem text='Kits' isOpen={sidebarExtended} url='/kits' icon={<FaTag className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />} />
          <SidebarItem
            text='Planos de assinatura'
            isOpen={sidebarExtended}
            url='/planos'
            icon={<BsBookmarksFill className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
          />
          <SidebarItem text='Produtos' isOpen={sidebarExtended} url='/produtos' icon={<BsCart className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />} />
          <SidebarItem
            text='Serviços'
            isOpen={sidebarExtended}
            url='/servicos'
            icon={<MdOutlineMiscellaneousServices className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
          />
          {sidebarExtended ? <h2 className='mt-2 h-[18px] text-xs text-primary/50'>OPERACIONAL</h2> : <div className='mt-2 h-[18px]' />}
          {/* <SidebarItem
            text="Homologações"
            isOpen={sidebarExtended}
            url="/operacional/homologacoes"
            icon={<FaProjectDiagram className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
          /> */}
          <SidebarItem
            text='Análises Técnicas'
            isOpen={sidebarExtended}
            url='/operacional/analises-tecnicas'
            icon={<BsFillClipboardDataFill className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
          />
          {session.user.permissoes.projetos.visualizar ? (
            <SidebarItem
              text='Projetos'
              isOpen={sidebarExtended}
              url='/operacional/setores/comercial'
              icon={<MdDashboard className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
            />
          ) : (
            false
          )}
        </div>
        <div className='flex w-full items-center justify-center py-2' style={{ position: 'relative', zIndex: 100 }}>
          <NotificationBlock session={session} />
        </div>
        <div className='w-full flex flex-col gap-2'>
          {session?.user.avatar_url ? (
            <div className='flex w-full items-center justify-center'>
              <Link href={`/auth/perfil?id=${session.user.id}`}>
                <div className='relative h-[37px] w-[37px]'>
                  <Image src={session?.user.avatar_url} alt='USUÁRIO' title='CONFIGURAÇÕES' fill={true} style={{ borderRadius: '100%' }} />
                </div>
              </Link>
            </div>
          ) : null}
          <ThemeToggle />

          <div className='flex w-full flex-col'>
            <SidebarItem
              text='Configurações'
              isOpen={sidebarExtended}
              url={'/configuracoes'}
              icon={<IoMdSettings className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
            />
            <Link
              href={'/api/auth/logout'}
              prefetch={false}
              className={
                'mt-2 flex cursor-pointer items-center justify-center rounded-sm p-2  duration-300 ease-in  hover:bg-blue-100 dark:hover:bg-primary/30'
              }
            >
              <MdLogout className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />
            </Link>
          </div>
        </div>
      </motion.div>
      <div
        className={`sticky  z-90 flex flex-col ${sidebarExtended ? 'h-fit' : 'h-[50px] '} w-full items-center border-t border-primary/30 bg-background pb-4 md:hidden`}
      >
        <div className='grid h-[50px] w-full grid-cols-4'>
          <div className='col-span-1 flex items-center justify-center gap-2'>
            {session?.user.avatar_url ? (
              <div className='flex h-full w-fit items-center justify-center'>
                <div className='relative h-[33px] w-[33px]'>
                  <Image src={session?.user.avatar_url} alt='USUÁRIO' title='CONFIGURAÇÕES' fill={true} style={{ borderRadius: '100%' }} />
                </div>
              </div>
            ) : null}
            <div style={{ position: 'relative', zIndex: 100 }}>
              <NotificationBlock session={session} />
            </div>
            <Link href={'/configuracoes'}>
              <button
                type='button'
                onClick={() => setSidebarExtended((prev) => !prev)}
                className={
                  'flex w-fit cursor-pointer items-center justify-center self-center rounded-sm p-2 duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'
                }
              >
                <IoMdSettings />
              </button>
            </Link>
          </div>
          <div className='col-span-1 flex items-center justify-center'>
            <div className='flex h-[37px] w-full items-start justify-center'>
              <Link href={'/'}>
                <div className='relative h-[37px] w-[37px]'>
                  <Image src={Logo} alt='LOGO' title='LOGO' fill={true} />
                </div>
              </Link>
            </div>
          </div>
          <div className='col-span-1 flex items-center justify-center'>
            <ThemeToggle />
          </div>
          <div className='col-span-1 flex items-center justify-center'>
            <motion.div
              animate={sidebarExtended ? 'active' : 'inactive'}
              variants={{
                inactive: {
                  rotate: 90,
                },
                active: {
                  rotate: -90,
                },
              }}
              transition={{ duration: 0.1 }}
              onClick={() => setSidebarExtended((prev) => !prev)}
              className={
                'my-2 flex w-fit cursor-pointer items-center justify-center self-center rounded-sm p-2  text-[#264653] duration-300 ease-in hover:scale-105'
              }
            >
              <TfiAngleRight />
            </motion.div>
          </div>
        </div>
        {sidebarExtended ? (
          <motion.div
            initial='hidden'
            animate='visible'
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: '-50%' },
            }}
            transition={{ duration: 0.25 }}
            className='flex min-h-[40px] w-full flex-wrap items-center justify-center gap-2'
          >
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/'}>
                <BiStats className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/comercial/oportunidades'}>
                <BsFillFunnelFill />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/clientes'}>
                <FaUser />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/kits'}>
                <FaTag />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/planos'}>
                <BsBookmarksFill />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/produtos'}>
                <BsCart />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/servicos'}>
                <MdOutlineMiscellaneousServices />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/operacional/homologacoes'}>
                <FaProjectDiagram />
              </Link>
            </div>
            <div className='flex items-center justify-center p-2 text-[#264653] duration-300 ease-in hover:scale-105 hover:bg-blue-100 dark:hover:bg-primary/30'>
              <Link href={'/operacional/analises-tecnicas'}>
                <BsFillClipboardDataFill />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </div>
    </>
  );
};
