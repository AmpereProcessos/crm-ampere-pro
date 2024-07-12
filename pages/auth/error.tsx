import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import React from 'react'
import Unauthorized from '@/utils/svgs/unauthorized.svg'
import Link from 'next/link'
function AuthErrorPage() {
  const router = useRouter()
  const routerQuery = router.query
  const error = routerQuery.error
  console.log('ERROR', error)
  const isUnauthorized = error == 'AccessDenied'
  if (isUnauthorized)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-col items-center gap-1">
          <div className="relative h-[450px] w-[450px] shadow-sm">
            <Image src={Unauthorized} alt="Sem autorização" />
          </div>
          <div className="flex w-full items-center justify-center">
            <a href="https://storyset.com/people" className="text-[0.5rem] tracking-tight">
              Feito por StorySet
            </a>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <h1 className="w-full text-center text-lg">Oops, seu usuário não possui autorização de acesso.</h1>
        </div>
      </div>
    )
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-center">
        <h1 className="w-full text-center text-lg">Oops, um erro ocorreu.</h1>
      </div>
    </div>
  )
}

export default AuthErrorPage
