import MappingField from "../../fields/mapping-field.js";
const { NumberField } = foundry.data.fields;

export default class WealthTemplate extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      currency: new MappingField(new NumberField({
        required: true, nullable: false, integer: true, min: 0, initial: 0
      }), {initialKeys: CONFIG.DND4E.currencies, initialKeysOnly: true, label: "DND4E.Currency"}),
      ritualcomp: new MappingField(new NumberField({
        required: true, nullable: false, integer: true, min: 0, initial: 0
      }), {initialKeys: CONFIG.DND4E.ritualcomponents, initialKeysOnly: true, label: "DND4E.RitualComp"})
    }
  }
}