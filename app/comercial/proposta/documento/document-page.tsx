'use client';
import type { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import type { TPartnerDTO } from '@/utils/schemas/partner.schema';
import type { TProposalDTO } from '@/utils/schemas/proposal.schema';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { useRef } from 'react';

import ProposalWithKitTemplate from '@/components/Proposal/Templates/ProposalWithKitTemplate';
import ProposalWithKitUFVTemplate from '@/components/Proposal/Templates/ProposalWithKitUFVTemplate';
import ProposalWithPlanTemplate from '@/components/Proposal/Templates/ProposalWithPlanTemplate';
import ProposalWithProductsTemplate from '@/components/Proposal/Templates/ProposalWithProductsTemplate';
import ProposalWithServicesTemplate from '@/components/Proposal/Templates/ProposalWithServicesTemplate';
type ProposalDocumentPageProps = {
  proposal: TProposalDTO;
  opportunity: TOpportunityDTOWithClient;
  partner: TPartnerDTO;
};
function ProposalDocumentPage({ proposal, opportunity, partner }: ProposalDocumentPageProps) {
  const proposalDocumentRef = useRef<any>(null);

  const isSolarSystemSale = opportunity.tipo.titulo === 'SISTEMA FOTOVOLTAICO' && opportunity.categoriaVenda === 'KIT';
  const isGeneralKitSale = opportunity.categoriaVenda === 'KIT' && opportunity.tipo.titulo !== 'SISTEMA FOTOVOLTAICO';

  async function generatePDF() {
    const proposalDocument = proposalDocumentRef.current;
    if (!proposalDocument) return;

    // Add filter to ensure proper font rendering
    const filter = (node: HTMLElement) => {
      const exclusionClasses = ['remove-me', 'secret-div'];
      return !exclusionClasses.some((classname) => node.classList?.contains(classname));
    };

    try {
      // Get actual dimensions of the component
      const rect = proposalDocument.getBoundingClientRect();
      const componentWidth = rect.width;
      const componentHeight = rect.height;

      // Convert pixels to millimeters (assuming 96 DPI)
      const pixelsToMm = 0.264583333;
      const widthInMm = componentWidth * pixelsToMm;
      const heightInMm = componentHeight * pixelsToMm;

      const dataUrl = await htmlToImage.toPng(proposalDocument, {
        quality: 1,
        filter,
        fontEmbedCSS: '', // This will embed all used fonts
        pixelRatio: 3, // Increase resolution
        width: componentWidth,
        height: componentHeight,
        style: {
          // Improve text rendering
          textRendering: 'optimizeLegibility',
        },
      });

      // Create PDF with dynamic dimensions
      const pdf = new jsPDF({
        orientation: widthInMm > heightInMm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthInMm, heightInMm],
        compress: false,
      });

      // Add image to fill the entire PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, widthInMm, heightInMm);
      pdf.save(`${proposal.nome}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  return (
    <div className='relative flex w-full items-center justify-center bg-gray-50'>
      <div className='border-primary/20 flex flex-col rounded-lg border bg-background p-3 shadow-md print:border-none print:p-0'>
        {isSolarSystemSale ? (
          <ProposalWithKitUFVTemplate proposalDocumentRef={proposalDocumentRef} proposal={proposal} opportunity={opportunity} partner={partner} />
        ) : null}
        {isGeneralKitSale ? (
          <ProposalWithKitTemplate proposalDocumentRef={proposalDocumentRef} proposal={proposal} opportunity={opportunity} partner={partner} />
        ) : null}
        {opportunity.categoriaVenda === 'PLANO' ? (
          <ProposalWithPlanTemplate proposalDocumentRef={proposalDocumentRef} proposal={proposal} opportunity={opportunity} partner={partner} />
        ) : null}
        {opportunity.categoriaVenda === 'PRODUTOS' ? (
          <ProposalWithProductsTemplate proposalDocumentRef={proposalDocumentRef} proposal={proposal} opportunity={opportunity} partner={partner} />
        ) : null}
        {opportunity.categoriaVenda === 'SERVIÇOS' ? (
          <ProposalWithServicesTemplate proposalDocumentRef={proposalDocumentRef} proposal={proposal} opportunity={opportunity} partner={partner} />
        ) : null}
      </div>
      {/** WEB */}
      <div className='fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 print:hidden lg:flex'>
        <button
          type='button'
          className='group relative rounded-full bg-background p-3 shadow-lg transition-all hover:bg-gray-50'
          onClick={() => generatePDF()}
        >
          <svg className='h-6 w-6 text-primary/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <title>Baixar PDF</title>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
          </svg>
          <span className='absolute right-full mr-2 whitespace-nowrap rounded-sm bg-primary/80 px-2 py-1 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100'>
            Baixar PDF
          </span>
        </button>

        <button
          type='button'
          className='group relative rounded-full bg-background p-3 shadow-lg transition-all hover:bg-gray-50'
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          <svg className='h-6 w-6 text-primary/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <title>Copiar link</title>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
            />
          </svg>
          <span className='absolute right-full mr-2 whitespace-nowrap rounded-sm bg-primary/80 px-2 py-1 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100'>
            Copiar link
          </span>
        </button>

        <button
          type='button'
          className='group relative rounded-full bg-background p-3 shadow-lg transition-all hover:bg-gray-50'
          onClick={() => window.print()}
        >
          <svg className='h-6 w-6 text-primary/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <title>Imprimir</title>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
            />
          </svg>
          <span className='absolute right-full mr-2 whitespace-nowrap rounded-sm bg-primary/80 px-2 py-1 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100'>
            Imprimir
          </span>
        </button>
      </div>
      {/** MOBILE */}
      <div className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-row gap-3 print:hidden lg:hidden'>
        <button
          type='button'
          className='group relative rounded-full bg-background p-3 shadow-lg transition-all hover:bg-gray-50'
          onClick={() => generatePDF()}
        >
          <svg className='h-5 w-5 text-primary/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <title>Baixar PDF</title>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
          </svg>
          <span className='absolute right-full mr-2 whitespace-nowrap rounded-sm bg-primary/80 px-2 py-1 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100'>
            Baixar PDF
          </span>
        </button>

        <button
          type='button'
          className='group relative rounded-full bg-background p-3 shadow-lg transition-all hover:bg-gray-50'
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          <svg className='h-5 w-5 text-primary/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <title>Copiar link</title>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
            />
          </svg>
          <span className='absolute right-full mr-2 whitespace-nowrap rounded-sm bg-primary/80 px-2 py-1 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100'>
            Copiar link
          </span>
        </button>

        <button
          type='button'
          className='group relative rounded-full bg-background p-3 shadow-lg transition-all hover:bg-gray-50'
          onClick={() => window.print()}
        >
          <svg className='h-5 w-5 text-primary/70' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <title>Imprimir</title>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
            />
          </svg>
          <span className='absolute right-full mr-2 whitespace-nowrap rounded-sm bg-primary/80 px-2 py-1 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100'>
            Imprimir
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProposalDocumentPage;
