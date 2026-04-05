import MappingField from "../../fields/mapping-field.js";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class AttackAndDamageTemplate extends foundry.abstract.DataModel {
  static get attack() {
    return {
      shareAttackRoll: new BooleanField({initial: false}),
      isAttack: new BooleanField({initial: true}),
      isBasic: new BooleanField({initial: false}),
      isCharge: new BooleanField({initial: false}),
      isOpp: new BooleanField({initial: false}),
      canCharge: new BooleanField({initial: false}),
      canOpp: new BooleanField({initial: false}),
      ability: new StringField({initial: "str"}),
      abilityBonus: new NumberField({initial: 0, integer: true}),
      def: new StringField({initial: "ac"}),
      defBonus: new NumberField({initial: 0, integer: true}),
      detail: new StringField({initial: ""}),
      formula: new StringField({initial: "@wepAttack + @powerMod + @lvhalf"})
    };
  }
  static get damage() {
    return {
      shareDamageRoll: new BooleanField({initial: true}),
      damageBonusNull: new BooleanField({initial: false}),
      isDamage: new BooleanField({initial: true}),
      isHealing: new BooleanField({initial: false}),
      healSurge: new StringField({initial: ""}),
      baseQuantity: new StringField({initial: "1"}),
      baseDiceType: new StringField({initial: "Base Weapon Damage"}),
      detail: new StringField({initial: "1[W] + Strength modifier damage."}),
      formula: new StringField({initial: "@powBase + @powMod + @wepDamage"}),
      critFormula: new StringField({initial: "@powMax + @powerMod + @wepDamage + @wepCritBonus"}),
      healFormula: new StringField({initial: ""})
    }
  }
  static defineSchema() {
    return {
      attack: new SchemaField(this.attack),
      hit: new SchemaField(this.damage),
      miss: new SchemaField({
        halfDamage: new BooleanField({initial: false}),
        detail: new StringField({initial: ""}),
        formula: new StringField({initial: ""})
      }),
      effect: new SchemaField({
        detail: new StringField({initial: ""})
      }),
      damage: new SchemaField({
        parts: new ArrayField(new ArrayField(new StringField(), {min: 2, max: 2, initial: ["", ""]}), {initial: []})
      }),
      damageCrit: new SchemaField({
        parts: new ArrayField(new ArrayField(new StringField(), {min: 2, max: 2, initial: ["", ""]}), {initial: []})
      }),
      damageCritImp: new SchemaField({
        parts: new ArrayField(new ArrayField(new StringField(), {min: 2, max: 2, initial: ["", ""]}), {initial: []})
      }),
      damageType: new MappingField(new BooleanField({initial: false}), {
        initialKeys: CONFIG.DND4E.damageTypes,
        initialKeysOnly: true
      })
    }
  }
}