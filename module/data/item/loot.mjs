import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate, PhysicalItemTemplate } from "./templates/_module.mjs";

const { StringField } = foundry.data.fields;

export default class LootData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			level: new StringField({ initial: "" }),
		};
	}
}
