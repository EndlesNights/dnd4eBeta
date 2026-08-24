import MappingField from "../fields/mapping-field.mjs";
import { ItemDescriptionTemplate, ItemMacroTemplate } from "./templates/_module.mjs";

const { BooleanField, NumberField, StringField } = foundry.data.fields;

export default class FeatureData extends foundry.abstract.TypeDataModel {
	/* -------------------------------------------- */
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.SOURCE"];

	/** @inheritDoc */
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			featureType: new StringField({ initial: "other" }),
			level: new NumberField({ required: true, nullable: true, initial: null }),
			requirements: new StringField({ initial: "" }),
			featureSource: new StringField({ initial: "" }),
			featureGroup: new StringField({ initial: "" }),
			auraSize: new StringField({ initial: "" }),
			effectType: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.effectTypes,
				initialKeysOnly: true,
			}),
			damageType: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.damageTypes,
				initialKeysOnly: true,
			}),
			keywordsCustom: new StringField({ initial: "" }),
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
