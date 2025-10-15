import BonusField from "./fields/bonus-field.js";
import Dnd4eBonusesField from "./fields/dnd4e-bonuses-field.js";
import MappingField from "./fields/mapping-field.js";
import SimpleTraitField from "./fields/simple-trait-field.js";
import AttributesField from "./templates/attributes.js";
import CombatantTemplate from "./templates/combatant.js";
import CreatureTemplate from "./templates/creature.js";
import DetailsField from "./templates/details.js";
import SpeedTemplate from "./templates/speed.js";
import WealthTemplate from "./templates/wealth.js";

const { BooleanField, NumberField, ObjectField, StringField, SchemaField } = foundry.data.fields;


export default class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const {details: creatureDetails, ...creatureSchema} = CreatureTemplate.defineSchema();
    const {details: combatantDetails, defences, ...combatantSchema} = CombatantTemplate.defineSchema();
    const wealthSchema = WealthTemplate.defineSchema();
    const speedSchema = SpeedTemplate.defineSchema();
    return {
      ...creatureSchema,
      ...combatantSchema,
      ...wealthSchema,
      ...speedSchema,
      details: new SchemaField({
        ...DetailsField.combatant,
        ...DetailsField.creature,
        class: new StringField({initial: ""}),
        paragon: new StringField({initial: ""}),
        epic: new StringField({initial: ""}),
        secondWind: new BooleanField({initial: false}),
        secondWindEffect: new ObjectField({initial: {}}),
        deathsaves: new NumberField({initial: 3}),
        deathsavefail: new NumberField({initial: 0}),
        deathsaveCrit: new NumberField({initial: 20}),
        deathsavebon: new Dnd4eBonusesField({
          value: new NumberField({initial: 0}),
          bonus: new BonusField(),
          custom: new StringField({initial: ""})
        }),
        secondwindbon: new Dnd4eBonusesField({
          value: new NumberField({initial: 0}),
          bonus: new BonusField(),
          custom: new StringField({initial: ""})
        }),
        weaponProf: new SimpleTraitField(),
        implementProf: new SimpleTraitField(),
        armourProf: new SimpleTraitField(),
      }),
      resources: new SchemaField({
        primary: new SchemaField({
          label: new StringField({initial: ""}),
          value: new StringField({initial: ""}),
          max: new StringField({initial: ""}),
          sr: new BooleanField({initial: false}),
          lr: new BooleanField({initial: false})
        }),
        secondary: new SchemaField({
          label: new StringField({initial: ""}),
          value: new StringField({initial: ""}),
          max: new StringField({initial: ""}),
          sr: new BooleanField({initial: false}),
          lr: new BooleanField({initial: false})
        }),
        tertiary: new SchemaField({
          label: new StringField({initial: ""}),
          value: new StringField({initial: ""}),
          max: new StringField({initial: ""}),
          sr: new BooleanField({initial: false}),
          lr: new BooleanField({initial: false})
        })
      }),
      attributes: new SchemaField(AttributesField.common),
      defences,
      magicItemUse: new SchemaField({
        perDay: new NumberField({min: 0, initial: 1, integer: true}),
        bonusValue: new NumberField({initial: 0, integer: true}),
        milestone: new NumberField({min: 0, initial: 0, integer: true}),
        dailyuse: new NumberField({min: 0, initial: 0, integer: true}),
        encounteruse: new BooleanField({initial: false})
      }),
      encumbrance: new SchemaField({
        value: new NumberField({required: true, nullable: true, initial: null}),
        max: new NumberField({required: true, nullable: true, initial: null}),
        formulaNorm: new StringField({initial: "@abilities.str.value * 10"}),
        formulaHeavy: new StringField({initial: "@abilities.str.value * 20"}),
        formulaMax: new StringField({initial: "@abilities.str.value * 50"}),
      })
    }
  }
}