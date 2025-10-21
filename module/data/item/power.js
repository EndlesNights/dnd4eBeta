import MappingField from "../fields/mapping-field.js";
import ActivatedEffectTemplate from "./templates/activated-effect.js";
import AttackAndDamageTemplate from "./templates/attack-damage.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";

const { ArrayField, BooleanField, SchemaField, SetField, StringField } = foundry.data.fields;

export default class PowerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...ActivatedEffectTemplate.defineSchema(),
      ...ItemMacroTemplate.defineSchema(),
      ...AttackAndDamageTemplate.defineSchema(),
      keyWords: new SetField(new StringField(), {initial: []}),
      level: new StringField({initial: ""}),
      powersource: new StringField({initial: "martial"}),
      secondPowersource: new StringField({initial: ""}),
      powersourceName: new StringField({initial: ""}),
      subName: new StringField({initial: ""}),
      prepared: new BooleanField({initial: true}),
      powerType: new StringField({initial: "class"}),
      powerSubtype: new StringField({initial: "attack"}),
      useType: new StringField({initial: "atwill"}),
      actionType: new StringField({initial: "standard"}),
      requirements: new StringField({initial: ""}),
      weaponType: new StringField({initial: "melee"}),
      weaponUse: new StringField({initial: "default"}),
      rangeType: new StringField({initial: "weapon"}),
      autoTarget: new SchemaField({
        mode: new StringField({initial: "none"}),
        includeSelf: new BooleanField({initial: true})
      }),
      rangeTextShort: new StringField({initial: ""}),
      rangeText: new StringField({initial: ""}),
      rangePower: new StringField({initial: ""}),
      area: new StringField({initial: "0"}),
      rechargeRoll: new StringField({initial: ""}),
      rechargeCondition: new StringField({initial: ""}),
      damageShare: new BooleanField({initial: false}),
      postEffect: new BooleanField({initial: true}),
      postSpecial: new BooleanField({initial: true}),
      autoGenChatPowerCard: new BooleanField({initial: true}),
      sustain: new SchemaField({
        actionType: new StringField({initial: ""}),
        detail: new StringField({initial: ""})
      }),
      target: new StringField({initial: "One creature"}),
      trigger: new StringField({initial: ""}),
      requirement: new StringField({initial: ""}),
      special: new StringField({initial: ""}),
      specialAdd: new SchemaField({
        parts: new ArrayField(new StringField({initial: ""}), {initial: []})
      }),
      effectType: new MappingField(new BooleanField({initial: false}), {
        initialKeys: CONFIG.DND4E.effectTypes,
        initialKeysOnly: true
      }),
      keywordsCustom: new StringField({initial: ""})
    }
  }
}