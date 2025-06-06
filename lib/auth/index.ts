import { Lucia, TimeSpan } from 'lucia'
import { Discord, Google } from 'arctic'
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { env } from '@/env.js'
import { db } from '@/server/db'
import { sessions, users, type TUser as DbUser } from '@/server/db/schema'
import { absoluteUrl } from '@/lib/utils'

// Uncomment the following lines if you are using nodejs 18 or lower. Not required in Node.js 20, CloudFlare Workers, Deno, Bun, and Vercel Edge Functions.
// import { webcrypto } from "node:crypto";
// globalThis.crypto = webcrypto as Crypto;

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
  getSessionAttributes: (/* attributes */) => {
    return {}
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      administrador: attributes.administrador,
      nome: attributes.nome,
      email: attributes.email,
      emailVerificado: attributes.emailVerificado,
      avatar: attributes.avatar,
      parceiroId: attributes.parceiroId,
      dataInsercao: attributes.dataInsercao,
      dataAtualizacao: attributes.dataAtualizacao,
    }
  },
  sessionExpiresIn: new TimeSpan(30, 'd'),
  sessionCookie: {
    name: 'session',
    expires: false, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: env.NODE_ENV === 'production',
    },
  },
})

export const discord = new Discord(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, absoluteUrl('/login/discord/callback'))
export const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET_KEY, absoluteUrl('/login/google/callback'))

export const googleInvite = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET_KEY, absoluteUrl('/convite-usuario/aceitar-google/callback'))

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseSessionAttributes: DatabaseSessionAttributes
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes extends Omit<DbUser, 'senha'> {}
