export class  RegionBehavior4e extends RegionBehavior {

}

export class DifficultTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
		
	/** @override */
	static defineSchema() {
		return {
			// events: this._createEventsField(),
			terrainMultiplier: new foundry.data.fields.NumberField({
				// async: true, gmOnly: true,
				label: "Terrain Cost",
				hint: "How many extra squares of movement cost. "
			})
		};
	}
}