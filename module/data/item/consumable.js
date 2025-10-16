import MappingField from "../fields/mapping-field.js";
import ActivatedEffectTemplate from "./templates/activated-effect.js";
import AttackAndDamageTemplate from "./templates/attack-damage.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";
import PhysicalItemTemplate from "./templates/physical-item.js";

const { BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;

export default class ConsumableData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const {attack, hit, ...attackAndDamageSchema} = AttackAndDamageTemplate.defineSchema();
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...PhysicalItemTemplate.defineSchema(),
      ...ActivatedEffectTemplate.defineSchema(),
      ...ItemMacroTemplate.defineSchema(),
      ...attackAndDamageSchema,
      level: new StringField({initial: ""}),
      consumableType: new StringField({initial: "potion"}),
      autoGenChatPowerCard: new BooleanField({initial: false}),
      useType: new StringField({initial: "item"}),
      actionType: new StringField({initial: ""}),
      uses: new SchemaField({
        autoDestroy: new BooleanField({initial: false}),
        max: new StringField({initial: "1"}),
        value: new NumberField({initial: 1, min: 0, integer: true}),
        per: new StringField({initial: "charges"})
      }),
      target: new StringField({initial: ""}),
      rangeType: new StringField({initial: ""}),
      autoTarget: new SchemaField({
        mode: new StringField({initial: "none"}),
        includeSelf: new BooleanField({initial: true})
      }),
      attack: new SchemaField({
        ...AttackAndDamageTemplate.attack,
        isAttack: new BooleanField({initial: false}),
        ability: new StringField({initial: ""}),
        formula: new StringField({initial: ""})
      }),
      hit: new SchemaField({
        ...AttackAndDamageTemplate.damage,
        isDamage: new BooleanField({initial: false}),
        detail: new StringField({initial: ""}),
        formula: new StringField({initial: ""}),
        critFormula: new StringField({initial: ""})
      }),
      effectType: new MappingField(new BooleanField({initial: false}), {
        initialKeys: CONFIG.DND4E.effectTypes,
        initialKeysOnly: true
      }),
      keywordsCustom: new StringField({initial: ""})
    }
  }
}