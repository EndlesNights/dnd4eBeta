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
		if ("movement" in source) {
			SpeedTemplate.migrateSpeed(source);
		}

		if ("senses" in source) {
			CreatureTemplate.migrateSenses(source);
		}

		if ("defences" in source) {
			CombatantTemplate.migrateDefences(source);
		}

		return super.migrateData(source);
	}
}
