// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license
import RegionBehaviorGridIcons from "../../canvas/region-behavior-grid-icons.mjs";

const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * @import { DifficultTerrainRegionBehaviorSystemData } from "./_types.mjs";
 * @import { GridIconData } from "../../canvas/_types.mjs";
 */

/** @type { GridIconData } */
const GRID_ICON = {
	key: "default",
	type: "image",
	source: "systems/dnd4e/icons/ui/difficultTerrain.svg",
	tint: 0x808080,
	order: 0,
};

/**
 * The data model for a region behavior that represents an area of difficult terrain.
 * @extends {foundry.data.regionBehaviors.RegionBehaviorType<DifficultTerrainRegionBehaviorSystemData>}
 * @mixes DifficultTerrainRegionBehaviorSystemData
 */
export default class DifficultTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.DifficultTerrain"];

	/* ---------------------------------------- */

	/** @inheritDoc */
	static defineSchema() {
		const dispositions = { ...foundry.applications.sheets.TokenConfig.TOKEN_DISPOSITIONS };
		delete dispositions[CONST.TOKEN_DISPOSITIONS.SECRET];
		return {
			types: new SetField(new StringField()),
			ignoredDispositions: new SetField(new NumberField({ choices: dispositions })),
			excludeCreator: new BooleanField(),
			showGridIcons: new BooleanField({ initial: false }),
		};
	}

	/* ---------------------------------------- */

	/**
	 * Get the difficult terrain grid icon configuration.
	 * @returns {GridIconData|null}
	 */
	get gridIconData() {
		if (!this.showGridIcons) return null;
		return GRID_ICON;
	}

	/* ---------------------------------------- */

	/**
	 * Called when the difficult terrain behavior is viewed.
	 * @this {DifficultTerrainRegionBehaviorType}
	 * @param {RegionBehaviorViewedEvent} event
	 */
	static async #onBehaviorViewed(event) {
		canvas.tokens.recalculatePlannedMovementPaths();
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/**
	 * Called when the difficult terrain behavior is unviewed.
	 * @this {DifficultTerrainRegionBehaviorType}
	 * @param {RegionBehaviorUnviewedEvent} event
	 */
	static async #onBehaviorUnviewed(event) {
		canvas.tokens.recalculatePlannedMovementPaths();
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/**
	 * Called when the boundary of a Region has changed.
	 * @this {DifficultTerrainRegionBehaviorType}
	 * @param {RegionRegionBoundaryEvent} event
	 */
	static async #onRegionBoundary(event) {
		if (!this.behavior.viewed) return;
		canvas.tokens.recalculatePlannedMovementPaths();
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	static events = {
		[CONST.REGION_EVENTS.BEHAVIOR_VIEWED]: this.#onBehaviorViewed,
		[CONST.REGION_EVENTS.BEHAVIOR_UNVIEWED]: this.#onBehaviorUnviewed,
		[CONST.REGION_EVENTS.REGION_BOUNDARY]: this.#onRegionBoundary,
	};

	/* ---------------------------------------- */

	/** @inheritDoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	_onUpdate(changed, options, userId) {
		super._onUpdate(changed, options, userId);
		RegionBehaviorGridIcons.queueRefresh();

		if (("system" in changed) && !this.behavior.viewed) return;

		canvas.tokens.recalculatePlannedMovementPaths();
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	_getTerrainEffects(token, segment) {
		const ignoredTypes = token.actor?.system.movement?.ignoredDifficultTerrain;
		if ((segment.action === "blink")
			|| this.ignoredDispositions.has(token.disposition)
			|| ignoredTypes.has("all")
			|| (this.types.size && !this.types.difference(ignoredTypes).size)
			|| (this.excludeCreator && (this.parent.parent.flags?.dnd4e?.actorUuid === token.actor.uuid))) return [];
		return [{ name: "difficultTerrain" }];
	}
}
