import { BonusField, Dnd4eBonusesField, SimpleTraitField } from "./fields/_module.mjs";
import FormulaField from "../fields/formula-field.mjs";
import { AttributesField, CombatantTemplate, CreatureTemplate, DetailsField, SpeedTemplate, WealthTemplate } from "./templates/_module.mjs";

const { BooleanField, NumberField, ObjectField, StringField, SchemaField } = foundry.data.fields;

export default class CharacterData extends foundry.abstract.TypeDataModel {
	/** @inheritDoc */
	static defineSchema() {
		const { details: creatureDetails, ...creatureSchema } = CreatureTemplate.defineSchema();
		const { details: combatantDetails, defences, ...combatantSchema } = CombatantTemplate.defineSchema();
		const wealthSchema = WealthTemplate.defineSchema();
		const speedSchema = SpeedTemplate.defineSchema();
		return {
			...creatureSchema,
			...combatantSchema,
			...wealthSchema,
			...speedSchema,
			details: new SchemaField({
				...DetailsField.combatant,
				...DetailsField.creature,
				class: new StringField({ initial: "" }),
				paragon: new StringField({ initial: "" }),
				epic: new StringField({ initial: "" }),
				secondWind: new BooleanField({ initial: false }),
				secondWindEffect: new ObjectField({ initial: {} }),
				deathsaves: new NumberField({ initial: 3 }),
				deathsavefail: new NumberField({ initial: 0 }),
				deathsaveCrit: new NumberField({ initial: 20 }),
				deathsavebon: new Dnd4eBonusesField({
					value: new NumberField({ initial: 0 }),
					bonus: new BonusField(),
					custom: new StringField({ initial: "" }),
				}),
				secondwindbon: new Dnd4eBonusesField({
					value: new NumberField({ initial: 0 }),
					bonus: new BonusField(),
					custom: new StringField({ initial: "" }),
				}),
				weaponProf: new SimpleTraitField(),
				implementProf: new SimpleTraitField(),
				armourProf: new SimpleTraitField(),
			}),
			resources: new SchemaField({
				primary: new SchemaField({
					label: new StringField({ initial: "" }),
					value: new StringField({ initial: "" }),
					max: new StringField({ initial: "", deterministic: true }),
					sr: new BooleanField({ initial: false }),
					lr: new BooleanField({ initial: false }),
				}),
				secondary: new SchemaField({
					label: new StringField({ initial: "" }),
					value: new StringField({ initial: "" }),
					max: new StringField({ initial: "", deterministic: true }),
					sr: new BooleanField({ initial: false }),
					lr: new BooleanField({ initial: false }),
				}),
				tertiary: new SchemaField({
					label: new StringField({ initial: "" }),
					value: new StringField({ initial: "" }),
					max: new StringField({ initial: "", deterministic: true }),
					sr: new BooleanField({ initial: false }),
					lr: new BooleanField({ initial: false }),
				}),
			}),
			attributes: new SchemaField(AttributesField.common),
			defences,
			magicItemUse: new SchemaField({
				perDay: new NumberField({ min: 0, initial: 1, integer: true }),
				bonusValue: new NumberField({ initial: 0, integer: true }),
				milestone: new NumberField({ min: 0, initial: 0, integer: true }),
				dailyuse: new NumberField({ min: 0, initial: 0, integer: true }),
				encounteruse: new BooleanField({ initial: false }),
			}),
			encumbrance: new SchemaField({
				value: new NumberField({ required: true, nullable: true, initial: null }),
				max: new NumberField({ required: true, nullable: true, initial: null }),
				formulaNorm: new FormulaField({ initial: "@abilities.str.value * 10", deterministic: true }),
				formulaHeavy: new FormulaField({ initial: "@abilities.str.value * 20", deterministic: true }),
				formulaMax: new FormulaField({ initial: "@abilities.str.value * 50", deterministic: true }),
				encumbered: new BooleanField({ required: false }),
				maxHeavy: new NumberField({ required: false }),
				maxMax: new NumberField({ required: false }),
			}),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		const needsACMigration = typeof source.defences?.ac?.light === "boolean";
    
		if (!source.senses?.special?.value && !needsACMigration) return super.migrateData(source);

		const oldSenses = Array.from(source.senses?.special?.value);
		delete source.senses?.special?.value;
		if (!oldSenses.length && !needsACMigration) return super.migrateData(source);

		const flattenedSource = foundry.utils.flattenObject(source);
		delete flattenedSource["senses.special.value"];    
		for (const sense of oldSenses) {
			flattenedSource[`senses.special.${sense[0]}`] = { value: true, range: sense[1] };
		}

		if (needsACMigration) flattenedSource["defences.ac.light"] = "auto";

		return super.migrateData(foundry.utils.expandObject(flattenedSource));
	}
}
