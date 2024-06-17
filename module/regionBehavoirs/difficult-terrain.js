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

export class DifficultTerrainShader4e extends RegionShader {

	/** @override */
	static vertexShader = `
		precision ${PIXI.settings.PRECISION_VERTEX} float;

		attribute vec2 aVertexPosition;

		uniform mat3 translationMatrix;
		uniform mat3 projectionMatrix;
		uniform vec2 canvasDimensions;
		uniform vec4 sceneDimensions;
		uniform vec2 screenDimensions;

		varying vec2 vCanvasCoord; // normalized canvas coordinates
		varying vec2 vSceneCoord; // normalized scene coordinates
		varying vec2 vScreenCoord; // normalized screen coordinates

		void main() {
			vec2 pixelCoord = aVertexPosition;
			vCanvasCoord = pixelCoord / canvasDimensions;
			vSceneCoord = (pixelCoord - sceneDimensions.xy) / sceneDimensions.zw;
			vec3 tPos = translationMatrix * vec3(aVertexPosition, 1.0);
			vScreenCoord = tPos.xy / screenDimensions;
			gl_Position = vec4((projectionMatrix * tPos).xy, 0.0, 1.0);
		}
	`;

	/** @override */
	static fragmentShader = `
		precision ${PIXI.settings.PRECISION_FRAGMENT} float;

		uniform vec4 tintAlpha;
		uniform sampler2D uTexture;
		uniform vec2 canvasDimensions;
		uniform float canvasX;
		uniform float canvasY;
		uniform float canvasGrid;
		uniform float alphaOffset;

		uniform bool drawTerrianTint;

		varying vec2 vCanvasCoord; // normalized canvas coordinates


		void main() {
			vec2 textureCoord = fract(vCanvasCoord * vec2(canvasX, canvasY) / canvasGrid);
			

			vec4 textureColor = texture2D(uTexture, textureCoord);
			textureColor.a *= alphaOffset;
			
			if(drawTerrianTint){
				gl_FragColor = (textureColor + tintAlpha) / 2.0;
			} else {
				gl_FragColor = textureColor;
			}

		}
	`;

	/* ---------------------------------------- */

	/** @override */
	static defaultUniforms = {
		...super.defaultUniforms,
		canvasDimensions: [1, 1],
		canvasX: 1.0,
		canvasY: 1.0,
		alphaOffset: 1.0,
		drawTerrianTint: true,
		sceneDimensions: [0, 0, 1, 1],
		screenDimensions: [1, 1],
		tintAlpha: [1, 1, 1, 1],
		uTexture: PIXI.Texture.WHITE,
	};


	/** @override */
	_preRender(mesh, renderer) {
		super._preRender(mesh, renderer);
		const uniforms = this.uniforms;
		uniforms.tintAlpha = mesh._cachedTint;
		const dimensions = canvas.dimensions;
		uniforms.canvasDimensions[0] = dimensions.width;
		uniforms.canvasDimensions[1] = dimensions.height;
		uniforms.canvasX = canvas.dimensions.width,
		uniforms.canvasY = canvas.dimensions.height,
		uniforms.canvasGrid = canvas.grid.size,
		uniforms.sceneDimensions = dimensions.sceneRect;
		uniforms.screenDimensions = canvas.screenDimensions;

		uniforms.uTexture = PIXI.Texture.from(CONFIG.DND4E.difficultTerrain.img);
		uniforms.alphaOffset = CONFIG.DND4E.difficultTerrain.alpha;

	}
}
