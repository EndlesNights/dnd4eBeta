import ActivatedEffectTemplate from "./templates/activated-effect.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";
import PhysicalItemTemplate from "./templates/physical-item.js";

const { StringField } = foundry.data.fields;

export default class ToolData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...PhysicalItemTemplate.defineSchema(),
      ...ActivatedEffectTemplate.defineSchema(),
      ...ItemMacroTemplate.defineSchema(),
      level: new StringField({initial: ""}),
      attribute: new StringField({initial: "abilities.int.mod"}),
      chatFlavor: new StringField({initial: ""}),
      formula: new StringField({initial: ""}),
      bonus: new StringField({initial: "2"})
    }
  }
}