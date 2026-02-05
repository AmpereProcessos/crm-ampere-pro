import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import type { TGetCustomFieldsInput, TGetCustomFieldsOutput } from "@/app/api/custom-fields/route";
import { useDebounceMemo } from "@/lib/hooks";

async function fetchCustomFields(input: Omit<TGetCustomFieldsInput, "id">) {
	const searchParams = new URLSearchParams();
	if (input.search) searchParams.set("search", input.search);
	if (input.entities) searchParams.set("entities", input.entities.join(","));
	if (input.projectTypes) searchParams.set("projectTypes", input.projectTypes.join(","));
	const { data } = await axios.get<TGetCustomFieldsOutput>(`/api/custom-fields?${searchParams.toString()}`);
	const customFields = data.data.default;
	if (!customFields) {
		throw new Error("Campos personalizados não encontrados.");
	}
	return customFields;
}

type TUseCustomFieldsParams = {
	initialFilters?: Partial<Omit<TGetCustomFieldsInput, "id">>;
};
export function useCustomFields({ initialFilters }: TUseCustomFieldsParams = {}) {
	const [filters, setFilters] = useState<Omit<TGetCustomFieldsInput, "id">>({
		search: initialFilters?.search ?? null,
		entities: initialFilters?.entities ?? [],
		projectTypes: initialFilters?.projectTypes ?? [],
	});

	function updateFilters(newFilters: Partial<Omit<TGetCustomFieldsInput, "id">>) {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}

	const debouncedFilters = useDebounceMemo(filters, 500);
	return {
		...useQuery({
			queryKey: ["custom-fields", debouncedFilters],
			queryFn: () => fetchCustomFields(debouncedFilters),
		}),
		queryKey: ["custom-fields", debouncedFilters],
		filters,
		updateFilters,
	};
}

async function fetchCustomFieldById({ id }: { id: string }) {
	const { data } = await axios.get<TGetCustomFieldsOutput>(`/api/custom-fields?id=${id}`);
	const customField = data.data.byId;
	if (!customField) {
		throw new Error("Campo personalizado não encontrado.");
	}
	return customField;
}

type TUseCustomFieldByIdParams = {
	id: string;
};
export function useCustomFieldById({ id }: TUseCustomFieldByIdParams) {
	return {
		...useQuery({
			queryKey: ["custom-field-by-id", id],
			queryFn: () => fetchCustomFieldById({ id }),
		}),
		queryKey: ["custom-field-by-id", id],
	};
}

// Hook to fetch custom fields by entity
type TUseCustomFieldsByEntityParams = {
	entity: "CLIENTES" | "OPORTUNIDADES" | "PROPOSTAS";
};
async function fetchCustomFieldsByEntity({ entity }: TUseCustomFieldsByEntityParams) {
	const { data } = await axios.get<TGetCustomFieldsOutput>(`/api/custom-fields?entities=${entity}`);
	const customFields = data.data.default;
	if (!customFields) {
		throw new Error("Campos personalizados não encontrados.");
	}
	// Filter only active fields that include this entity
	return customFields.filter((field) => field.ativo && field.entidades.includes(entity));
}

export function useCustomFieldsByEntity({ entity }: TUseCustomFieldsByEntityParams) {
	return {
		...useQuery({
			queryKey: ["custom-fields-by-entity", entity],
			queryFn: () => fetchCustomFieldsByEntity({ entity }),
		}),
		queryKey: ["custom-fields-by-entity", entity],
	};
}
