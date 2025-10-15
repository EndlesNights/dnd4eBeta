import BonusField from "../fields/bonus-field.js";
import Dnd4eBonusesField from "../fields/dnd4e-bonuses-field.js";

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class AttributesField {
  static get common() {
    const numberConfig = {required: true, nullable: false, integer: true, min: 0};
    return {
      hp: new Dnd4eBonusesField({
        value: new NumberField({...numberConfig, initial: 10}),
        min: new NumberField({...numberConfig, initial: 0}),
        max: new NumberField({...numberConfig, initial: 10}),
        starting: new NumberField({...numberConfig, initial: 0}),
        perlevel: new NumberField({...numberConfig, initial: 0}),
        misc: new NumberField({...numberConfig, initial: 0}),
        autototal: new BooleanField({initial: false}),
        temprest: new BooleanField({initial: false})
      }),
      temphp: new SchemaField({
        value: new NumberField({...numberConfig, initial: 0}),
        max: new NumberField({...numberConfig, initial: 0})
      }),
      init: new Dnd4eBonusesField({
        value: new NumberField({...numberConfig, initial: 0}),
        ability: new StringField({initial: "dex"}),
        bonus: new BonusField(),
        notes: new StringField({initial: ""})
      })
    }
  }
}