import BonusField from "../fields/bonus-field.js";

const { SetField, NumberField, SchemaField, StringField } = foundry.data.fields;

class MovementField extends SchemaField {
  constructor(_, {formulaString="@base + @armour", ...options}) {
    const numberConfig = {required: true, nullable: true, min: 0, step: 0.1, initial: 0};
    const fields = {
      value: new NumberField({...numberConfig}),
      formula: new StringField({required: true, initial: formulaString}),
      bonus: new BonusField(),
      feat: new NumberField({...numberConfig}),
      item: new NumberField({...numberConfig}),
      power: new NumberField({...numberConfig}),
      race: new NumberField({...numberConfig}),
      untyped: new NumberField({...numberConfig}),
      temp: new NumberField({...numberConfig})
    }
    super(fields, options);
  }
}

export default class SpeedTemplate extends foundry.abstract.DataModel {
  static get common() {
    const numberConfig = {required: true, nullable: true, min: 0, step: 0.1, initial: 0};
    return {
      base: new SchemaField({
        value: new NumberField({...numberConfig}),
        base: new NumberField({...numberConfig, initial: 6}),
        armour: new NumberField({...numberConfig}),
        bonus: new BonusField(),
        feat: new NumberField({...numberConfig}),
        item: new NumberField({...numberConfig}),
        power: new NumberField({...numberConfig}),
        race: new NumberField({...numberConfig}),
        untyped: new NumberField({...numberConfig}),
        temp: new NumberField({...numberConfig}),
      }, {label: "DND4E.MovementSpeedBase"}),
      walk: new MovementField({}, {label: "DND4E.MovementSpeedWalking"}),
      run: new MovementField({}, {formulaString: "2", label: "DND4E.MovementSpeedRunning"}),
      charge: new MovementField({}, {label: "DND4E.MovementSpeedCharging"}),
      shift: new MovementField({}, {formulaString: "1", label: "DND4E.MovementSpeedShifting"}),
      burrow: new MovementField({}, {formulaString: "", label: "DND4E.MovementSpeedBurrowing"}),
      climb: new MovementField({}, {formulaString: "", label: "DND4E.MovementSpeedClimbing"}),
      fly: new MovementField({}, {formulaString: "", label: "DND4E.MovementSpeedFlying"}),
      swim: new MovementField({}, {formulaString: "", label: "DND4E.MovementSpeedSwimming"}),
      teleport: new MovementField({}, {formulaString: "", label: "DND4E.MovementSpeedTeleporting"}),
      ignoredDifficultTerrain: new SetField(new StringField(), {label: "DND4E.IgnoredDifficultTerrain"}),
      notes: new StringField({initial: ""})
    };
  }
  static defineSchema() {
    return {
      movement: new SchemaField(this.common, {label: "DND4E.Movement"})
    }
  }
}