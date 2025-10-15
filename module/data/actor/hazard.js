import BonusField from "./fields/bonus-field.js";
import Dnd4eBonusesField from "./fields/dnd4e-bonuses-field.js";
import MappingField from "./fields/mapping-field.js";
import AttributesField from "./templates/attributes.js";
import CombatantTemplate from "./templates/combatant.js";
import DetailsField from "./templates/details.js";
import SpeedTemplate from "./templates/speed.js";

const { BooleanField, HTMLField, NumberField, StringField, SchemaField } = foundry.data.fields;


export default class HazardData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const numberConfig = {required: true, nullable: false, integer: true, min: 0};
    const {details: combatantDetails, defences, ...combatantSchema} = CombatantTemplate.defineSchema();
    return {
      ...combatantSchema,
      movement: new SchemaField({
        ...SpeedTemplate.common,
        none: new BooleanField({initial: false})
      }),
      description: new HTMLField({initial: ""}),
      details: new SchemaField({
        ...DetailsField.combatant,
        detection: new StringField({initial: ""}),
        countermeasures: new StringField({initial: ""}),
        role: new SchemaField({
          primary: new StringField({initial: "trap"}),
          secondary: new StringField({initial: "standard"}),
          tertiary: new StringField({initial: "lurker"})
        }),
        size: new StringField({initial: "med"}),
        bloodied: new NumberField({initial: 0}),
        notes: new StringField({initial: ""})
      }),
      advancedCals: new BooleanField({initial: false}),
      attributes: new SchemaField({
        ...AttributesField.common,
        init: new Dnd4eBonusesField({
          value: new NumberField({initial: 0}),
          ability: new StringField({initial: ""}),
          bonus: new BonusField(),
          notes: new StringField({initial: ""}),
          base: new NumberField({initial: 0}),
          none: new BooleanField({initial: false})
        }),
        hp: new Dnd4eBonusesField({
          value: new NumberField({...numberConfig, initial: 10}),
          min: new NumberField({...numberConfig, initial: 0}),
          max: new NumberField({...numberConfig, initial: 10}),
          starting: new NumberField({...numberConfig, initial: 0}),
          perlevel: new NumberField({...numberConfig, initial: 0}),
          misc: new NumberField({...numberConfig, initial: 0}),
          autototal: new BooleanField({initial: false}),
          temprest: new BooleanField({initial: false}),
          none: new BooleanField({initial: false})
        })
      }),
      defences: new MappingField(new Dnd4eBonusesField({
        ...CombatantTemplate.defences,
        base: new NumberField({required: true, nullable: false, integer: true, min: 0, initial: 10}),
        none: new BooleanField({initial: false})
      }), {
        initialKeys: CONFIG.DND4E.defensives,
        initialKeysOnly: true,
        initialValue: CombatantTemplate._initialDefencesValue,
        label: "DND4E.Defences"
      })
    }
  }
}