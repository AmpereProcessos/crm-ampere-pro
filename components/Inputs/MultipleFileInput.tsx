import { formatLongString } from '@/utils/methods';

import { useRef } from 'react';

import { BsCheck2All, BsCloudUploadFill } from 'react-icons/bs';

function renderInputText(files: FileList | null) {
  if (!files)
    return (
      <p className='mb-2 px-2 text-center text-sm text-primary/70 dark:text-primary/40'>
        <span className='font-semibold'>Clique para escolher um arquivo</span> ou o arraste para a àrea demarcada
      </p>
    );
  const filesAsArr = Array.from(files);
  if (filesAsArr.length > 1) {
    const str = filesAsArr.map((file) => formatLongString(file.name, 15)).join(', ');
    return <p className='mb-2 text-sm text-primary/70 dark:text-primary/40'>{str}</p>;
  }
  return <p className='mb-2 text-sm text-primary/70 dark:text-primary/40'>{filesAsArr[0]?.name}</p>;
}

type MultipleFileInputProps = {
  label: string;
  value: FileList | null;
  handleChange: (file: FileList | null) => void;
  mode?: 'default' | 'large-area';
  multiple: boolean;
};
function MultipleFileInput({ label, value, mode = 'default', handleChange, multiple = false }: MultipleFileInputProps) {
  const ref = useRef(null);
  const inputIdentifier = label.toLowerCase().replace(' ', '_');
  if (mode == 'default')
    return (
      <div ref={ref} className='relative flex w-full flex-col justify-center self-center'>
        <div className='flex w-full items-center justify-between gap-2'>
          <label htmlFor={inputIdentifier} className={'text-start font-sans font-bold text-primary'}>
            {label}
          </label>
        </div>
        <div className='relative mt-2 flex w-full items-center justify-center'>
          <label
            htmlFor='dropzone-file'
            className={`flex min-h-[58px] w-full cursor-pointer flex-col items-center justify-center rounded-md border border-primary/30  bg-background p-3 hover:border-blue-300 hover:bg-blue-100`}
          >
            <div className='flex w-full items-center gap-2'>
              {value ? (
                <p className='grow text-center leading-none tracking-tight text-primary/70'>
                  {typeof value != 'string' ? (value.length > 1 ? `${value[0].name}, outros...` : value[0].name) : 'ARQUIVO DE REFERÊNCIA'}
                </p>
              ) : (
                <p className='grow text-center leading-none tracking-tight text-primary/70'>
                  <span className='font-semibold text-cyan-500'>Clique para escolher um arquivo</span> ou o arraste para a àrea demarcada
                </p>
              )}
              {value ? <BsCheck2All size={30} color={'rgb(34,197,94)'} /> : <BsCloudUploadFill size={30} />}
            </div>
            <input
              onChange={(e) => {
                if (e.target.files) return handleChange(e.target.files);
                else return handleChange(null);
              }}
              id='dropzone-file'
              type='file'
              className='absolute h-full w-full opacity-0'
              multiple={multiple}
            />
          </label>
        </div>
      </div>
    );

  return (
    <div className='relative flex w-full items-center justify-center'>
      <label
        htmlFor='dropzone-file'
        className='dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/10hover:bg-primary/10 dark:border-primary/60 dark:bg-primary/70 dark:hover:border-primary/50 dark:hover:bg-primary/60'
      >
        <div className='flex flex-col items-center justify-center pb-6 pt-5 text-primary/80'>
          <BsCloudUploadFill color={'rgb(31,41,55)'} size={50} />

          {renderInputText(value)}
        </div>
        <input
          onChange={(e) => handleChange(e.target.files)}
          multiple={multiple}
          id='dropzone-file'
          type='file'
          className='absolute h-full w-full opacity-0'
        />
      </label>
    </div>
  );
}

export default MultipleFileInput;
