const { ArrayField, BooleanField, SchemaField, StringField } = foundry.data.fields;

export default class BonusField extends ArrayField {
  constructor(_, options={initial: []}, context={}) {
    const element = new SchemaField({
      name: new StringField(),
      value: new StringField(),
      active: new BooleanField(),
      note: new StringField()
    });
    super(element, options, context);
  }
}