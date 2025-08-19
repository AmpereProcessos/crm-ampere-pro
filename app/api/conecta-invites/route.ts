import dayjs from 'dayjs';
import createHttpError from 'http-errors';
import { ObjectId } from 'mongodb';
import { type NextRequest, NextResponse } from 'next/server';
import type { z } from 'zod';
import { DATABASE_COLLECTION_NAMES } from '@/configs/app-definitions';
import { apiHandler, type UnwrapNextResponse } from '@/lib/api';
import { getValidCurrentSessionUncached } from '@/lib/auth/session';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import type { TClient } from '@/utils/schemas/client.schema';
import type { TInvite } from '@/utils/schemas/conecta-invite.schema';
import type { TUser } from '@/utils/schemas/user.schema';
import { CreateConectaInviteInput } from './inputs';

export type TCreateConectaInviteRouteInput = z.infer<typeof CreateConectaInviteInput>;
async function createConectaInvite(request: NextRequest) {
  const { user } = await getValidCurrentSessionUncached();

  const payload = await request.json();
  const { clienteId } = CreateConectaInviteInput.parse(payload);

  const crmDb = await connectToDatabase();
  const clientsCollection = crmDb.collection<TClient>(DATABASE_COLLECTION_NAMES.CRM.CLIENTS);
  const usersCollection = crmDb.collection<TUser>(DATABASE_COLLECTION_NAMES.CRM.USERS);
  const conectaInvitesCollection = crmDb.collection<TInvite>(DATABASE_COLLECTION_NAMES.CRM.CONECTA_INVITES);

  const sessionUser = await usersCollection.findOne({
    _id: new ObjectId(user.id),
  });

  if (!sessionUser) {
    throw new createHttpError.NotFound('Usuário não encontrado.');
  }

  const client = await clientsCollection.findOne({
    _id: new ObjectId(clienteId),
  });

  if (!client) {
    throw new createHttpError.NotFound('Cliente não encontrado.');
  }

  let clientConectaInviteId = client.conecta?.conviteId;

  if (!client.email) {
    throw new createHttpError.BadRequest('Cliente não possui email definido, defina o email para criar o convite.');
  }

  // Checking for existing conecta invite for the client
  if (clientConectaInviteId) {
    // If there is an existing invite, getting it in db
    const conectInvite = await conectaInvitesCollection.findOne({
      _id: new ObjectId(clientConectaInviteId),
    });

    // Checking for possible acceptance of the invite
    if (conectInvite?.dataAceite) {
      // If accepted, updating the client with the acceptance date
      await clientsCollection.updateOne(
        {
          _id: new ObjectId(clienteId),
        },
        {
          $set: {
            'conecta.conviteDataAceite': conectInvite.dataAceite,
          },
        }
      );

      throw new createHttpError.BadRequest('Convite já aceito.');
    }

    // If not accepted, updating the invite with the new promotor code
    await conectaInvitesCollection.updateOne(
      {
        _id: new ObjectId(clientConectaInviteId),
      },
      {
        $set: {
          'promotor.codigoIndicacao': sessionUser.codigoIndicacaoConecta || '',
          dataExpiracao: dayjs().add(30, 'days').toISOString(),
        },
      }
    );
  } else {
    // If no invite is defined, creating a new one
    const insertClientInviteResponse = await conectaInvitesCollection.insertOne({
      promotor: {
        id: sessionUser._id.toString(),
        nome: sessionUser.nome,
        tipo: 'VENDEDOR',
        codigoIndicacao: sessionUser.codigoIndicacaoConecta || '',
        avatar_url: sessionUser.avatar_url,
      },
      convidado: {
        id: client._id.toString(),
        nome: client.nome,
        telefone: client.telefonePrimario,
        email: client.email,
        cidade: client.cidade,
        uf: client.uf,
      },
      dataExpiracao: dayjs().add(30, 'days').toISOString(),
      dataInsercao: new Date().toISOString(),
    });

    const insertedClientInviteResponse = insertClientInviteResponse.insertedId;
    clientConectaInviteId = insertedClientInviteResponse.toString();

    // Updating the client with the new invite id
    await clientsCollection.updateOne(
      {
        _id: new ObjectId(clienteId),
      },
      {
        $set: {
          'conecta.conviteId': clientConectaInviteId,
        },
      }
    );
  }

  return NextResponse.json({
    data: {
      inviteId: clientConectaInviteId,
    },
    message: 'Convite criado/atualizado com sucesso!',
  });
}

export type TCreateConectaInviteRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createConectaInvite>>>;
export const POST = apiHandler({ POST: createConectaInvite });
