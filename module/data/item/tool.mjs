import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate, PhysicalItemTemplate } from "./templates/_module.mjs";

const { NumberField, StringField } = foundry.data.fields;

export default class ToolData extends foundry.abstract.TypeDataModel {
	/* -------------------------------------------- */
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.SOURCE"];

	/** @inheritDoc */
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			level: new NumberField({ required: true, nullable: true, initial: null }),
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
		if (("level" in source) && isNaN(source.level)) {
			source.level = null;
		}
		ItemDescriptionTemplate.migrateSource(source);
		ItemMacroTemplate.migrateMacro(source);
		return super.migrateData(source);
	}
}
