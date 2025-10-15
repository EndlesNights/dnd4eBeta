const { SchemaField, NumberField } = foundry.data.fields;

export default class Dnd4eBonusesField extends SchemaField {
  constructor(fields={}, { initialValue=[], ...options }={}) {
    const numberConfig = {required: true, nullable: false, integer: true, min: 0};
    fields = {
      feat: new NumberField({...numberConfig, initial: 0}),
      item: new NumberField({...numberConfig, initial: 0}),
      power: new NumberField({...numberConfig, initial: 0}),
      race: new NumberField({...numberConfig, initial: 0}),
      untyped: new NumberField({...numberConfig, initial: 0}),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
