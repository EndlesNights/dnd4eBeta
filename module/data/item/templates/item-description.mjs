import IdentifierField from "../../fields/identifier-field.mjs";
import SourceField from "../../fields/source-field.mjs";
const { NumberField, SchemaField, StringField } = foundry.data.fields;

export default class ItemDescriptionTemplate extends foundry.abstract.DataModel {
	/** @inheritdoc */
	static defineSchema() {
		return {
			description: new SchemaField({
				value: new StringField({ initial: "" }),
				chat: new StringField({ initial: "" }),
				unidentified: new StringField({ initial: "" }),
				gm: new StringField({ initial: "" }),
			}),
			descriptionGM: new SchemaField({
				value: new StringField({ initial: "" }),
			}),
			identifier: new IdentifierField({ required: true, label: "DND4E.Identifier" }),
			source: new SourceField(),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/**
	 * Convert source string into custom object.
	 * @param {Object} source  The candidate source data from which the model will be constructed.
	 */
	static migrateSource(source) {
		if (("source" in source) && (foundry.utils.getType(source.source) !== "Object")) {
			source.source = { custom: source.source };
		}
	}
}
