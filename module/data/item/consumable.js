import FormulaField from "../fields/formula-field.js";
import MappingField from "../fields/mapping-field.js";
import ActivatedEffectTemplate from "./templates/activated-effect.js";
import AttackAndDamageTemplate from "./templates/attack-damage.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";
import PhysicalItemTemplate from "./templates/physical-item.js";
import { processPart } from "./_utils.js";

const { BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;

export default class ConsumableData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { attack, hit, ...attackAndDamageSchema } = AttackAndDamageTemplate.defineSchema();
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			...attackAndDamageSchema,
			level: new StringField({ initial: "" }),
			consumableType: new StringField({ initial: "potion" }),
			autoGenChatPowerCard: new BooleanField({ initial: false }),
			useType: new StringField({ initial: "item" }),
			actionType: new StringField({ initial: "" }),
			uses: new SchemaField({
				autoDestroy: new BooleanField({ initial: false }),
				max: new StringField({ initial: "1" }),
				value: new NumberField({ initial: 1, min: 0, integer: true }),
				per: new StringField({ initial: "charges" }),
			}),
			target: new StringField({ initial: "" }),
			rangeType: new StringField({ initial: "" }),
			autoTarget: new SchemaField({
				mode: new StringField({ initial: "none" }),
				includeSelf: new BooleanField({ initial: true }),
			}),
			rangePower: new FormulaField({ initial: "" }),
			area: new FormulaField({ initial: "0", deterministic: true }),
			auraSize: new FormulaField({ initial: "", deterministic: true }),
			attack: new SchemaField({
				...AttackAndDamageTemplate.attack,
				isAttack: new BooleanField({ initial: false }),
				ability: new StringField({ initial: "" }),
				formula: new FormulaField({ initial: "" }),
			}),
			hit: new SchemaField({
				...AttackAndDamageTemplate.damage,
				isDamage: new BooleanField({ initial: false }),
				detail: new StringField({ initial: "" }),
				formula: new FormulaField({ initial: "" }),
				critFormula: new FormulaField({ initial: "" }),
			}),
			effectType: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.effectTypes,
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
		if (source.damage?.parts.length) {
			for (let partIndex = 0; partIndex < source.damage.parts.length; partIndex++) {
				source.damage.parts[partIndex] = processPart(source.damage.parts[partIndex]);
			}
		}
		if (source.damageCrit?.parts.length) {
			for (let partIndex = 0; partIndex < source.damageCrit.parts.length; partIndex++) {
				source.damageCrit.parts[partIndex] = processPart(source.damageCrit.parts[partIndex]);
			}
		}
		if (source.damageCritImp?.parts.length) {
			for (let partIndex = 0; partIndex < source.damageCritImp.parts.length; partIndex++) {
				source.damageCritImp.parts[partIndex] = processPart(source.damageCritImp.parts[partIndex]);
			}
		}
		return super.migrateData(source);
	}
}
