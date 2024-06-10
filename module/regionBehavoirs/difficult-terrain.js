export class  RegionBehavior4e extends RegionBehavior {

}

export class DifficultTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
		
	/** @override */
	static defineSchema() {
		return {
			// events: this._createEventsField(),
			terrainMultiplier: new foundry.data.fields.NumberField({
				// async: true, gmOnly: true,
				label: "Terrain Multiplier",
				hint: "Determins the number of square of movment it takes to move through each grid square of terrain."
			})
		};
	}
}