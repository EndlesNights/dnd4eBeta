import SimpleTraitField from "../fields/simple-trait-field.js";
import DetailsField from "./details.js";

const { ArrayField, HTMLField, SchemaField, SetField, StringField } = foundry.data.fields;

export default class CreatureTemplate extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      biography: new HTMLField({initial: ""}, {label: "DND4E.Biography"}),
      details: new SchemaField(DetailsField.creature, {label: "DND4E.Details"}),
      languages: new SchemaField({
        spoken: new SimpleTraitField({}, {label: "DND4E.Spoken"}),
        script: new SimpleTraitField({}, {label: "DND4E.Script"})
      }, {label: "DND4E.Languages"}),
      senses: new SchemaField({
        special: new SchemaField({
          value: new SetField(new ArrayField(new StringField()), {initial: []}),
          custom: new StringField({required: true, initial: ""})
        }),
        notes: new StringField({initial: ""})
      }, {label: "DND4E.Senses"})
    }
  }
}