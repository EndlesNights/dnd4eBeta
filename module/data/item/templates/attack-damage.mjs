import { FormulaField, MappingField } from "../../fields/_module.mjs";
import DamagePartsField from "../fields/damage-parts-field.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class AttackAndDamageTemplate extends foundry.abstract.DataModel {
	/** Getter for attack template. */
	static get attack() {
		return {
			shareAttackRoll: new BooleanField({ initial: false }),
			isAttack: new BooleanField({ initial: true }),
			isBasic: new BooleanField({ initial: false }),
			isCharge: new BooleanField({ initial: false }),
			isOpp: new BooleanField({ initial: false }),
			canCharge: new BooleanField({ initial: false }),
			canOpp: new BooleanField({ initial: false }),
			ability: new StringField({ initial: "str" }),
			abilityBonus: new NumberField({ initial: 0, integer: true }),
			def: new StringField({ initial: "ac" }),
			defBonus: new NumberField({ initial: 0, integer: true }),
			detail: new StringField({ initial: "" }),
			formula: new FormulaField({ initial: "@wepAttack + @powerMod + @lvhalf" }),
		};
	}

	/** Getter for damage template. */
	static get damage() {
		return {
			shareDamageRoll: new BooleanField({ initial: true }),
			damageBonusNull: new BooleanField({ initial: false }),
			isDamage: new BooleanField({ initial: true }),
			isHealing: new BooleanField({ initial: false }),
			healSurge: new StringField({ initial: "" }),
			baseQuantity: new FormulaField({ initial: "1", deterministic: true }),
			baseDiceType: new StringField({ initial: "Base Weapon Damage" }),
			detail: new StringField({ initial: "1[W] + Strength modifier damage." }),
			formula: new FormulaField({ initial: "@powBase + @powerMod + @wepDamage" }),
			critFormula: new FormulaField({ initial: "@powMax + @powerMod + @wepDamage + @wepCritBonus" }),
			healFormula: new FormulaField({ initial: "" }),
		};
	}
    
	/** @inheritDoc */
	static defineSchema() {
		return {
			attack: new SchemaField(this.attack),
			hit: new SchemaField(this.damage),
			miss: new SchemaField({
				halfDamage: new BooleanField({ initial: false }),
				detail: new StringField({ initial: "" }),
				formula: new FormulaField({ initial: "" }),
			}),
			effect: new SchemaField({
				detail: new StringField({ initial: "" }),
			}),
			damage: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageCrit: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageMiss: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageCritImp: new SchemaField({
				parts: new ArrayField(new DamagePartsField(), { initial: [] }),
			}),
			damageType: new MappingField(new BooleanField({ initial: false }), {
				initialKeys: CONFIG.DND4E.damageTypes,
				initialKeysOnly: true,
			}),
		};
	}
}
