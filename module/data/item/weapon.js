import FormulaField from "../fields/formula-field.js";
import MappingField from "../fields/mapping-field.js";
import ActivatedEffectTemplate from "./templates/activated-effect.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";
import PhysicalItemTemplate from "./templates/physical-item.js";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class WeaponData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			// TODO: Is this actually used anywhere?
			armour: new SchemaField({
				value: new NumberField({ initial: 10, integer: true }),
			}),
			// TODO: Is this actually used anywhere?
			hp: new SchemaField({
				value: new NumberField({ initial: 0, integer: true }),
				max: new NumberField({ initial: 0, integer: true }),
				dt: new StringField({ nullable: true, initial: null }),
				conditions: new StringField({ initial: "" }),
			}),
			level: new StringField({ initial: "" }),
			weaponType: new StringField({ initial: "simpleM" }),
			weaponHand: new StringField({ initial: "HMain" }),
			weaponBaseType: new StringField({ initial: "" }),
			weaponBaseTypeCustom: new StringField({ initial: "" }),
			properties: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.weaponProperties,
				initialKeysOnly: true,
			}),
			proficient: new StringField({ initial: "auto" }),
			proficientI: new BooleanField({ initial: false }),
			profBonus: new NumberField({ initial: 0, integer: true }),
			profImpBonus: new NumberField({ initial: 0, integer: true }),
			enhance: new NumberField({ initial: 0, integer: true }),
			isRanged: new BooleanField({ initial: false }),
			range: new SchemaField({
				value: new NumberField({ initial: 5 }),
				long: new NumberField({ initial: 10 }),
			}),
			damageDice: new SchemaField({
				parts: new ArrayField(new ArrayField(
					new StringField(), {
						min: 3, max: 3, initial: ["", "", ""],
					}), {
					initial: [["1", "8", ""]],
				}),
			}),
			damage: new SchemaField({
				parts: new ArrayField(new ArrayField(new StringField(), { min: 2, max: 2, initial: ["", ""] }), { initial: [] }),
			}),
			damageCrit: new SchemaField({
				parts: new ArrayField(new ArrayField(new StringField(), { min: 2, max: 2, initial: ["", ""] }), { initial: [] }),
			}),
			damageImp: new SchemaField({
				parts: new ArrayField(new ArrayField(new StringField(), { min: 2, max: 2, initial: ["", ""] }), { initial: [] }),
			}),
			damageCritImp: new SchemaField({
				parts: new ArrayField(new ArrayField(new StringField(), { min: 2, max: 2, initial: ["", ""] }), { initial: [] }),
			}),
			damageTypeOverride: new BooleanField({ initial: false }),
			damageType: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.damageTypes,
				initialKeysOnly: true,
			}),
			brutalNum: new NumberField({ initial: 1, integer: true }),
			weaponGroup: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.weaponGroup,
				initialKeysOnly: true,
			}),
			implement: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.implement,
				initialKeysOnly: true,
			}),
			attackForm: new FormulaField({ initial: "@profBonus + @enhance" }),
			attackFormImp: new FormulaField({ initial: "@profImpBonus + @enhance" }),
			damageForm: new FormulaField({ initial: "@enhance" }),
			damageFormImp: new FormulaField({ initial: "@enhance" }),
			critDamageForm: new FormulaField({ initial: "(@enhance)d6" }),
			critDamageFormImp: new FormulaField({ initial: "(@enhance)d6" }),
			critRange: new NumberField({ initial: 20, integer: true, max: 21, min: 0 }),
			critRangeImp: new NumberField({ initial: 20, integer: true, max: 21, min: 0 }),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		if (typeof source.proficient === "boolean") source.proficient = "auto";
		return super.migrateData(source);
	}
}
