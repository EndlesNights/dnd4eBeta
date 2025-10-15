import SimpleTraitField from "../fields/simple-trait-field.js";
import DetailsField from "./details.js";

const { HTMLField, SchemaField, StringField } = foundry.data.fields;

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
        vision: new SimpleTraitField(),
        special: new SimpleTraitField({}, {label: "DND4E.SpecialSenses"}),
        notes: new StringField({initial: ""})
      }, {label: "DND4E.Senses"})
    }
  }
}