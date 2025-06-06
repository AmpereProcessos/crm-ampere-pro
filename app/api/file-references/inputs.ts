import { z } from "zod";

// Query params para busca de file-references
export const GetFileReferencesQueryParams = z.object({
	id: z.string().optional().nullable(),
	opportunityId: z.string().optional().nullable(),
	clientId: z.string().optional().nullable(),
	analysisId: z.string().optional().nullable(),
	homologationId: z.string().optional().nullable(),
});
