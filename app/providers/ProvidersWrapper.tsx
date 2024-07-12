'use client'
import React from 'react'
import AuthProvider from './AuthProvider'
import TanstackProvider from './TanstackProvicer'
import FullScreenWrapper from '@/components/Wrappers/FullScreenWrapper'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

function ProvidersWrapper({ children, session }: { children: React.ReactNode; session: any }) {
  return (
    <AuthProvider session={session}>
      <TanstackProvider>
        <FullScreenWrapper>
          {children}
          <Toaster />
          {/* <Notifications /> */}
        </FullScreenWrapper>
        <ReactQueryDevtools initialIsOpen={true} />
      </TanstackProvider>
    </AuthProvider>
  )
}

export default ProvidersWrapper
