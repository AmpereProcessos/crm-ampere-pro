import { z } from "zod";
import { AuthorSchema, PermissionsSchema, TUserDTO, TUserDTOSimplified } from "./user.schema";

const GeneralUserGroupSchema = z.object({
	titulo: z.string({
		required_error: "Título do grupo de usuários não informado.",
		invalid_type_error: "Tipo não válido para o título do grupo de usuários.",
	}),
	descricao: z.string({
		required_error: "Descrição do grupo de usuários não fornecida.",
		invalid_type_error: "Tipo não válido para a descrição do grupo de usuários.",
	}),
	permissoes: PermissionsSchema,
	autor: AuthorSchema,
	dataInsercao: z.string({ required_error: "Data de inserção não fornecida.", invalid_type_error: "Tipo não válido para a data de inserção." }).datetime(),
});

export const InsertUserGroupSchema = z.object({
	titulo: z.string({
		required_error: "Título do grupo de usuários não informado.",
		invalid_type_error: "Tipo não válido para o título do grupo de usuários.",
	}),
	descricao: z.string({
		required_error: "Descrição do grupo de usuários não fornecida.",
		invalid_type_error: "Tipo não válido para a descrição do grupo de usuários.",
	}),
	permissoes: PermissionsSchema,
	autor: AuthorSchema,
	dataInsercao: z.string({ required_error: "Data de inserção não fornecida.", invalid_type_error: "Tipo não válido para a data de inserção." }).datetime(),
});

export type TUserGroup = z.infer<typeof GeneralUserGroupSchema>;

export type TUserGroupDTO = TUserGroup & { _id: string };

export type TUserGroupWithUsers = TUserGroup & { usuarios: TUserDTOSimplified[] };

export type TUserGroupDTOWithUsers = TUserGroupWithUsers & { _id: string };
