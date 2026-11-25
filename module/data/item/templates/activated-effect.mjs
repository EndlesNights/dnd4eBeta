import FormulaField from "../../fields/formula-field.mjs";

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class ActivatedEffectTemplate extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			activation: new SchemaField({
				type: new StringField({ initial: "" }),
				cost: new NumberField({ min: 0, initial: 0, integer: true }),
				condition: new StringField({ initial: "" }),
			}),
			duration: new SchemaField({
				value: new StringField({ nullable: true, initial: null }),
				units: new StringField({ initial: "" }),
			}),
			target: new SchemaField({
				value: new StringField({ nullable: true, initial: null }),
				width: new StringField({ nullable: true, initial: null }),
				units: new StringField({ initial: "" }),
				type: new StringField({ initial: "" }),
			}),
			range: new SchemaField({
				value: new FormulaField({ nullable: true, initial: null, deterministic: true }),
				long: new FormulaField({ nullable: true, initial: null, deterministic: true }),
				units: new StringField({ initial: "" }),
        origin: new StringField({ nullable: true, choices: CONFIG.DND4E.rangeOrigin, label: "DND4E.RANGE.Origin", initial: null }),
        form: new StringField({ nullable: true, choices: CONFIG.DND4E.rangeForm, label: "DND4E.RANGE.Form", initial: null }),
        area: new FormulaField({ nullable: true, initial: null, deterministic: true }),
				display: new StringField({ nullable: true, initial: null }),
				displayAbbr: new StringField({ nullable: true, initial: null }),
        useWeapon: new BooleanField({ initial: false, label: "DND4E.RANGE.Inherit" }),
			}),
			uses: new SchemaField({
				value: new NumberField({ min: 0, initial: 0, integer: true }),
				max: new FormulaField({ initial: "0", deterministic: true }),
				per: new StringField({ nullable: true, initial: null }),
			}),
			consume: new SchemaField({
				type: new StringField({ nullable: true, initial: null }),
				target: new StringField({ nullable: true, initial: null }),
				amount: new StringField({ nullable: true, initial: null }),
			}),
		};
	}
  
  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    if (!source.range.hasOwnProperty('origin')) {
      switch (source.rangeType) {
        case 'melee':
        case 'personal':
        case 'special':
          source.range.origin = source.rangeType;
          break;
        case 'weapon':
          source.range.form = 'weapon';
          if (source?.weaponType == 'ranged') {
            source.range.origin = 'ranged';
            source.useWeaponRange = true;
          } else if (source?.weaponType == 'melee') {
            source.range.origin = 'melee';
            source.useWeaponRange = true;
          } else if (source?.weaponType == 'meleeRanged') {
            source.range.origin = 'variable';
          } else {
            source.range.origin = 'special';
          }
          break;
        case 'touch':
          source.range.form = 'touch';
        case 'reach':
          source.range.origin = 'melee';
          break;
        case 'range':
          source.range.origin = 'ranged';
          break;
        case 'wall':
          source.range.origin = 'area';
          source.range.form = 'wall';
          break;
        case 'closeBurst':
        case 'closeBlast':
          source.range.origin = 'close';
          break;
        case 'rangeBurst':
        case 'rangeBlast':
          source.range.origin = 'area';
          break;
        default:
          source.range.origin = 'special';
          break;
      }
      if (['closeBurst','closeBlast','rangeBurst','rangeBlast','wall'].includes(source.rangeType)) source.range.area = source?.area || 0;
      if (['rangeBurst','rangeBlast','wall'].includes(source.rangeType))  source.range.value = source?.rangePower || 0;
      if (['closeBurst','rangeBurst'].includes(source.rangeType)) source.range.form = 'burst';
      if (['closeBlast','rangeBlast'].includes(source.rangeType)) source.range.form = 'blast';
      source.range.useWeapon = source.UseWeaponRange;
      return source;
    }
  }

}