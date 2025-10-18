const { BooleanField, ForeignDocumentField, NumberField, StringField } = foundry.data.fields;

export default class PhysicalItemTemplate extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      quantity: new NumberField({min: 0, initial: 1, integer: true}),
      weight: new NumberField({min: 0, initial: 0}),
      price: new NumberField({min: 0, initial: 0}),
      attuned: new BooleanField({initial: false}),
      equipped: new BooleanField({initial: false}),
      rarity: new StringField({initial: ""}),
      identified: new BooleanField({initial: true}),
      container: new ForeignDocumentField(foundry.documents.BaseItem, {
        idOnly: true
      })
    }
  }
}