import { decomposeObject, deepEqual } from "./utils";

interface Entity {
	[key: string]: any;
}
type IdentifyChangesParams = {
	previousData: Entity;
	newData: Entity;
};

type TGeneralChange = {
	oldValue: string | number | boolean | null | undefined;
	newValue: string | number | boolean | null | undefined;
};
type TArrayChange = {
	add: any[];
	remove: any[];
	modify: any[];
};
type TChanges = {
	[key: string]: TGeneralChange | TArrayChange | null | undefined;
};

export function identifyChanges({ previousData, newData }: IdentifyChangesParams) {
	const previousFlat = decomposeObject(previousData);
	const newFlat = decomposeObject(newData);

	const changes = Object.entries(newFlat).reduce((acc: TChanges, [key, newValue]) => {
		const oldValue = previousFlat[key as keyof typeof previousFlat];

		// if (Array.isArray(newValue) && (Array.isArray(oldValue) || oldValue == undefined)) {
		//   // Handling arrays
		//   const oldArray = oldValue || []
		//   const newArray = newValue

		//   const add: Entity[] = []
		//   const remove: Entity[] = []
		//   const modify: Entity[] = []

		//   const oldItemsMap = new Map(oldArray.map((item, index) => [item.id || index + 1, item]))
		//   const newItemsMap = new Map(newArray.map((item, index) => [item.id || index + 1, item]))

		//   newItemsMap.forEach((newItem, id) => {
		//     // Verifying if old items map has the any equal id as the iterating one.
		//     // If not, then this item is an addition
		//     if (!oldItemsMap.has(id)) {
		//       add.push(newItem)
		//       //
		//     } else if (!deepEqual(oldItemsMap.get(id), newItem)) {
		//       modify.push({
		//         id,
		//         old_value: oldItemsMap.get(id),
		//         new_value: newItem,
		//       })
		//     }
		//   })

		//   oldItemsMap.forEach((oldItem, id) => {
		//     if (!newItemsMap.has(id)) {
		//       remove.push(oldItem)
		//     }
		//   })

		//   if (add.length || remove.length || modify.length) {
		//     acc[key] = {} as TArrayChange
		//     if (add.length) acc[key].add = add
		//     if (remove.length) acc[key].remove = remove
		//     if (modify.length) acc[key].modify = modify
		//   }
		// } else {
		//   if (Array.isArray(newValue) || Array.isArray(oldValue)) return acc
		//   if (oldValue === undefined) {
		//     // New information
		//     acc[key] = { oldValue: null, newValue }
		//   } else if (oldValue !== newValue) {
		//     // Changed information
		//     acc[key] = { oldValue, newValue }
		//   }
		// }
		// if (Array.isArray(newValue) || Array.isArray(oldValue)) return acc
		if (oldValue === undefined) {
			// New information
			acc[key] = { oldValue: null, newValue };
		} else if (oldValue !== newValue) {
			// Changed information
			acc[key] = { oldValue, newValue };
		}
		return acc;
	}, {});

	return changes;
}
