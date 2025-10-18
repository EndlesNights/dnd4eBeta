const { SchemaField, StringField } = foundry.data.fields;

export default class ItemDescriptionTemplate extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: new SchemaField({
        value: new StringField({initial: ""}),
        chat: new StringField({initial: ""}),
        unidentified: new StringField({initial: ""})
      }),
      descriptionGM: new SchemaField({
        value: new StringField({initial: ""})
      }),
      source: new StringField({initial: ""})
    }
  }
}