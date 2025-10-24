import { z } from "zod";

const GeneralDistanceSchema = z.object({
	origem: z.string(),
	destino: z.string(),
	distancia: z.number(),
	dataInsercao: z.string(),
});

export type TDistance = z.infer<typeof GeneralDistanceSchema>;
