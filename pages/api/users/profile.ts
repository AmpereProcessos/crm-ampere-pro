import type { TUserSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { GeneralUserSchema, type TUser } from "@/utils/schemas/user.schema";
import { ObjectId } from "mongodb";
import type { NextApiHandler } from "next";
import type z from "zod";

const UpdateProfileInputSchema = GeneralUserSchema.pick({
	nome: true,
	telefone: true,
	avatar_url: true,
	dataNascimento: true,
});
export type TUpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

async function updateProfile({
	input,
	session,
}: { input: TUpdateProfileInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");

	await usersCollection.updateOne(
		{ _id: new ObjectId(session.user.id) },
		{ $set: input },
	);

	return {
		data: {
			updatedId: session.user.id,
		},
		message: "Perfil atualizado com sucesso!",
	};
}
export type TUpdateProfileOutput = Awaited<ReturnType<typeof updateProfile>>;

const updateProfileRoute: NextApiHandler<TUpdateProfileOutput> = async (
	req,
	res,
) => {
	const session = await validateAuthenticationWithSession(req, res);
	const input = UpdateProfileInputSchema.parse(req.body);
	const result = await updateProfile({ input, session });
	return res.status(200).json(result);
};

export default apiHandler({
	PUT: updateProfileRoute,
});
