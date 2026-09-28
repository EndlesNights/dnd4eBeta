/**
 * The detection mode for the ephemeral everything non-sight non-hearing.
 */
export default class DetectionModeAwareness extends foundry.canvas.perception.DetectionMode {
	constructor() {
		super({
			id: "awareness",
			label: "DND4E.SenseAwareness",
			type: foundry.canvas?.perception?.DetectionMode.DETECTION_TYPES.OTHER,
			walls: true,
			angle: false,
		});
	}

	/* -------------------------------------------- */

	/** @override */
	static getDetectionFilter() {
		return this._detectionFilter ??= OutlineOverlayFilter.create({
			outlineColor: [1, 1, 1, 1],
			knockout: true,
			wave: true,
		});
	}

	/* -------------------------------------------- */

	/** @override */
	_canDetect(visionSource, target) {
		if (target instanceof foundry.canvas.placeables.Token) {
			if (target.document.hasStatusEffect("hidden")) return false;
		}
		return true;
	}

	/* -------------------------------------------- */

	/** @override */
	_testLOS(visionSource, mode, target, test) {
		return !CONFIG.Canvas.polygonBackends.sight.testCollision(
			{ x: visionSource.x, y: visionSource.y },
			test.point,
			{
				type: "movement",
				mode: "any",
				source: visionSource,
			},
		);
	}
}
