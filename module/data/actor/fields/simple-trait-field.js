// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

const { SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Data structure for a standard actor trait.
 *
 * @typedef {object} SimpleTraitData
 * @property {Set<string>} value  Keys for currently selected traits.
 * @property {string} custom      Semicolon-separated list of custom traits.
 */

/**
 * Field for storing standard trait data
 */
export default class SimpleTraitField extends SchemaField {
  constructor(fields={}, { initialValue=[], ...options }={}) {
    fields = {
      value: new SetField(new StringField(), {initial: initialValue}),
      custom: new StringField({required: true, initial: ""}),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
