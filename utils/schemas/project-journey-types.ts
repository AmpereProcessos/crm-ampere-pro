import { z } from "zod";
import { AuthorSchema } from "./user.schema";

export const GeneralProjectJourneyTypeSchema = z.object({
	nome: z.string({ required_error: "Nome do tipo de jornada não informado.", invalid_type_error: "Tipo não válido para nome da jornada." }),
	descricao: z.string({
		required_error: "Descrição do tipo de jornada não informado.",
		invalid_type_error: "Tipo não válido para a descrição do tipo de jornada.",
	}),
	etapas: z.array(
		z.object({
			titulo: z.string({ required_error: "Título da etapa não informado.", invalid_type_error: "Tipo não válido para o título etapa da jornada." }),
			descricao: z.string({
				required_error: "Descrição da etapa da jornada não definida.",
				invalid_type_error: "Tipo não válido para a descrição da etapa da jornada.",
			}),
		}),
	),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para data de inserção." })
		.datetime({ message: "Tipo não válido para a data de inserção." }),
});

export const InsertProjectJourneyTypeSchema = z.object({
	nome: z.string({ required_error: "Nome do tipo de jornada não informado.", invalid_type_error: "Tipo não válido para nome da jornada." }),
	descricao: z.string({
		required_error: "Descrição do tipo de jornada não informado.",
		invalid_type_error: "Tipo não válido para a descrição do tipo de jornada.",
	}),
	etapas: z.array(
		z.object({
			titulo: z.string({ required_error: "Título da etapa não informado.", invalid_type_error: "Tipo não válido para o título etapa da jornada." }),
			descricao: z.string({
				required_error: "Descrição da etapa da jornada não definida.",
				invalid_type_error: "Tipo não válido para a descrição da etapa da jornada.",
			}),
		}),
	),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para data de inserção." })
		.datetime({ message: "Tipo não válido para a data de inserção." }),
});
export type TProjectJourneyType = z.infer<typeof GeneralProjectJourneyTypeSchema>;

export type TProjectJourneyTypeDTO = TProjectJourneyType & { _id: string };
