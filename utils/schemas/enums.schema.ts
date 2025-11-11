import z from "zod";

export const TimeDurationEnumSchema = z.enum(["HORAS", "DIAS", "SEMANAS", "MESES", "ANOS"], {
	required_error: "Duração do tempo não informada.",
	invalid_type_error: "Tipo não válido para a duração do tempo.",
});
