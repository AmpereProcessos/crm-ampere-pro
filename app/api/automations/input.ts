import z from "zod";
import { AutomationConfigurationSchema } from "@/utils/schemas/automations.schema";

// GET - List with filters
export const GetManyAutomationsInputSchema = z.object({
	page: z.coerce.number().default(1),
	search: z.string().nullable().default(null),
	// Filter by active status
	ativo: z
		.string()
		.nullable()
		.default(null)
		.transform((val) => (val === "true" ? true : val === "false" ? false : null)),
	// Filter by trigger type
	triggerType: z
		.string()
		.nullable()
		.default(null)
		.transform((val) => (val ? val.split(",") : null)),
	// Filter by action type
	actionType: z
		.string()
		.nullable()
		.default(null)
		.transform((val) => (val ? val.split(",") : null)),
});

// GET - Single by ID
export const GetAutomationByIdInputSchema = z.object({
	id: z.string(),
});

// Combined GET input
export const GetAutomationsInputSchema = z.union([GetAutomationByIdInputSchema, GetManyAutomationsInputSchema]);

// POST
export const CreateAutomationInputSchema = z.object({
	automation: AutomationConfigurationSchema,
});

// PUT
export const UpdateAutomationInputSchema = z.object({
	id: z.string(),
	changes: AutomationConfigurationSchema.partial(),
});
