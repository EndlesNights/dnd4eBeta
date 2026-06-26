import WealthTemplate from "../actor/templates/wealth.mjs";
import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate, PhysicalItemTemplate } from "./templates/_module.mjs";

const { BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;

export default class BackpackData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			...WealthTemplate.defineSchema(),
			level: new StringField({ initial: "" }),
			capacity: new SchemaField({
				type: new StringField({ initial: "weight" }),
				value: new NumberField({ min: 0, initial: 0 }),
				weightless: new BooleanField({ initial: false }),
			}),
      
		};
	}
}
