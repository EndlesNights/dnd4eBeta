/**
 * The detection mode for Hearing.
 */
export default class DetectionModeHearing extends foundry.canvas.perception.DetectionMode {
	constructor() {
		super({
			id: "hearing",
			label: "DND4E.SenseHearing",
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
		if (visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAFENED)) return false;
		if (target instanceof foundry.canvas.placeables.Token) {
			if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.SILENT)) return false;
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
				type: "sound",
				mode: "any",
				source: visionSource,
				useThreshold: true,
			},
		);
	}
}
