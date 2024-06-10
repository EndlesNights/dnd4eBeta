export class Ruler4e extends Ruler {
	
	/** @inheritdoc */
	static _computeDistance(wrapper) {
		let path = [];
		if ( this.segments.length ) path.push(this.segments[0].ray.A);
		for ( const segment of this.segments ) {
			const {x, y} = segment.ray.B;
			path.push({x, y, teleport: segment.teleport});
		}
		const measurements = canvas.grid.measurePath(path, {cost: this._getCostFunction()}).segments;
		this.totalDistance = 0;
		this.totalCost = 0;

		for ( let i = 0; i < this.segments.length; i++ ) {
			const segment = this.segments[i];
			const distance = measurements[i].distance;
			const cost = segment.history ? this.history[i + 1].cost : measurements[i].cost;
			// this.totalDistance += distance;
			// this.totalCost += cost;
			// segment.distance = distance;
			// segment.cost = cost;
			// segment.cumulativeDistance = this.totalDistance;
			// segment.cumulativeCost = this.totalCost;

			let terrainCostCalc = Ruler4e._computeMoveCostSegment4e(segment);
			
			this.totalDistance += terrainCostCalc;
			this.totalCost += cost;
			segment.distance = terrainCostCalc;
			segment.cost = cost;
			segment.cumulativeDistance = this.totalDistance;
			segment.cumulativeCost = this.totalCost;

			
		}
	}

	static _computeMoveCostSegment4e(segment){
		// path array object j=xAxis i=yAxis for square grids
		const path = canvas.grid.getDirectPath([segment.ray.A, segment.ray.B]);
		path.shift(); // get the segment but ignore the first element, as that is where the token starts, or is already counted from the previous segment

		if(!path.length) return path.length;

		const gridSize = canvas.scene.grid.size;
		const gridOffset = canvas.scene.grid.size/2;

		let terrainCost = 0;
		for(const grid of path){
			let greatestMultiplier;

			for(const region of canvas.regions.documentCollection){
				// if(region.document.behaviors.filter((b) => b.type == "difficultTerrain"))
				if(!region.object.polygonTree.testPoint({x:grid.j*gridSize + gridOffset,y:grid.i*gridSize + gridOffset})) continue;
				region.behaviors.forEach(behavior => {
					console.log(behavior.system.terrainMultiplier >= (greatestMultiplier ?? 0))
					if (behavior.system.terrainMultiplier >= (greatestMultiplier ?? 0)) {
						greatestMultiplier = behavior.system.terrainMultiplier;
					}
				});		

			}
			if(greatestMultiplier === undefined){
				terrainCost++;
			} else {
				terrainCost += 1 * greatestMultiplier; 
			}
		}

		return terrainCost;
	}
}


// let greatestMultiplier = 0
// canvas.regions.get("0Q2bwQht2vS5U64L").document.behaviors.forEach(behavior => {
// 	// Check if the behavior type is "difficultTerrain"
// 	if (behavior.type === "difficultTerrain") {
// 		// Update the greatestMultiplier if the current behavior's terrainMultiplier is greater
// 		if (behavior.system.terrainMultiplier > greatestMultiplier) {
// 			greatestMultiplier = behavior.system.terrainMultiplier;
// 		}
// 	}
// });