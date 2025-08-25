import CheckboxInput from '@/components/Inputs/CheckboxInput';
import MultipleFileInput from '@/components/Inputs/MultipleFileInput';
import React from 'react';
import { TServiceOrderReportSessionControls, TServiceOrderReportSessionFiles } from './ReportPage';

type ReportPageSessionProps = {
  session: string;
  controls: TServiceOrderReportSessionControls;
  setControls: React.Dispatch<React.SetStateAction<TServiceOrderReportSessionControls>>;
  files: TServiceOrderReportSessionFiles;
  setFiles: React.Dispatch<React.SetStateAction<TServiceOrderReportSessionFiles>>;
};
function ReportPageSession({ session, controls, setControls, files, setFiles }: ReportPageSessionProps) {
  return (
    <div className='flex h-full w-full flex-col gap-2 pb-3'>
      <h1 className='w-full bg-primary/60 px-2 py-2 text-center font-black tracking-tight text-primary-foreground'>{session}</h1>
      <div className='flex w-full flex-col gap-2 px-9'>
        <h1 className='text-start font-black leading-none tracking-tight'>CONTROLES</h1>
        {controls[session].map((control, index) => (
          <CheckboxInput
            key={index}
            labelFalse={control.titulo}
            labelTrue={control.titulo}
            checked={control.efetivado}
            handleChange={(value) => {
              const currentControls = [...controls[session]]; // Create a copy of the controls array
              currentControls[index].efetivado = value; // Update the efetivado property of the current control
              setControls({ ...controls, [session]: currentControls }); // Update the controls state with the modified array
            }}
          />
        ))}
        <h1 className='mt-4 text-start font-black leading-none tracking-tight'>ARQUIVOS</h1>
        {files[session].map((file, index) => (
          <MultipleFileInput
            key={index}
            label={file.titulo}
            value={file.arquivo}
            handleChange={(value) => {
              const currentFiles = [...files[session]]; // Create a copy of the files array
              currentFiles[index].arquivo = value as FileList | null; // Update the arquivo property of the current file
              setFiles({ ...files, [session]: currentFiles }); // Update the files state with the modified array
            }}
            multiple={true}
          />
        ))}
      </div>
    </div>
  );
}

export default ReportPageSession;
