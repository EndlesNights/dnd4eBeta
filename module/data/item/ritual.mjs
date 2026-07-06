import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate } from "./templates/_module.mjs";

const { SchemaField, StringField, BooleanField } = foundry.data.fields;

export default class RitualData extends foundry.abstract.TypeDataModel {
	/* -------------------------------------------- */
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.SOURCE"];

	/** @inheritDoc */
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			castTime: new SchemaField({
				value: new StringField({ nullable: true, initial: null }),
				units: new StringField({ initial: "" }),
			}),
			autoCard: new BooleanField({ initial: true }),
			requirements: new StringField({ initial: "" }),
			level: new StringField({ initial: "" }),
			market: new StringField({ initial: "" }),
			attribute: new StringField({ initial: "skills.arc.total" }),
			formula: new StringField({ initial: "" }),
			category: new StringField({ initial: "other" }),
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
