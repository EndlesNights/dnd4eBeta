import BonusField from "./fields/bonus-field.js";
import Dnd4eBonusesField from "./fields/dnd4e-bonuses-field.js";
import MappingField from "./fields/mapping-field.js";
import AttributesField from "./templates/attributes.js";
import CombatantTemplate from "./templates/combatant.js";
import CreatureTemplate from "./templates/creature.js";
import DetailsField from "./templates/details.js";
import SpeedTemplate from "./templates/speed.js";
import WealthTemplate from "./templates/wealth.js";

const { BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;


export default class NPCData extends foundry.abstract.TypeDataModel {
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
        role: new SchemaField({
          primary: new StringField({initial: "brute"}),
          secondary: new StringField({initial: "standard"}),
          leader: new BooleanField({initial: false})
        })
      }),
      advancedCals: new BooleanField({initial: false}),
      attributes: new SchemaField({
        ...AttributesField.common,
        init: new Dnd4eBonusesField({
          value: new NumberField({initial: 0}),
          ability: new StringField({initial: ""}),
          bonus: new BonusField(),
          notes: new StringField({initial: ""}),
          base: new NumberField({initial: 0})
        })
      }),
      defences: new MappingField(new Dnd4eBonusesField({
        ...CombatantTemplate.defences,
        base: new NumberField({required: true, nullable: false, integer: true, min: 0, initial: 10})
      }), {
        initialKeys: CONFIG.DND4E.defensives,
        initialKeysOnly: true,
        initialValue: CombatantTemplate._initialDefencesValue,
        label: "DND4E.Defences"
      })
    }
  }
}