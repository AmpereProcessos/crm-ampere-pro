export type TScope = string[] | null | undefined;

export const USER_SCOPE_PERMISSION_KEYS = [
	"propostas",
	"oportunidades",
	"analisesTecnicas",
	"homologacoes",
	"clientes",
	"projetos",
	"parceiros",
	"resultados",
] as const;

/**
 * Canonical scope contract:
 * - null means general access;
 * - an array means the explicit scope, including an empty array;
 * - undefined/missing values are legacy data and normalize to null.
 */
export function normalizeScope(scope: TScope): string[] | null {
	return scope ?? null;
}

export function normalizePermissionScopes<T extends object>(permissions: T): T {
	const normalizedPermissions = { ...permissions } as Record<string, unknown>;

	for (const permissionKey of USER_SCOPE_PERMISSION_KEYS) {
		const permission = normalizedPermissions[permissionKey];
		if (!permission || typeof permission !== "object") continue;

		normalizedPermissions[permissionKey] = {
			...(permission as Record<string, unknown>),
			escopo: normalizeScope((permission as { escopo?: TScope }).escopo),
		};
	}

	return normalizedPermissions as T;
}
