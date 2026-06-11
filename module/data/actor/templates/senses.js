import BonusField from "../fields/bonus-field.js";

const { BooleanField, SchemaField, StringField } = foundry.data.fields;

export default class SensesTemplate extends foundry.abstract.DataModel {
	static get common() {
		return {
			special: new SchemaField({
				aa: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.SpecialSensesAA" }),
				bs: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.SpecialSensesBS" }),
				bv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.VisionBlind" }),
				dv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.SpecialSensesDV" }),
				lv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.VisionLowLight" }),
				nv: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.VisionNormal" }),
				tr: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.SpecialSensesTR" }),
				ts: new SchemaField({
					value: new BooleanField({ initial: false }),
					range: new StringField({ initial: "" }),
				}, { label: "DND4E.SpecialSensesTS" }),
				custom: new StringField({ initial: "" }),
			}),
			notes: new StringField({ initial: "" }),
		};
	}
	static defineSchema() {
		return {
			senses: new SchemaField(this.common, { label: "DND4E.Senses" }),
		};
	}
}
