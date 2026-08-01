import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate, PhysicalItemTemplate } from "./templates/_module.mjs";

const { NumberField, StringField } = foundry.data.fields;

export default class LootData extends foundry.abstract.TypeDataModel {
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
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		ItemDescriptionTemplate.migrateSource(source);
		ItemMacroTemplate.migrateMacro(source);
		return super.migrateData(source);
	}
}
