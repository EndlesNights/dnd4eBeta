const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class ActivatedEffectTemplate extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      activation: new SchemaField({
        type: new StringField({initial: ""}),
        cost: new NumberField({min: 0, initial: 0, integer: true}),
        condition: new StringField({initial: ""})
      }),
      duration: new SchemaField({
        value: new StringField({nullable: true, initial: null}),
        units: new StringField({initial: ""})
      }),
      target: new SchemaField({
        value: new StringField({nullable: true, initial: null}),
        width: new StringField({nullable: true, initial: null}),
        units: new StringField({initial: ""}),
        type: new StringField({initial: ""})
      }),
      range: new SchemaField({
        value: new StringField({nullable: true, initial: null}),
        long: new StringField({nullable: true, initial: null}),
        units: new StringField({initial: ""})
      }),
      uses: new SchemaField({
        value: new NumberField({min: 0, initial: 0, integer: true}),
        max: new StringField({initial: "0"}),
        per: new StringField({nullable: true, initial: null})
      }),
      consume: new SchemaField({
        type: new StringField({nullable: true, initial: null}),
        target: new StringField({nullable: true, initial: null}),
        amount: new StringField({nullable: true, initial: null})
      })
    }
  }
}