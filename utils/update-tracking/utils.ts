type TDecomponsedObject = {
	[key: string]: string | number | boolean | any[];
};
export function decomposeObject(obj: any, parentKey = "", delimiter = "."): TDecomponsedObject {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		const newKey = parentKey ? `${parentKey}${delimiter}${key}` : key;

		if (Array.isArray(value)) {
			// @ts-ignore
			acc[newKey] = value;
		} else if (value && typeof value === "object" && value !== null) {
			// Recursively decompose nested objects
			Object.assign(acc, decomposeObject(value, newKey, delimiter));
		} else {
			// Assign the value to the new key
			// @ts-ignore
			acc[newKey] = value;
		}

		return acc;
	}, {});
}

export function deepEqual(obj1: any, obj2: any) {
	if (obj1 === obj2) return true;

	if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
		return false;
	}

	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) return false;

	for (const key of keys1) {
		if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
			return false;
		}
	}

	return true;
}
