const { ArrayField, BooleanField, SchemaField, StringField } = foundry.data.fields;

export default class ItemMacroTemplate extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			macros: new ArrayField(new SchemaField({
				type: new StringField({ initial: "script" }),
				scope: new StringField({ initial: "global" }),
				launchOrder: new StringField({ initial: "off" }),
				command: new StringField({ initial: "" }),
				author: new StringField({ initial: "" }),
				autoanimationHook: new StringField({ initial: "" }),
				enabled: new BooleanField({ initial: true }),
			}), { initial: [] }),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */
    
	/**
     * Convert single macro into macro array.
     * @param {Object} source  The candidate source data from which the model will be constructed.
     */
	static migrateMacro(source) {
		if ("macro" in source) {
			source.macros = [];
			source.macros.push(source.macro);
		}
	}
}
