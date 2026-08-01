const { BooleanField, SchemaField, NumberField, StringField } = foundry.data.fields;

export default class SensesTemplate extends foundry.abstract.DataModel {
	/** Getter for sense data. */
	static get common() {
		return {
			special: new SchemaField({
				aa: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.SpecialSensesAA" }),
				bs: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.SpecialSensesBS" }),
				bv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.VisionBlind" }),
				dv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.SpecialSensesDV" }),
				lv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.VisionLowLight" }),
				nv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.VisionNormal" }),
				tr: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.SpecialSensesTR" }),
				ts: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new NumberField({ required: true, nullable: true, initial: null }),
				}, { label: "DND4E.SpecialSensesTS" }),
				custom: new StringField({ initial: "" }),
			}),
			notes: new StringField({ initial: "" }),
		};
	}

	/** @inheritDoc */
	static defineSchema() {
		return {
			senses: new SchemaField(this.common, { label: "DND4E.Senses" }),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/**
     * Convert single macro into macro array.
     * @param {Object} source  The candidate source data from which the model will be constructed.
     */
	static migrateSenses(source) {
		if (source.senses?.special?.value) {
			const oldSenses = Array.from(source.senses?.special?.value);
			delete source.senses?.special?.value;
			if (oldSenses.length) {
				for (const sense of oldSenses) {
					source.senses.special[`${sense[0]}`] = { value: true, range: sense[1] };
				}
			}
		}
	}
}
