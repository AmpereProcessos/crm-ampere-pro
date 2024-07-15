import { ObjectId } from "mongodb"
import { z } from "zod"

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "@auth/core/adapters"
import type { MongoClient } from "mongodb"
import { TUser } from "@/utils/schemas/user.schema"

export interface MongoDBAdapterOptions {
  collections?: {
    Users?: string
    Accounts?: string
    Sessions?: string
    VerificationTokens?: string
  }
  databaseName?: string
  onClose?: (client: MongoClient) => Promise<void>
}

export const defaultCollections: Required<
  Required<MongoDBAdapterOptions>["collections"]
> = {
  Users: "users",
  Accounts: "accounts",
  Sessions: "sessions",
  VerificationTokens: "verification_tokens",
}

export const format = {
  from<T = Record<string, unknown>>(object: Record<string, any>): T {
    const newObject: Record<string, unknown> = {}
    for (const key in object) {
      const value = object[key]
      if (key === "_id") {
        newObject.id = value.toHexString()
      } else if (key === "userId") {
        newObject[key] = value.toHexString()
      } else {
        newObject[key] = value
      }
      // Add additional fields and types
      if (key === "nome") newObject.nome = value
      if (key === "administrador") newObject.administrador = value
      if (key === "telefone") newObject.telefone = value
      if (key === "idParceiro") newObject.idParceiro = value
      if (key === "idGrupo") newObject.idGrupo = value
      if (key === "permissoes") newObject.permissoes = value
      if (key === "comissoes") newObject.comissoes = value
      if (key === "comissionamento") newObject.comissionamento = value
      if (key === "dataInsercao" || key === "dataAlteracao") {
        newObject[key] = new Date(value)
      }
    }
    return newObject as T
  },
  to<T = Record<string, unknown>>(object: Record<string, any>) {
    const newObject: Record<string, unknown> = {
      _id: _id(object.id),
    }
    for (const key in object) {
      const value = object[key]
      if (key === "userId") newObject[key] = _id(value)
      else if (key === "id") continue
      else newObject[key] = value
      // Add additional fields and types
      if (key === "nome") newObject.nome = value
      if (key === "administrador") newObject.administrador = value
      if (key === "telefone") newObject.telefone = value
      if (key === "idParceiro") newObject.idParceiro = value
      if (key === "idGrupo") newObject.idGrupo = value
      if (key === "permissoes") newObject.permissoes = value
      if (key === "comissoes") newObject.comissoes = value
      if (key === "comissionamento") newObject.comissionamento = value
      if (key === "dataInsercao" || key === "dataAlteracao") {
        newObject[key] = value.toISOString()
      }
    }
    return newObject as T & { _id: ObjectId }
  },
}

export function _id(hex?: string) {
  if (hex?.length !== 24) return new ObjectId()
  return new ObjectId(hex)
}

export function PersonalizedMongoDBAdapter(
  client: Promise<MongoClient> | (() => Promise<MongoClient>),
  options: MongoDBAdapterOptions = {}
): Adapter {
  const { collections } = options
  const { from, to } = format

  const getDb = async () => {
    const _client = await (typeof client === "function"? client() : client)
    const _db = _client.db(options.databaseName)
    const c = {...defaultCollections,...collections }
    return {
      U: _db.collection<TUser>(c.Users),
      A: _db.collection<AdapterAccount>(c.Accounts),
      S: _db.collection<AdapterSession>(c.Sessions),
      V: _db.collection<VerificationToken>(c?.VerificationTokens),
      [Symbol.asyncDispose]: async () => {
        await options.onClose?.(_client)
      },
    }
  }

  return {
    async createUser(data) {
      const user = to<TUser>(data)
      await using db = await getDb()
      await db.U.insertOne(user)
      return from<TUser>(user)
    },
    async getUser(id) {
      await using db = await getDb()
      const user = await db.U.findOne({ _id: _id(id) })
      if (!user) return null
      return from<TUser>(user)
    },
    async getUserByEmail(email) {
      await using db = await getDb()
      const user = await db.U.findOne({ email })
      if (!user) return null
      return from<TUser>(user)
    },
    async getUserByAccount(provider_providerAccountId) {
      await using db = await getDb()
      const account = await db.A.findOne(provider_providerAccountId)
      if (!account) return null
      const user = await db.U.findOne({ _id: new ObjectId(account.userId) })
      if (!user) return null
      return from<TUser>(user)
    },
    async updateUser(data) {
      const { _id,...user } = to<TUser>(data)
      await using db = await getDb()
      const result = await db.U.findOneAndUpdate(
        { _id },
        { $set: user },
        { returnDocument: "after" }
      )

      return from<TUser>(result!)
    },
    async deleteUser(id) {
      const userId = _id(id)
      await using db = await getDb()
      await Promise.all([
        db.A.deleteMany({ userId: userId as any }),
        db.S.deleteMany({ userId: userId as any }),
        db.U.deleteOne({ _id: userId }),
      ])
    },
    linkAccount: async (data) => {
      const account = to<AdapterAccount>(data)
      await using db = await getDb()
      await db.A.insertOne(account)
      return account
    },
    async unlinkAccount(provider_providerAccountId) {
      await using db = await getDb()
      const account = await db.A.findOneAndDelete(provider_providerAccountId)
      return from<AdapterAccount>(account!)
    },
    async getSessionAndUser(sessionToken) {
      await using db = await getDb()
      const session = await db.S.findOne({ sessionToken })
      if (!session) return null
      const user = await db.U.findOne({ _id: new ObjectId(session.userId) })
      if (!user) return null
      return {
        user: from<TUser>(user),
        session: from<AdapterSession>(session),
      }
    },
    async createSession(data) {
      const session = to<AdapterSession>(data)
      await using db = await getDb()
      await db.S.insertOne(session)
      return from<AdapterSession>(session)
    },
    async updateSession(data) {
      const { _id,...session } = to<AdapterSession>(data)
      await using db = await getDb()
      const updatedSession = await db.S.findOneAndUpdate(
        { sessionToken: session.sessionToken },
        { $set: session },
        { returnDocument: "after" }
      )
      return from<AdapterSession>(updatedSession!)
    },
    async deleteSession(sessionToken) {
      await using db = await getDb()
      const session = await db.S.findOneAndDelete({
        sessionToken,
      })
      return from<AdapterSession>(session!)
    },
    async createVerificationToken(data) {
      await using db = await getDb()
      await db.V.insertOne(to(data))
      return data
    },
    async useVerificationToken(identifier_token) {
      await using db = await getDb()
      const verificationToken = await db.V.findOneAndDelete(identifier_token)
      if (!verificationToken) return null
      const { _id,...rest } = verificationToken
      return rest
    },
  }
}
