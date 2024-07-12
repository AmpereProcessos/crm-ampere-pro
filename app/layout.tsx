import '@/styles/globals.css'
import { Metadata } from 'next'
import ProvidersWrapper from './providers/ProvidersWrapper'

export const metadata: Metadata = {
  title: 'CRM Ampère',
  description: 'Bem vindo ao CRM Ampère !',
}
export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return (
    <html lang="en">
      <body>
        <ProvidersWrapper session={session}>{children}</ProvidersWrapper>
      </body>
    </html>
  )
  // return (
  //   <html lang="en">
  //     <body>
  //       <AuthProvider session={session}>
  //         <TanstackProvider>
  //           <FullScreenWrapper>
  //             {children}
  //             <Toaster />
  //             {/* <Notifications /> */}
  //           </FullScreenWrapper>
  //           <ReactQueryDevtools initialIsOpen={true} />
  //         </TanstackProvider>
  //       </AuthProvider>
  //     </body>
  //   </html>
  // )
}
