import { getGenFactorByOrientation, getModulesAveragePower } from '@/lib/methods/extracting';
import { renderIcon } from '@/lib/methods/rendering';
import { TProductItem } from '@/utils/schemas/kits.schema';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { OrientationIcons } from '@/utils/select-options';
import React from 'react';

type ModuleOrientationBlockProps = {
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function ModuleOrientationBlock({ infoHolder, setInfoHolder, changes, setChanges }: ModuleOrientationBlockProps) {
  return (
    <div className='mt-4 flex w-full flex-col'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-white'>ALOCAÇÃO DE MÓDULOS</h1>
      </div>
      <div className='mt-2 flex w-full flex-col'>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4'>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['NORTE'])}
              </div>

              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>NORTE</p>
            </div>

            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.norte || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({ ...prev, alocacaoModulos: { ...prev.alocacaoModulos, norte: Number(e.target.value) } }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.norte': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.norte
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'NORTE',
                    }) *
                      infoHolder.alocacaoModulos.norte *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['NORDESTE'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>NORDESTE</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.nordeste || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({ ...prev, alocacaoModulos: { ...prev.alocacaoModulos, nordeste: Number(e.target.value) } }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.nordeste': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.nordeste
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'NORDESTE',
                    }) *
                      infoHolder.alocacaoModulos.nordeste *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['LESTE'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>LESTE</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.leste || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({ ...prev, alocacaoModulos: { ...prev.alocacaoModulos, leste: Number(e.target.value) } }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.leste': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.leste
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'LESTE',
                    }) *
                      infoHolder.alocacaoModulos.leste *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['SUDESTE'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>SUDESTE</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.sudeste || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  alocacaoModulos: { ...prev.alocacaoModulos, sudeste: Number(e.target.value) },
                }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.sudeste': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.sudeste
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'SUDESTE',
                    }) *
                      infoHolder.alocacaoModulos.sudeste *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['SUL'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>SUL</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.sul || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  alocacaoModulos: { ...prev.alocacaoModulos, sul: Number(e.target.value) },
                }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.sul': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.sul
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'SUL',
                    }) *
                      infoHolder.alocacaoModulos.sul *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['SUDOESTE'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>SUDOESTE</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.sudoeste || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  alocacaoModulos: { ...prev.alocacaoModulos, sudoeste: Number(e.target.value) },
                }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.sudoeste': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.sudoeste
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'SUDOESTE',
                    }) *
                      infoHolder.alocacaoModulos.sudoeste *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['OESTE'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>OESTE</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.oeste || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  alocacaoModulos: { ...prev.alocacaoModulos, oeste: Number(e.target.value) },
                }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.oeste': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.oeste
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'OESTE',
                    }) *
                      infoHolder.alocacaoModulos.oeste *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
          <div className='grid grid-cols-3 items-center rounded-sm border border-cyan-500 p-1'>
            <div className='flex items-center justify-start gap-2'>
              <div className='flex items-center justify-center rounded-full border border-cyan-500 p-1 text-cyan-500'>
                {renderIcon(OrientationIcons['NOROESTE'])}
              </div>
              <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>NOROESTE</p>
            </div>
            <input
              className='p-2 text-center font-bold text-primary/70 outline-hidden'
              type={'number'}
              value={infoHolder.alocacaoModulos.noroeste || undefined}
              onChange={(e) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  alocacaoModulos: { ...prev.alocacaoModulos, noroeste: Number(e.target.value) },
                }));
                setChanges((prev) => ({ ...prev, 'alocacaoModulos.noroeste': Number(e.target.value) }));
              }}
            />
            <p className='text-center text-xs font-bold text-primary/70 lg:text-base'>
              {infoHolder.alocacaoModulos.noroeste
                ? (
                    (getGenFactorByOrientation({
                      city: infoHolder.localizacao.cidade,
                      uf: infoHolder.localizacao.uf,
                      orientation: 'NOROESTE',
                    }) *
                      infoHolder.alocacaoModulos.noroeste *
                      getModulesAveragePower(infoHolder.equipamentos as TProductItem[])) /
                    1000
                  ).toFixed(2)
                : false}{' '}
              kWh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleOrientationBlock;
