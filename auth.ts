import NextAuth from 'next-auth'
import bcrypt from 'bcrypt'
import Google from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectToDatabase from './services/mongodb/crm-db-connection'
import createHttpError from 'http-errors'
import { ObjectId } from 'mongodb'
import MyMongoAdapter from './utils/integrations/auth/adapter'
import clientPromise from './services/mongodb/mongo-client'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET_KEY }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      // @ts-ignore
      async authorize(credentials, req) {
        // @ts-ignore
        const { email, password } = credentials
        const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
        const usersCollection = db.collection('users')
        const partnersCollection = db.collection('partners')
        const userInDb = await usersCollection.findOne({ ativo: true, email: email })
        console.log(userInDb)
        if (!userInDb) throw new createHttpError.BadRequest('Usuário não encontrado.')

        let compareResult = bcrypt.compareSync(password, userInDb.senha)
        if (!compareResult) throw new createHttpError.BadRequest('Senha incorreta.')

        const userPartner = await partnersCollection.findOne({ _id: new ObjectId(userInDb.idParceiro) })
        const user = {
          id: userInDb._id,
          administrador: userInDb.administrador,
          telefone: userInDb.telefone,
          email: userInDb.email,
          nome: userInDb.nome,
          avatar_url: userInDb.avatar_url,
          idParceiro: userInDb.idParceiro,
          idGrupo: userInDb.idGrupo,
          permissoes: userInDb.permissoes,
          parceiro: {
            nome: userPartner?.nome,
            logo_url: userPartner?.logo_url,
          },
        }
        // If no error and we have user data, return it
        if (user) {
          return user
        }
        // Return null if user data could not be retrieved
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // console.log('========================= SESSION ========================')
        // console.log('USER', user)
        // console.log('ACCOUNT', account)
        // console.log('PROFILE', profile)
        // console.log('EMAIL', email)
        // console.log('CREDENTIALS', credentials)
        // console.log('========================= SESSION ========================')
        // if (!account || !profile) throw new createHttpError.InternalServerError('Oops, um erro desconhecido ocorreu durante a autenticação.')
        // const { access_token, id_token } = account
        // const { email: profileEmail } = profile
        // const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
        // const usersCollection = db.collection('users')
        // const partnersCollection = db.collection('partners')
        // const userInDb = await usersCollection.findOne({ ativo: true, email: profileEmail }, { projection: { nome: 1 } })
        // console.log(userInDb)
        // if (!userInDb) throw new createHttpError.Unauthorized('Usuário não encontrado.')

        return user
      } catch (error) {
        throw error
      }
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
    async session({ session, user, token }) {
      // console.log("SESSAO", session);
      // console.log("USER", user);
      // console.log("TOKEN", token);
      if (session?.user) {
        session.user.id = token.sub
        session.user.administrador = token.administrador
        session.user.avatar_url = token.avatar_url
        session.user.nome = token.nome
        session.user.idParceiro = token.idParceiro
        session.user.idGrupo = token.idGrupo
        session.user.permissoes = token.permissoes
        session.user.parceiro = token.parceiro
      }
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log('============ JWT =============')
      console.log('TOKEN JWT', token)
      console.log('ACCOUNT JWT', account)
      console.log('USER JWT', user)
      console.log('PROFILE JWT', profile)
      // if (!!profile && !!account) {
      //   console.log('GOT CALLED WITH DB QUERIES')
      //   const profileEmail = profile?.email
      //   const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
      //   const usersCollection = db.collection('users')
      //   const partnersCollection = db.collection('partners')
      //   const userInDb = await usersCollection.findOne({ ativo: true, email: profileEmail })
      //   if (!userInDb) return token
      //   const userPartner = await partnersCollection.findOne({ _id: new ObjectId(userInDb.idParceiro) })
      //   token.id = userInDb._id.toString()
      //   token.administrador = userInDb.administrador
      //   token.avatar_url = userInDb.avatar_url
      //   token.nome = userInDb.nome
      //   token.idParceiro = userInDb.idParceiro
      //   token.idGrupo = userInDb.idGrupo
      //   token.permissoes = userInDb.permissoes
      //   token.parceiro = {
      //     nome: userPartner?.nome,
      //     logo_url: userPartner?.logo_url,
      //   }
      //   return token
      // }

      if (user) {
        token.administrador = user.administrador
        token.avatar_url = user.avatar_url
        token.nome = user.nome
        token.idParceiro = user.idParceiro
        token.idGrupo = user.idGrupo
        token.permissoes = user.permissoes
        token.parceiro = user.parceiro
      }

      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
