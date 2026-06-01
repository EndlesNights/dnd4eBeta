/*
* Utility function to migrate a damage part from a string array to an object.
* @param {Array} part       The damage part to migrate
*/
export function processPart(part) {
	if (!Array.isArray(part)) return part;
	const formula = part[0];
	const type = part[1];
	part = {
		formula: formula,
		type: new Set([type]),
	};
	return part;
}
