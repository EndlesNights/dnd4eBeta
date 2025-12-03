/**
 * Override measurePath to support custom diagonal movement rules for D&D 4e
 * @override
 */
export const measurePath = function(points, options={}) {
  // If no custom diagonal rule, use default implementation
  const rule = this.parent?.diagonalRule;
  if (!rule || rule === "555") {
    return foundry.grid.BaseGrid.prototype.measurePath.call(this, points, options);
  }

  // Calculate distance using custom rules
  const d = canvas.dimensions;
  let totalDistance = 0;
  let nDiagonal = 0;

  // Iterate over point pairs
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Determine the total distance traveled
    let nx = Math.abs(Math.ceil((p2.x - p1.x) / d.size));
    let ny = Math.abs(Math.ceil((p2.y - p1.y) / d.size));

    // Determine the number of straight and diagonal moves
    let nd = Math.min(nx, ny);
    let ns = Math.abs(ny - nx);
    nDiagonal += nd;

    let segmentDistance;

    // Alternative DMG Movement
    if (rule === "5105") {
      let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
      let spaces = (nd10 * 2) + (nd - nd10) + ns;
      segmentDistance = spaces * canvas.dimensions.distance;
    }
    // Euclidean Measurement
    else if (rule === "EUCL") {
      segmentDistance = Math.round(Math.hypot(nx, ny) * canvas.scene.grid.distance);
    }
    // Standard PHB Movement (shouldn't reach here due to early return, but kept for safety)
    else {
      segmentDistance = (ns + nd) * canvas.scene.grid.distance;
    }

    totalDistance += segmentDistance;
  }

  return {
    distance: totalDistance,
    segments: points.length - 1
  };
};

/* -------------------------------------------- */

/**
 * Hijack Token health bar rendering to include temporary and temp-max health in the bar display
 * TODO: This should probably be replaced with a formal Token class extension
 */
const _TokenGetBarAttribute = Token.prototype.getBarAttribute;
export const getBarAttribute = function(...args) {
  const data = _TokenGetBarAttribute.bind(this)(...args);
  if ( data && (data.attribute === "attributes.hp") ) {
    data.value += parseInt(foundry.utils.getProperty(this.actor.system, "attributes.hp.temp") || 0);
    data.max += parseInt(foundry.utils.getProperty(this.actor.system, "attributes.hp.tempmax") || 0);
  }
  return data;
};
