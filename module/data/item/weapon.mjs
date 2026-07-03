import DamagePartsField from "./fields/damage-parts-field.mjs";
import { FormulaField, MappingField } from "../fields/_module.mjs";
import { ActivatedEffectTemplate, ItemDescriptionTemplate, ItemMacroTemplate, PhysicalItemTemplate } from "./templates/_module.mjs";
import { processPart } from "./_utils.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class WeaponData extends foundry.abstract.TypeDataModel {
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
				parts: new ArrayField(new SchemaField({
					numDice: new FormulaField({ initial: "", determinitistic: true }),
					numFaces: new FormulaField({ initial: "", determinitistic: true }),
					modifier: new FormulaField({ initial: "" }),
				})),
			}),
			damage: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageCrit: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageImp: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageCritImp: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
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
		if (source.damageImp?.parts.length) {
			for (let partIndex = 0; partIndex < source.damageImp.parts.length; partIndex++) {
				source.damageImp.parts[partIndex] = processPart(source.damageImp.parts[partIndex]);
			}
		}
		if (source.damageCritImp?.parts.length) {
			for (let partIndex = 0; partIndex < source.damageCritImp.parts.length; partIndex++) {
				source.damageCritImp.parts[partIndex] = processPart(source.damageCritImp.parts[partIndex]);
			}
		}
		if (source.damageDice?.parts.length) {
			for (let partIndex = 0; partIndex < source.damageDice.parts.length; partIndex++) {
				if (!Array.isArray(source.damageDice.parts[partIndex])) continue;
				const numDice = source.damageDice.parts[partIndex][0];
				const numFaces = source.damageDice.parts[partIndex][1];
				const modifier = source.damageDice.parts[partIndex][2];
				source.damageDice.parts[partIndex] = {
					numDice: numDice,
					numFaces: numFaces,
					modifier: modifier,
				};
			}
		}
		ItemDescriptionTemplate.migrateSource(source);
		return super.migrateData(source);
	}
}
