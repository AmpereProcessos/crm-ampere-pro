import { ObjectId } from "mongodb";
import z from "zod";
import { GoalIdSchema, GoalSchema } from "@/utils/schemas/goal.schema";

export const CreateGoalInput = z.object({
	goal: GoalSchema.omit({
		dataInsercao: true,
		dataCalculo: true,
	}),
});

export const UpdateGoalInput = z.object({
	id: GoalIdSchema.refine((id) => ObjectId.isValid(id), {
		message: "O id da meta não é válido.",
	}),
	changes: GoalSchema,
});

export const GetGoalsInput = z.object({
	id: GoalIdSchema.refine((id) => ObjectId.isValid(id), {
		message: "O id da meta não é válido.",
	})
		.optional()
		.nullable(),
});
