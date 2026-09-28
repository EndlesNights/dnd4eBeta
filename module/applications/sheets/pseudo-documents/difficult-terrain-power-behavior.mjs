import PowerBehaviorSheet from "./power-behavior.mjs";

/**
 * Config sheet for the Difficult Terrain power behavior.
 */
export default class DifficultTerrainPowerBehaviorSheet extends PowerBehaviorSheet {
	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/** @inheritDoc */
	_getFields() {
		const fieldsets = super._getFields();
		for (const fieldset of fieldsets) {
			const typesField = fieldset.fields.find(f => f.field.name === "types")?.field;
			if (typesField) {
				typesField.element.choices = CONFIG.DND4E.difficultTerrainTypes;
				break;
			}
		}
		return fieldsets;
	}
}
