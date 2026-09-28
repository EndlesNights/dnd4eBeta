import SystemModel4e from "../system-model.mjs";
import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate } from "./templates/_module.mjs";

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class RitualData extends SystemModel4e {
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
			level: new NumberField({ required: true, nullable: true, initial: null }),
			market: new StringField({ initial: "" }),
			attribute: new StringField({ initial: "skills.arc.total" }),
			formula: new StringField({ initial: "" }),
			category: new StringField({ initial: "other" }),
		};
	}

	/* -------------------------------------------- */
	/*  Properties                              */
	/* -------------------------------------------- */

	/**
	 * Gets this ritual's subtype
	 * @return {"alchemical"|"martial"|"other"|"ritual"}
	 */
	get subtype() {
		switch (this.category) {
			case "binding":
			case "creation":
			case "deception":
			case "divination":
			case "exploration":
			case "restoration":
			case "scrying":
			case "travel":
			case "warding":
				return "ritual";
			case "martial":
				return "martial";
			case "curative":
			case "oil":
			case "poison":
			case "volatile":
			case "alchother":
				return "alchemical";
			case "other":
			default:
				return "other";
		}
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
