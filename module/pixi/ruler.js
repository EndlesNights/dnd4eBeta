export class Ruler4e extends Ruler {
	

	/** @inheritdoc */
	_startMeasurement(...args){
		this.isDragMeasuring = true;
		return super._startMeasurement(...args);
	}

	/** @inheritdoc */
	_endMeasurement(...args){
		this.isDragMeasuring = false;
		return super._endMeasurement(...args);
	}

	/** @inheritdoc */
	_getCostFunction(){
		if (!this.isDragMeasuring || canvas.regions.placeables.length === 0) {
            return;
        }

		return (_from, to, distance) => {
            const token = canvas.controls.ruler.token;
            if (!token) return 0;

            const toPoint = canvas.grid.getTopLeftPoint(to);
            const difficultBehaviors = canvas.regions.placeables
                .filter(
                    (r) =>
                        r.document.behaviors.some(
                            (b) => !b.disabled && b.type === "difficultTerrain" && typeof b.system.terrainMultiplier === "number",
                        ) && token.testInsideRegion(r, toPoint),
                )
                .flatMap((r) =>
                    r.document.behaviors.filter(
                        (b) =>
                            !b.disabled && b.type === "difficultTerrain" && typeof b.system.terrainMultiplier === "number",
                    ),
                );
            return difficultBehaviors.length > 0
                ? difficultBehaviors.reduce((sum, b) => {
					if (typeof b.system.terrainMultiplier === "number") {
						return sum + b.system.terrainMultiplier;
					}
					return sum;
				}, 0)
                : distance;
        };
	}

	/** @inheritdoc */
	_getSegmentLabel(segment) {
		if (segment.teleport) return "";

		function getString(value) {
			return `${Math.round(value * 100) / 100}`
		}

		const actor = this.token?.actor;
		if(!actor) return super._getSegmentLabel(segment);
		
		const units = canvas.grid.units
		let label = !true
		  ? getString(segment.distance)
		  : segment.distance == segment.cost
		  ? getString(segment.distance)
		//   : `${getString(segment.cost)} / ${getString(segment.distance)}`
		  : `${getString(segment.cost)}`
		if (units) label += ` ${units}`
	
		if (segment.last) {
		  if (true && segment.cumulativeDistance != segment.cumulativeCost ) {
			label = "△ " + label //⚠
		  }
	
		  label += !true
			? ` [${getString(segment.cumulativeDistance)}`
			: segment.cumulativeDistance == segment.cumulativeCost
			? ` [${getString(segment.cumulativeDistance)}`
			// : ` [${getString(segment.cumulativeCost)} / ${getString(segment.cumulativeDistance)}`
			: ` [${getString(segment.cumulativeCost)}`
		  if (units) label += ` ${units}`
		  label += "]"	
		}
	
		return label
	}
}
