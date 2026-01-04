const { SchemaField, StringField } = foundry.data.fields;

export default class ItemMacroTemplate extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      macro: new SchemaField({
        type: new StringField({initial: "script"}),
        scope: new StringField({initial: "global"}),
        launchOrder: new StringField({initial: "off"}),
        command: new StringField({initial: ""}),
        author: new StringField({initial: ""}),
        autoanimationHook: new StringField({initial: ""})
      })
    }
  }
}