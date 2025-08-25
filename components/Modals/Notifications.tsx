import type { TUserSession } from '@/lib/auth/session';
import type { TNotificationDTO } from '@/utils/schemas/notification.schema';
import { AnimatePresence, motion } from 'framer-motion';
import { VscChromeClose } from 'react-icons/vsc';
import NotificationCard from '../Cards/Notification';

type NotificationsProps = {
  notifications: TNotificationDTO[] | undefined;
  session: TUserSession;
  sidebarExtended: boolean;
  closeModal: () => void;
};
function Notifications({ sidebarExtended, session, closeModal, notifications }: NotificationsProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial='hidden'
        animate='visible'
        transition={{ duration: 0.25 }}
        variants={{
          visible: { opacity: 1, scale: 1, borderRadius: '5%' },
          hidden: { opacity: 0, scale: 0.5, borderRadius: '100%' },
        }}
        id='defaultModal'
        className={`fixed ${
          sidebarExtended ? 'bottom-[20%] left-10 md:left-[220px]' : 'bottom-[20%] left-10 md:left-[100px]'
        }  z-2000 flex h-[350px] w-[350px] flex-col rounded-lg border border-primary/30 bg-background py-3 shadow-lg md:bottom-[10px]`}
      >
        <div className='flex items-center justify-between border-b border-primary/30 px-3 pb-1'>
          <h1 className='text-center text-sm font-medium text-[#264653]'>PAINEL DE NOTIFICAÇÕES</h1>
          <button
            onClick={closeModal}
            type='button'
            className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
          >
            <VscChromeClose style={{ color: 'red' }} />
          </button>
        </div>
        <div className='flex grow flex-col gap-2 overflow-y-auto overscroll-y-auto p-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          {notifications ? (
            notifications?.length > 0 ? (
              notifications.map((notification, index) => <NotificationCard key={notification._id} notification={notification} session={session} />)
            ) : (
              <div className='flex grow items-center justify-center'>
                <h1 className='text-sm italic text-primary/70'>Sem notificações encontradas.</h1>
              </div>
            )
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Notifications;
