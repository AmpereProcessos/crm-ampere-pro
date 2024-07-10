import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import connectToDatabase from '../../../services/mongodb/crm-db-connection'
import { ObjectId } from 'mongodb'
// Hash para senha padrão 123456789: $2b$10$zh5TZpnAZ9APevFJaYFIf.1DgkIuLfWlKrbXfS0Gdy0XxDSlSb74K

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
  },
  jwt: {
    maxAge: 60 * 60 * 8,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {},
      async authorize(credentials, req) {
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
            nome: userPartner.nome,
            logo_url: userPartner.logo_url,
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
      // console.log("USER", user);
      // console.log("ACCOUNT", account);
      // console.log("PROFILE", profile);
      // console.log("EMAIL", email);
      // console.log("CREDENTIALS", credentials);
      return user
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
      // console.log("ACCOUNT", account);
      // console.log("PROFILE", profile);
      // console.log(token);
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
  secret: process.env.SECRET_NEXT_AUTH,
  pages: {
    signIn: '/auth/signin',
  },
}
export default NextAuth(authOptions)
