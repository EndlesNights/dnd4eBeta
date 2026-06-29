import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate, PhysicalItemTemplate } from "./templates/_module.mjs";

const { StringField } = foundry.data.fields;

export default class ToolData extends foundry.abstract.TypeDataModel {
	/* -------------------------------------------- */
	/** @override */
	static LOCALIZATION_PREFIXES = ["DND4E.SOURCE"];

	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			level: new StringField({ initial: "" }),
			attribute: new StringField({ initial: "abilities.int.mod" }),
			chatFlavor: new StringField({ initial: "" }),
			formula: new StringField({ initial: "" }),
			bonus: new StringField({ initial: "2" }),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		ItemDescriptionTemplate.migrateSource(source);
		return super.migrateData(source);
	}
}
