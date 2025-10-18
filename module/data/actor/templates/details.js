import BonusField from "../fields/bonus-field.js";
import Dnd4eBonusesField from "../fields/dnd4e-bonuses-field.js";

const { NumberField, StringField } = foundry.data.fields;

export default class DetailsField {
  static get creature() {
    return {
      size: new StringField({initial: "med"}, {label: "DND4E.Size"}),
      origin: new StringField({initial: "natural"}, {label: "DND4E.CreatureOrigin"}),
      type: new StringField({initial: "humanoid"}, {label: "DND4E.Type"}),
      other: new StringField({initial: ""}, {label: "DND4E.Other"}),
      race: new StringField({initial: ""}, {label: "DND4E.Race"}),
      age: new StringField({initial: ""}, {label: "DND4E.Age"}),
      gender: new StringField({initial: ""}, {label: "DND4E.Gender"}),
      height: new StringField({initial: ""}, {label: "DND4E.Height"}),
      weight: new StringField({initial: ""}, {label: "DND4E.Weight"}),
      alignment: new StringField({initial: ""}, {label: "DND4E.Alignment"}),
      deity: new StringField({initial: ""}, {label: "DND4E.Deity"})
    }
  }

  static get combatant() {
    const numberConfig = {required: true, nullable: false, integer: true};
    return {
      level: new NumberField({...numberConfig, initial: 1}),
      tier: new NumberField({...numberConfig, initial: 1}),
      exp: new NumberField({...numberConfig, initial: 0}),
      bloodied: new NumberField({...numberConfig, initial: 0}),
      surgeValue: new NumberField({...numberConfig, initial: 0}),
      surgeBon: new Dnd4eBonusesField({
        bonus: new BonusField(),
        value: new NumberField({...numberConfig, initial: 0})
      }),
      surges: new Dnd4eBonusesField({
        value: new NumberField({...numberConfig, initial: 0}),
        max: new NumberField({...numberConfig, initial: 0})
      }),
      surgeEnv: new Dnd4eBonusesField({
        bonus: new BonusField(),
        value: new NumberField({...numberConfig, initial: 0})
      }),
      saves: new Dnd4eBonusesField({
        bonus: new BonusField(),
        value: new NumberField({...numberConfig, initial: 0})
      })
    }
  }
}