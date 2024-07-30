import { NextRequest, NextResponse } from 'next/server'
import createHttpError from 'http-errors'
import { ZodError } from 'zod'
import { auth } from '@/auth'

type HandlerFunction = (request: NextRequest, ...args: any[]) => Promise<NextResponse>

export function withErrorHandler<T extends HandlerFunction>(fn: T) {
  return async function (request: Parameters<T>[0], ...args: Parameters<T>[1]): Promise<NextResponse> {
    try {
      return await fn(request, ...args)
    } catch (error) {
      if (createHttpError.isHttpError(error) && error.expose) {
        return NextResponse.json({ error: { message: error.message } }, { status: error.status })
      }
      if (error instanceof ZodError) {
        return NextResponse.json({ error: { message: error.errors[0].message } }, { status: 400 })
      }
      // Respond with a generic 500 Internal Server Error
      return NextResponse.json({ error: { message: 'Oops, um erro desconhecido ocorreu.' } }, { status: 500 })
    }
  }
}

export async function validateAuthenticationAppRouter() {
  const session = await auth()
  if (!session) throw new createHttpError.Unauthorized('Recurso não acessível a usuários não autenticados.')

  return session
}
