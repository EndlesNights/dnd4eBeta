import MappingField from "../fields/mapping-field.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";

const { BooleanField, StringField } = foundry.data.fields;

export default class FeatureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...ItemMacroTemplate.defineSchema(),
      featureType: new StringField({initial: "other"}),
      level: new StringField({initial: ""}),
      requirements: new StringField({initial: ""}),
      featureSource: new StringField({initial: ""}),
      featureGroup: new StringField({initial: ""}),
      auraSize: new StringField({initial: ""}),
      effectType: new MappingField(new BooleanField({initial: false}), {
        initialKeys: CONFIG.DND4E.effectTypes,
        initialKeysOnly: true
      }),
      damageType: new MappingField(new BooleanField({initial: false}), {
        initialKeys: CONFIG.DND4E.damageTypes,
        initialKeysOnly: true
      }),
      keywordsCustom: new StringField({initial: ""})
    }
  }
}