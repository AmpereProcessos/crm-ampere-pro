import { Collection, MongoClient, ObjectId } from 'mongodb'
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from '@auth/core/adapters'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { TUser } from '@/utils/schemas/user.schema'

function getCRMUserFromAdapterUser(adapterUser: AdapterUser) {
  const user: TUser = {
    nome: adapterUser.name || '',
    administrador: false,
    telefone: '',
    email: adapterUser.email,
    senha: '',
    avatar_url: adapterUser.image,
    idParceiro: '65454ba15cf3e3ecf534b308',
    idGrupo: '66562a2a812707dbf9f04832',
    permissoes: {
      usuarios: {
        visualizar: true,
        criar: true,
        editar: true,
      },
      comissoes: {
        visualizar: true,
        editar: true,
      },
      kits: {
        visualizar: true,
        editar: true,
        criar: true,
      },
      produtos: {
        visualizar: true,
        editar: true,
        criar: true,
      },
      servicos: {
        visualizar: true,
        editar: true,
        criar: true,
      },
      planos: {
        visualizar: true,
        editar: true,
        criar: true,
      },
      propostas: {
        escopo: null,
        visualizar: true,
        editar: true,
        criar: true,
      },
      oportunidades: {
        escopo: null,
        visualizar: true,
        editar: true,
        criar: true,
      },
      analisesTecnicas: {
        escopo: null,
        visualizar: true,
        editar: true,
        criar: true,
      },
      homologacoes: {
        escopo: null,
        visualizar: true,
        editar: true,
        criar: true,
      },
      clientes: {
        escopo: null,
        visualizar: true,
        editar: true,
        criar: true,
      },
      parceiros: {
        escopo: null,
        visualizar: true,
        editar: true,
        criar: true,
      },
      precos: {
        visualizar: true,
        editar: true,
      },
      resultados: {
        escopo: null,
        visualizarComercial: true,
        visualizarOperacional: true,
      },
      configuracoes: {
        parceiro: true,
        precificacao: true,
        funis: true,
        metodosPagamento: true,
        tiposProjeto: true,
        gruposUsuarios: true,
      },
      integracoes: {
        receberLeads: false,
      },
      projetos: {
        escopo: null,
        visualizar: true,
        criar: true,
        editar: true,
      },
    },
    comissoes: {
      comSDR: null,
      semSDR: null,
    },
    comissionamento: {
      aplicavel: false,
      resultados: [],
    },
    ativo: true,
    dataInsercao: new Date().toISOString(),
  }
  return user
}
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
export default function MyMongoAdapter(client: Promise<MongoClient> | (() => Promise<MongoClient>), options: MongoDBAdapterOptions = {}): Adapter {
  return {
    async createUser(user) {
      const crmUser = getCRMUserFromAdapterUser(user)
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const usersCollection = crmDb.collection('users')
      await usersCollection.insertOne({ ...crmUser })
      return user
    },
    async getUser(id) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const usersCollection = crmDb.collection('users')
      const user = await usersCollection.findOne({ _id: new ObjectId(id) })
      if (!user) return null
      return user
    },
    async getUserByEmail(email) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const usersCollection = crmDb.collection('users')
      const user = await usersCollection.findOne({ email: email })
      if (!user) return null
      return user
      return
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const usersCollection = crmDb.collection('users')
      const accountsCollection = crmDb.collection('accounts')
      const account = await accountsCollection.findOne({ provider: provider, providerAccountId: providerAccountId })
      if (!account) return null
      const user = await usersCollection.findOne({ _id: new ObjectId(account.userId) })
      if (!user) return null
      return user
    },
    async updateUser(user) {
      const { id } = user
      return user
    },
    async deleteUser(userId) {
      const id = new ObjectId(userId)
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const usersCollection = crmDb.collection('users')
      const accountsCollection = crmDb.collection('accounts')
      const sessionsCollection = crmDb.collection('sessions')

      await Promise.all([
        usersCollection.deleteMany({ _id: id }),
        accountsCollection.deleteMany({ userId: userId as any }),
        sessionsCollection.deleteMany({ userId: userId }),
      ])
      return
    },
    async linkAccount(account) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const accountsCollection = crmDb.collection('accounts')
      await accountsCollection.insertOne(account)
      return account
    },
    async unlinkAccount({ providerAccountId, provider }) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const accountsCollection: Collection<AdapterAccount> = crmDb.collection('accounts')
      const account = await accountsCollection.findOneAndDelete({ providerAccountId, provider })

      return account.value!
    },
    async createSession({ sessionToken, userId, expires }) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')

      const sessionsCollection: Collection<AdapterSession> = crmDb.collection('sessions')

      await sessionsCollection.insertOne({ sessionToken, userId, expires })
      return { sessionToken, userId, expires }
    },
    async getSessionAndUser(sessionToken) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')

      const sessionsCollection: Collection<AdapterSession> = crmDb.collection('sessions')

      const session = await sessionsCollection.findOne({ sessionToken })
      if (!session) return null
      const usersCollection = crmDb.collection('users')
      const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })
      if (!user) return null
      return user
    },
    async updateSession(data) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')

      const sessionsCollection: Collection<AdapterSession> = crmDb.collection('sessions')

      const updatedSession = await sessionsCollection.findOneAndUpdate(
        {
          sessionToken: data.sessionToken,
        },
        { $set: data },
        { returnDocument: 'after' }
      )

      return updatedSession.value
    },
    async deleteSession(sessionToken) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')

      const sessionsCollection: Collection<AdapterSession> = crmDb.collection('sessions')

      const session = await sessionsCollection.findOneAndDelete({ sessionToken })
      return session.value
    },
    async createVerificationToken({ identifier, expires, token }) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const verificationTokensCollection: Collection<VerificationToken> = crmDb.collection('verification_tokens')

      await verificationTokensCollection.insertOne({ token, identifier, expires })
      return { identifier, expires, token }
    },
    async useVerificationToken({ identifier, token }) {
      const crmDb = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      const verificationTokensCollection: Collection<VerificationToken> = crmDb.collection('verification_tokens')
      const deleteResponse = await verificationTokensCollection.findOneAndDelete({ identifier, token })

      return deleteResponse.value
    },
  }
}
