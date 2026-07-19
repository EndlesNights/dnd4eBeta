import { BonusField, Dnd4eBonusesField } from "./fields/_module.mjs";
import MappingField from "../fields/mapping-field.mjs";
import SourceField from "../fields/source-field.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import { AttributesField, CombatantTemplate, CreatureTemplate, DetailsField, SpeedTemplate, WealthTemplate } from "./templates/_module.mjs";

const { BooleanField, DocumentUUIDField, NumberField, StringField, SchemaField } = foundry.data.fields;

export default class NPCData extends foundry.abstract.TypeDataModel {
	/* -------------------------------------------- */
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.SOURCE"];
  
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
				role: new SchemaField({
					primary: new StringField({ initial: "brute" }),
					secondary: new StringField({ initial: "standard" }),
					leader: new BooleanField({ initial: false }),
				}),
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
				}),
			}),
			defences: new MappingField(new Dnd4eBonusesField({
				...CombatantTemplate.defences,
				base: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 10 }),
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
    
		if (("source" in source) && (foundry.utils.getType(source.source) !== "Object")) {
			flattenedSource.source = { custom: source.source };
		}

		return super.migrateData(foundry.utils.expandObject(flattenedSource));
	}
}
