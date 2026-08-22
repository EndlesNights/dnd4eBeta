const { BooleanField, ColorField, NumberField } = foundry.data.fields;

export default class GridIconsTemplate extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			showGridIcons: new BooleanField({ initial: false }),
			gridIconTint: new ColorField({ nullable: false, initial: "#808080" }),
			gridIconAlpha: new NumberField({ initial: 0.9, min: 0.0, max: 1.0, step: 0.01 }),
		};
	}
}
