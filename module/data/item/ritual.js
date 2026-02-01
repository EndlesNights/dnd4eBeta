import ActivatedEffectTemplate from "./templates/activated-effect.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";

const { NumberField, SchemaField, StringField, BooleanField } = foundry.data.fields;

export default class RitualData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...ActivatedEffectTemplate.defineSchema(),
      ...ItemMacroTemplate.defineSchema(),
      castTime: new SchemaField({
        value: new StringField({nullable: true, initial: null}),
        units: new StringField({initial: ""})
      }),
      autoCard: new BooleanField({initial: true}),
      requirements: new StringField({initial: ""}),
      level: new StringField({initial: ""}),
      market: new StringField({initial:""}),
      attribute: new StringField({initial: "skills.arc.total"}),
      formula: new StringField({initial: ""}),
      category: new StringField({initial: "other"})
    }
  }
}