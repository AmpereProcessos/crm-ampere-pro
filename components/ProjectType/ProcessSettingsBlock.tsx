import { TProcessAutomationEntities } from '@/utils/process-settings';
import { useState } from 'react';
import NewProcessSettingMenu from './NewProcessSettingMenu';

type TNewProcessSettingMenu = {
  dependency: { id: null; entity: null } | { id: string; entity: TProcessAutomationEntities };
  isOpen: boolean;
};

type ProcessSettingsBlockProps = {
  projectTypeId: string;
};
function ProcessSettingsBlock({ projectTypeId }: ProcessSettingsBlockProps) {
  const [newProcessSettingMenu, setNewProcessSettingMenu] = useState<TNewProcessSettingMenu>({
    dependency: { id: null, entity: null },
    isOpen: false,
  });
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>CONFIGURAÇÕES DE PROCESSO</h1>
      {newProcessSettingMenu.isOpen ? (
        <NewProcessSettingMenu
          projectTypeId={projectTypeId}
          dependencySettingId={newProcessSettingMenu.dependency.id}
          dependencySettingEntity={newProcessSettingMenu.dependency.entity}
          closeMenu={() => setNewProcessSettingMenu({ dependency: { id: null, entity: null }, isOpen: false })}
        />
      ) : (
        <div className='flex w-full items-center justify-end'>
          <button
            className='rounded bg-green-500 p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-green-600'
            onClick={() => setNewProcessSettingMenu({ dependency: { id: null, entity: null }, isOpen: true })}
          >
            NOVA CONFIGURAÇÃO
          </button>
        </div>
      )}
      <h1 className='font-Inter font-black'>CONFIGURAÇÕES DE PROJETO</h1>
    </div>
  );
}

export default ProcessSettingsBlock;
