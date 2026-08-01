import SimpleTraitField from "../fields/simple-trait-field.mjs";
import DetailsField from "./details.mjs";
import SensesTemplate from "./senses.mjs";

const { HTMLField, SchemaField } = foundry.data.fields;

export default class CreatureTemplate extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		const sensesSchema = SensesTemplate.defineSchema();
		return {
			biography: new HTMLField({ initial: "" }, { label: "DND4E.Biography" }),
			details: new SchemaField(DetailsField.creature, { label: "DND4E.Details" }),
			languages: new SchemaField({
				spoken: new SimpleTraitField({}, { label: "DND4E.Spoken" }),
				script: new SimpleTraitField({}, { label: "DND4E.Script" }),
			}, { label: "DND4E.Languages" }),
			...sensesSchema,
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
		SensesTemplate.migrateSenses(source);
	}
}
