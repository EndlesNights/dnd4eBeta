import { BonusField, Dnd4eBonusesField } from "./fields/_module.mjs";
import MappingField from "../fields/mapping-field.mjs";
import SourceField from "../fields/source-field.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import { AttributesField, CombatantTemplate, DetailsField, SpeedTemplate } from "./templates/_module.mjs";

const { BooleanField, DocumentUUIDField, HTMLField, NumberField, StringField, SchemaField } = foundry.data.fields;

export default class HazardData extends foundry.abstract.TypeDataModel {
	/* -------------------------------------------- */
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.SOURCE"];
  
	/** @inheritDoc */
	static defineSchema() {
		const numberConfig = { required: true, nullable: false, integer: true };
		const { details: combatantDetails, defences, ...combatantSchema } = CombatantTemplate.defineSchema();
		return {
			...combatantSchema,
			movement: new SchemaField({
				...SpeedTemplate.common,
				none: new BooleanField({ initial: false }),
			}),
			description: new HTMLField({ initial: "" }),
			details: new SchemaField({
				...DetailsField.combatant,
				detection: new StringField({ initial: "" }),
				countermeasures: new StringField({ initial: "" }),
				role: new SchemaField({
					primary: new StringField({ initial: "trap" }),
					secondary: new StringField({ initial: "standard" }),
					tertiary: new StringField({ initial: "lurker" }),
				}),
				size: new StringField({ initial: "med" }),
				bloodied: new NumberField({ initial: 0 }),
				notes: new StringField({ initial: "" }),
			}),
			advancedCals: new BooleanField({ initial: false }),
			attributes: new SchemaField({
				...AttributesField.common,
				init: new Dnd4eBonusesField({
					value: new NumberField({ initial: 0 }),
					ability: new StringField({ initial: "" }),
					bonus: new BonusField(),
					notes: new StringField({ initial: "" }),
					base: new NumberField({ initial: 0 }),
					none: new BooleanField({ initial: false }),
				}),
				hp: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 10 }),
					min: new NumberField({ ...numberConfig, initial: 0 }),
					max: new NumberField({ ...numberConfig, initial: 10 }),
					starting: new NumberField({ ...numberConfig, initial: 0 }),
					perlevel: new NumberField({ ...numberConfig, initial: 0 }),
					misc: new NumberField({ ...numberConfig, initial: 0 }),
					autototal: new BooleanField({ initial: false }),
					temprest: new BooleanField({ initial: false }),
					none: new BooleanField({ initial: false }),
				}),
			}),
			defences: new MappingField(new Dnd4eBonusesField({
				...CombatantTemplate.defences,
				base: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 10 }),
				none: new BooleanField({ initial: false }),
			}), {
				initialKeys: CONFIG.DND4E.defensives,
				initialKeysOnly: true,
				initialValue: CombatantTemplate._initialDefencesValue,
				label: "DND4E.Defences",
			}),
			controller: new DocumentUUIDField({
				type: "Actor",
			}),
			identifier: new IdentifierField({ required: true, label: "DND4E.Identifier" }),
			source: new SourceField(),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		if (("source" in source) && (foundry.utils.getType(source.source) !== "Object")) {
			source.source = { custom: source.source };
		}
    
		if (typeof source.defences?.ac?.light === "boolean") source.defences.ac.light = "auto";
		return super.migrateData(source);
	}
}
