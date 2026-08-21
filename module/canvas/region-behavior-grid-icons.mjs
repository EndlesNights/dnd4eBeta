const CONTAINER_NAME = "region-behavior-grid-icons";
const ICON_SCALE = 0.2;
const ICON_PADDING = 0.05;
const ICON_ALPHA = 0.65;
const FONT_AWESOME_TINT = 0x808080;
const IMAGE_TINT = 0x808080;
const FONT_SIZE = 128;
const GLYPH_OVERSCAN = 0.25;
const TEXTURE_RESOLUTION = 2;

/** @import { GridIconData } from "./_types.mjs" */

/**
 * Decode a CSS content value into a Unicode character.
 * @param {string} content
 * @returns {string}
 */
function decodeCssContent(content) {
	const value = content
		.split("/")[0]
		.trim()
		.replace(/^["']|["']$/g, "");

	return value.replace(
		/\\([0-9a-f]{1,6})\s?/gi,
		(match, hex) => String.fromCodePoint(Number.parseInt(hex, 16)),
	);
}

/**
 * Create a reusable texture from a Font Awesome icon.
 * @param {string} iconClass
 * @returns {Promise<PIXI.RenderTexture|null>}
 */
async function createFontAwesomeTexture(iconClass) {
	const element = document.createElement("i");

	element.className = iconClass;
	element.style.position = "fixed";
	element.style.left = "-10000px";
	element.style.top = "-10000px";

	document.body.append(element);

	const elementStyle = getComputedStyle(element);
	const iconStyle = getComputedStyle(element, "::before");
	const pseudoContent = iconStyle.content;
	const useFallbackContent = (
		!pseudoContent
		|| ["none", "normal", "\"\"", "''"].includes(pseudoContent)
		|| pseudoContent.includes("var(")
	);
	const content = useFallbackContent
		? elementStyle.getPropertyValue("--fa")
		: pseudoContent;
	const character = decodeCssContent(content);
	const fontFamily = iconStyle.fontFamily;
	const fontStyle = iconStyle.fontStyle;
	const fontWeight = iconStyle.fontWeight;

	element.remove();

	if (!character || ["none", "normal"].includes(character)) return null;

	await document.fonts.load(
		`${fontStyle} ${fontWeight} ${FONT_SIZE}px ${fontFamily}`,
		character,
	);

	const text = new PIXI.Text(character, {
		fontFamily,
		fontStyle,
		fontWeight,
		fontSize: FONT_SIZE,
		fill: 0xffffff,
		padding: Math.ceil(FONT_SIZE * GLYPH_OVERSCAN),
		trim: true,
	});

	text.resolution = TEXTURE_RESOLUTION;
	text.updateText(true);

	const texture = canvas.app.renderer.generateTexture(text, {
		resolution: TEXTURE_RESOLUTION,
	});

	text.destroy({
		texture: true,
		baseTexture: true,
	});

	return texture;
}

/**
 * Normalize grid icon data supplied by a Region Behavior.
 * @param {object|null|undefined} data
 * @returns {GridIconData|null}
 */
function normalizeGridIconData(data) {
	if (!data || !["fontAwesome", "image"].includes(data.type)) return null;

	const source = String(data.source ?? "").trim();

	if (!source) return null;

	const tint = Number.isInteger(data.tint)
		? data.tint
		: data.type === "fontAwesome"
			? FONT_AWESOME_TINT
			: IMAGE_TINT;
	const key = String(data.key ?? `${data.type}:${source}:${tint}`).trim();

	if (!key) return null;

	return {
		key,
		type: data.type,
		source,
		tint,
		priority: Number.isFinite(data.priority) ? data.priority : 0,
		order: Number.isFinite(data.order) ? data.order : 0,
		textureKey: `${data.type}:${source}`,
	};
}

/**
 * Load a texture for a Region Behavior grid icon.
 * @param {GridIconData} iconData
 * @returns {Promise<{texture: PIXI.Texture, owned: boolean}|null>}
 */
async function loadIconTexture(iconData) {
	if (iconData.type === "fontAwesome") {
		const texture = await createFontAwesomeTexture(iconData.source);

		return texture ? { texture, owned: true } : null;
	}

	const texture = await foundry.canvas.loadTexture(iconData.source);

	return texture instanceof PIXI.Texture
		? { texture, owned: false }
		: null;
}

/**
 * Get grid spaces covered by a Region.
 * @param {Region} region
 * @returns {GridOffset2D[]}
 */
function getCoveredGridSpaceOffsets(region) {
	const polygonTree = region.animationState.polygonTree;
	const bounds = region.animationState.bounds
		.clone()
		.fit(canvas.dimensions.rect)
		.pad(1);
	const [i0, j0, i1, j1] = canvas.grid.getOffsetRange(bounds);
	const dx = canvas.grid.sizeX / 2;
	const dy = canvas.grid.sizeY / 2;
	const offsets = [];

	for (let i = i0; i < i1; i++) {
		for (let j = j0; j < j1; j++) {
			const offset = { i, j };
			const center = canvas.grid.getCenterPoint(offset);

			center.x = Math.round(center.x - dx) + dx;
			center.y = Math.round(center.y - dy) + dy;

			if (polygonTree.testPoint(center, 0.75)) offsets.push(offset);
		}
	}

	return offsets;
}

/**
 * Calculate a compact top-right icon layout for a grid cell.
 * @param {number} count
 * @returns {{rows: number, iconSize: number, gap: number, paddingX: number, paddingY: number}}
 */
function getCellIconLayout(count) {
	const width = canvas.grid.sizeX;
	const height = canvas.grid.sizeY;
	const minimumDimension = Math.min(width, height);
	const paddingX = width * ICON_PADDING;
	const paddingY = height * ICON_PADDING;
	const availableWidth = Math.max(1, width - (paddingX * 2));
	const availableHeight = Math.max(1, height - (paddingY * 2));
	const preferredSize = minimumDimension * ICON_SCALE;
	const preferredGap = minimumDimension * ICON_PADDING;
	const preferredColumns = Math.max(
		1,
		Math.floor((availableWidth + preferredGap) / (preferredSize + preferredGap)),
	);
	const preferredRows = Math.max(
		1,
		Math.floor((availableHeight + preferredGap) / (preferredSize + preferredGap)),
	);

	if (count <= preferredColumns * preferredRows) {
		return {
			rows: Math.min(count, preferredRows),
			iconSize: preferredSize,
			gap: preferredGap,
			paddingX,
			paddingY,
		};
	}

	const aspectRatio = availableWidth / availableHeight;
	const rows = Math.max(
		1,
		Math.min(count, Math.ceil(Math.sqrt(count / aspectRatio))),
	);
	const columns = Math.ceil(count / rows);
	const gap = Math.min(
		preferredGap,
		availableWidth / Math.max(columns * 4, 1),
		availableHeight / Math.max(rows * 4, 1),
	);
	const iconSize = Math.max(
		1,
		Math.min(
			preferredSize,
			(availableWidth - (gap * (columns - 1))) / columns,
			(availableHeight - (gap * (rows - 1))) / rows,
		),
	);

	return {
		rows,
		iconSize,
		gap,
		paddingX,
		paddingY,
	};
}

/**
 * Render Region Behavior grid icons for the active Scene.
 */
export default class RegionBehaviorGridIcons {
	static #container = null;

	static #textures = new Map();

	static #texturePromises = new Map();

	static #refreshQueued = false;

	static #refreshId = 0;

	static #generation = 0;

	/**
	 * Register canvas and Region document lifecycle hooks.
	 * @returns {void}
	 */
	static registerHooks() {
		Hooks.on("canvasReady", () => this.draw());
		Hooks.on("drawGridLayer", () => {
			if (canvas.ready) this.draw();
		});
		Hooks.on("tearDownGridLayer", () => this.destroy());
		Hooks.on("canvasTearDown", () => this.destroy());
		Hooks.on("createRegion", () => this.queueRefresh());
		Hooks.on("updateRegion", () => this.queueRefresh());
		Hooks.on("deleteRegion", () => this.queueRefresh());
		Hooks.on("createRegionBehavior", () => this.queueRefresh());
		Hooks.on("updateRegionBehavior", () => this.queueRefresh());
		Hooks.on("deleteRegionBehavior", () => this.queueRefresh());
	}

	/**
	 * Draw the grid icon container for the active Scene.
	 * @returns {void}
	 */
	static draw() {
		this.destroy();

		if (!canvas.ready || canvas.grid.isGridless) return;

		const rendered = canvas.rendered;

		if (!rendered?.visibility || (rendered.visibility.parent !== rendered)) return;

		const container = new PIXI.Container();

		container.name = CONTAINER_NAME;
		container.alpha = ICON_ALPHA;
		container.eventMode = "none";
		container.interactiveChildren = false;

		this.#container = container;

		rendered.addChildAt(container, rendered.getChildIndex(rendered.visibility));
		void this.refresh();
	}

	/**
	 * Queue one grid icon refresh.
	 * @returns {void}
	 */
	static queueRefresh() {
		if (!canvas.ready || this.#refreshQueued) return;

		this.#refreshQueued = true;

		requestAnimationFrame(() => {
			this.#refreshQueued = false;
			void this.refresh();
		});
	}

	/**
	 * Get or load a texture for a grid icon.
	 * @param {GridIconData} iconData
	 * @returns {Promise<{texture: PIXI.Texture, owned: boolean}|null>}
	 */
	static async #getTexture(iconData) {
		const cached = this.#textures.get(iconData.textureKey);

		if (cached) return cached;

		const pending = this.#texturePromises.get(iconData.textureKey);

		if (pending) return pending;

		const generation = this.#generation;
		const promise = loadIconTexture(iconData)
			.then(textureData => {
				if (!textureData) return null;

				if (generation !== this.#generation) {
					if (textureData.owned) textureData.texture.destroy(true);
					return null;
				}

				this.#textures.set(iconData.textureKey, textureData);
				return textureData;
			})
			.finally(() => {
				if (this.#texturePromises.get(iconData.textureKey) === promise) {
					this.#texturePromises.delete(iconData.textureKey);
				}
			});

		this.#texturePromises.set(iconData.textureKey, promise);
		return promise;
	}

	/**
	 * Rebuild the Region Behavior grid icon sprites.
	 * @returns {Promise<void>}
	 */
	static async refresh() {
		if (
			!canvas.ready
			|| !this.#container
			|| this.#container.destroyed
		) return;

		const container = this.#container;
		const scene = canvas.scene;
		const refreshId = ++this.#refreshId;
		const cells = new Map();

		for (const region of canvas.regions.placeables) {
			const relevantBehaviors = [];

			for (const behavior of region.document.behaviors) {
				if (!behavior.viewed) continue;

				const iconData = normalizeGridIconData(
					behavior.system.gridIconData,
				);

				if (!iconData) continue;

				relevantBehaviors.push({ behavior, iconData });
			}

			if (!relevantBehaviors.length) continue;

			const coveredGridSpaceOffsets = getCoveredGridSpaceOffsets(region);

			for (const offset of coveredGridSpaceOffsets) {
				const cellKey = `${offset.i},${offset.j}`;
				let cell = cells.get(cellKey);

				if (!cell) {
					cell = {
						offset,
						behaviors: new Map(),
					};

					cells.set(cellKey, cell);
				}

				for (const behaviorData of relevantBehaviors) {
					const behaviorKey = `${behaviorData.behavior.type}:${behaviorData.iconData.key}`;
					const current = cell.behaviors.get(behaviorKey);
					const replaceCurrent = (
						!current
						|| (behaviorData.iconData.priority > current.iconData.priority)
						|| (
							(behaviorData.iconData.priority === current.iconData.priority)
							&& (behaviorData.behavior.uuid.localeCompare(current.behavior.uuid) < 0)
						)
					);

					if (replaceCurrent) {
						cell.behaviors.set(behaviorKey, behaviorData);
					}
				}
			}
		}

		const requiredIcons = new Map();

		for (const cell of cells.values()) {
			for (const { iconData } of cell.behaviors.values()) {
				requiredIcons.set(iconData.textureKey, iconData);
			}
		}

		const textures = new Map();

		await Promise.all(Array.from(requiredIcons.values(), async iconData => {
			const textureData = await this.#getTexture(iconData);

			if (textureData) textures.set(iconData.textureKey, textureData);
		}));

		if (
			!canvas.ready
			|| (canvas.scene !== scene)
			|| (this.#container !== container)
			|| container.destroyed
			|| (refreshId !== this.#refreshId)
		) return;

		for (const sprite of container.removeChildren()) {
			sprite.destroy();
		}

		for (const { offset, behaviors } of cells.values()) {
			const icons = Array.from(behaviors.values())
				.filter(({ iconData }) => textures.has(iconData.textureKey))
				.sort((a, b) => (
					a.iconData.order - b.iconData.order
					|| a.behavior.type.localeCompare(b.behavior.type)
					|| b.iconData.priority - a.iconData.priority
					|| a.iconData.key.localeCompare(b.iconData.key)
					|| a.behavior.uuid.localeCompare(b.behavior.uuid)
				));

			if (!icons.length) continue;

			const topLeft = canvas.grid.getTopLeftPoint(offset);
			const layout = getCellIconLayout(icons.length);

			for (let index = 0; index < icons.length; index++) {
				const { iconData } = icons[index];
				const textureData = textures.get(iconData.textureKey);
				const row = index % layout.rows;
				const column = Math.floor(index / layout.rows);
				const spriteScale = (
					layout.iconSize
					/ Math.max(textureData.texture.width, textureData.texture.height, 1)
				);
				const sprite = new PIXI.Sprite(textureData.texture);

				sprite.anchor.set(1, 0);
				sprite.position.set(
					topLeft.x
						+ canvas.grid.sizeX
						- layout.paddingX
						- (column * (layout.iconSize + layout.gap)),
					topLeft.y
						+ layout.paddingY
						+ (row * (layout.iconSize + layout.gap)),
				);
				sprite.scale.set(spriteScale);
				sprite.tint = iconData.tint;

				container.addChild(sprite);
			}
		}
	}

	/**
	 * Destroy the grid icon canvas resources.
	 * @returns {void}
	 */
	static destroy() {
		this.#generation++;
		this.#refreshId++;

		if (this.#container && !this.#container.destroyed) {
			this.#container.parent?.removeChild(this.#container);
			this.#container.destroy({ children: true });
		}

		for (const { texture, owned } of this.#textures.values()) {
			if (owned) texture.destroy(true);
		}

		this.#textures.clear();
		this.#texturePromises.clear();
		this.#container = null;
		this.#refreshQueued = false;
	}
}
