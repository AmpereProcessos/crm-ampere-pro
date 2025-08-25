import type { TUserSession } from '@/lib/auth/session';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { useActiveKits } from '@/utils/queries/kits';
import { TKitDTO } from '@/utils/schemas/kits.schema';
import { AnimatePresence, motion } from 'framer-motion';
import TechnicalAnalysisKit from '../Cards/TechAnalysisKitItem';
import FilterMenu from '../Kits/FilterMenu';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type KitsSelectionMenuProps = {
  selectedKitId: string | null;
  handleSelect: (kit: TKitDTO) => void;
  session: TUserSession;
  closeMenu: () => void;
};
function KitsSelectionMenu({ selectedKitId, handleSelect, session, closeMenu }: KitsSelectionMenuProps) {
  const { data: kits, isLoading, isError, isFetching, isSuccess, filters, setFilters } = useActiveKits();
  const userHasPricingViewPermission = session.user.permissoes.precos.visualizar;
  return (
    <AnimatePresence>
      <motion.div
        variants={GeneralVisibleHiddenExitMotionVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        className='flex w-full flex-col gap-1 border border-primary/50 p-2'
      >
        <FilterMenu filters={filters} setFilters={setFilters} />
        <div className='flex max-h-[600px] min-h-[100px] w-full flex-col gap-1 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent /> : null}
          {isSuccess
            ? kits?.map((kit) => (
                <TechnicalAnalysisKit
                  selectedId={selectedKitId}
                  key={kit._id}
                  kit={kit}
                  userHasPricingViewPermission={userHasPricingViewPermission}
                  handleClick={(kit) => {
                    handleSelect(kit);
                    closeMenu();
                  }}
                />
              ))
            : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default KitsSelectionMenu;
