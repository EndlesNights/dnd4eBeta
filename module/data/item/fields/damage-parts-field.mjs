const { SchemaField, SetField, StringField } = foundry.data.fields;
import FormulaField from "../../fields/formula-field.mjs";

/**
 * @import { DamagePartsData } from "./_types.mjs";
 */

export default class DamagePartsField extends SchemaField {
	constructor(fields = {}, { initialValue = [], ...options } = {}) {
		const damageTypes = Object.fromEntries(Object.entries(CONFIG.DND4E.damageTypes).filter(([key, value]) => !["damage", "ongoing"].includes(key)));
		fields = {
			formula: new FormulaField({ required: true, nullable: false, initial: "" }),
			type: new SetField(new StringField({
				required: true,
				nullable: true,
				choices: damageTypes,
			})),
		};
		Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
		super(fields, options);
	}
}
