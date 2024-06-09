export class  RegionBehavior4e extends RegionBehavior {

}

export class DifficultTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
		
	/** @override */
	static defineSchema() {
		return {
			// events: this._createEventsField(),
			source: new foundry.data.fields.StringField({
				// async: true, gmOnly: true,
				label: "SomeCustom Value",
				hint: "Hint for Custom Value"
			})
		};
	}
}