import axios from "axios";
import type {
	TCreateCustomFieldInput,
	TCreateCustomFieldOutput,
	TDeleteCustomFieldInput,
	TDeleteCustomFieldOutput,
	TUpdateCustomFieldInput,
	TUpdateCustomFieldOutput,
} from "@/app/api/custom-fields/route";

export async function createCustomField(input: TCreateCustomFieldInput) {
	const { data } = await axios.post<TCreateCustomFieldOutput>("/api/custom-fields", input);
	return data;
}

export async function updateCustomField(input: TUpdateCustomFieldInput) {
	const { data } = await axios.put<TUpdateCustomFieldOutput>("/api/custom-fields", input);
	return data;
}

export async function deleteCustomField(input: TDeleteCustomFieldInput) {
	const { data } = await axios.delete<TDeleteCustomFieldOutput>("/api/custom-fields", { data: input });
	return data;
}
