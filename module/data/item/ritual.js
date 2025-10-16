import ActivatedEffectTemplate from "./templates/activated-effect.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";

const { StringField } = foundry.data.fields;

export default class RitualData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...ActivatedEffectTemplate.defineSchema(),
      ...ItemMacroTemplate.defineSchema(),
      requirements: new StringField({initial: ""}),
      level: new StringField({initial: ""}),
      chatFlavor: new StringField({initial: ""}),
      attribute: new StringField({initial: "skills.arc.total"}),
      formula: new StringField({initial: ""}),
      category: new StringField({initial: "other"})
    }
  }
}