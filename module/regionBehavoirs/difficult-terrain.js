export class  RegionBehavior4e extends RegionBehavior {

}

export class DifficultTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
		
	/** @override */
	static defineSchema() {
		return {
			// events: this._createEventsField(),
			terrainMultiplier: new foundry.data.fields.NumberField({
				// async: true, gmOnly: true,
				label: game.i18n.localize("DND4E.TerrainMultiplierLabel"),
				hint: game.i18n.localize("DND4E.TerrainMultiplierHint")
			}),
			terrianTexture : new foundry.data.fields.FilePathField({
				categories: ["IMAGE"],
				label: game.i18n.localize("DND4E.TerrainMultiplierLabel"),
				hint: game.i18n.localize("DND4E.TerrainMultiplierHint")
			})
		};
	}
}

export class Region4e extends foundry.canvas.placeables.Region {
	async _draw(options){
		await super._draw(options);
		this.hasDifficultTerrainBehavoir = this.document.behaviors.some(behavior => behavior.type === "difficultTerrain");
		this.drawTerrianTint = CONFIG.DND4E.difficultTerrain.drawTerrianTint; // set from the Terrian Sheet
		this.terrianTextureSRC = this.document.behaviors.find(behavior => behavior.system.terrianTexture)?.system.terrianTexture;		
	}
}

export class DifficultTerrainShader4e extends foundry.canvas.rendering.shaders.HighlightRegionShader {

	/** @override */
	static vertexShader = `
		precision ${PIXI.settings.PRECISION_VERTEX} float;

		attribute vec2 aVertexPosition;

		uniform mat3 translationMatrix;
		uniform mat3 projectionMatrix;
		uniform vec2 canvasDimensions;
		uniform vec4 sceneDimensions;
		uniform vec2 screenDimensions;
		uniform mediump float hatchThickness;

		varying vec2 vCanvasCoord; // normalized canvas coordinates
		varying vec2 vSceneCoord; // normalized scene coordinates
		varying vec2 vScreenCoord; // normalized screen coordinates
		varying float vHatchOffset;


		void main() {
			vec2 pixelCoord = aVertexPosition;
			vCanvasCoord = pixelCoord / canvasDimensions;
			vSceneCoord = (pixelCoord - sceneDimensions.xy) / sceneDimensions.zw;
			vec3 tPos = translationMatrix * vec3(aVertexPosition, 1.0);
			vScreenCoord = tPos.xy / screenDimensions;
			gl_Position = vec4((projectionMatrix * tPos).xy, 0.0, 1.0);
			vHatchOffset = (pixelCoord.x + pixelCoord.y) / (1.4142135623730951 * 2.0 * hatchThickness);
		}
	`;

	/** @override */
	static fragmentShader = `
		precision ${PIXI.settings.PRECISION_FRAGMENT} float;

		varying float vHatchOffset;

		uniform vec4 tintAlpha;
		uniform float resolution;
		uniform bool hatchEnabled;
		uniform mediump float hatchThickness;

		uniform sampler2D uTexture;
		uniform vec2 canvasDimensions;
		uniform float canvasX;
		uniform float canvasY;
		uniform float canvasGrid;
		uniform float alphaOffset;

		uniform bool drawTerrianTint;
		uniform bool hasDifficultTerrainBehavoir;


		varying vec2 vCanvasCoord; // normalized canvas coordinates


		void main() {

			if (!hasDifficultTerrainBehavoir){
				gl_FragColor = tintAlpha;
				if ( !hatchEnabled ) return;
				float x = abs(vHatchOffset - floor(vHatchOffset + 0.5)) * 2.0;
				float s = hatchThickness * resolution;
				float y0 = clamp((x + 0.5) * s + 0.5, 0.0, 1.0);
				float y1 = clamp((x - 0.5) * s + 0.5, 0.0, 1.0);
				gl_FragColor *= mix(0.3333, 1.0, y0 - y1);
				return;
			}

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
		hasDifficultTerrainBehavoir: false,
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
		uniforms.drawTerrianTint = mesh.region.drawTerrianTint,
		uniforms.hasDifficultTerrainBehavoir = mesh.region.hasDifficultTerrainBehavoir,

		uniforms.sceneDimensions = dimensions.sceneRect;
		uniforms.screenDimensions = canvas.screenDimensions;
		uniforms.uTexture = PIXI.Texture.from(mesh.region.terrianTextureSRC || CONFIG.DND4E.difficultTerrain.img);
		uniforms.alphaOffset = CONFIG.DND4E.difficultTerrain.alpha;
	}
}
