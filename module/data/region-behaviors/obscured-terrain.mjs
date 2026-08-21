import RegionBehaviorGridIcons from "../../canvas/region-behavior-grid-icons.mjs";

const { BooleanField, ColorField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * @import { ObscuredTerrainRegionBehaviorSystemData } from "./_types.mjs";
 * @import { GridIconData } from "../../canvas/_types.mjs";
 */

/**
 * The data model for a region behavior that represents an area of obscured terrain.
 * @extends {foundry.data.regionBehaviors.RegionBehaviorType<ObscuredTerrainRegionBehaviorSystemData>}
 * @mixes ObscuredTerrainRegionBehaviorSystemData
 */
export default class ObscuredTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.ObscuredTerrain"];

	/* ---------------------------------------- */

	/** @inheritDoc */
	static defineSchema() {
		const OBSCUREMENT_LABELS = {
			[CONFIG.DND4E.OBSCUREMENT.NONE]: "DND4E.None",
			[CONFIG.DND4E.OBSCUREMENT.LIGHT]: "EFFECT.statusObscuredLight",
			[CONFIG.DND4E.OBSCUREMENT.HEAVY]: "EFFECT.statusObscuredHeavy",
			[CONFIG.DND4E.OBSCUREMENT.TOTAL]: "EFFECT.statusObscuredTotal",
		};
		const dispositions = { ...foundry.applications.sheets.TokenConfig.TOKEN_DISPOSITIONS };
		delete dispositions[CONST.TOKEN_DISPOSITIONS.SECRET];
		return {
			level: new NumberField({ choices: OBSCUREMENT_LABELS }),
			dispositions: new SetField(new NumberField({ choices: dispositions })),
			origins: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureOrigin })),
			types: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureType })),
			excludeCreator: new BooleanField(),
			showGridIcons: new BooleanField({ initial: false }),
			gridIconTint: new ColorField({ nullable: false, initial: "#808080" }),
		};
	}

	/* ---------------------------------------- */

	/**
	 * Get the grid icon configuration for this obscurement level.
	 * @returns {GridIconData|null}
	 */
	get gridIconData() {
		if (!this.showGridIcons) return null;

		let source;

		switch (this.level) {
			case CONFIG.DND4E.OBSCUREMENT.LIGHT:
				source = "fa-regular fa-circle";
				break;
			case CONFIG.DND4E.OBSCUREMENT.HEAVY:
				source = "fa-solid fa-circle-half-stroke";
				break;
			case CONFIG.DND4E.OBSCUREMENT.TOTAL:
				source = "fa-solid fa-circle";
				break;
			default:
				return null;
		}

		return {
			key: "obscurement",
			type: "fontAwesome",
			source,
			tint: Number(this.gridIconTint),
			priority: this.level,
			order: 10,
		};
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	_preUpdate(changes, options, userId) {
		if (changes.system?.gridIconTint === null) {
			changes.system.gridIconTint = this.schema.fields.gridIconTint.initial;
		}
	}

	/* ---------------------------------------- */

	/**
	 * Called when the obscured terrain behavior is viewed.
	 * @this {ObscuredTerrainRegionBehaviorType}
	 * @param {RegionBehaviorViewedEvent} event
	 */
	static async #onBehaviorViewed(event) {
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/**
	 * Called when the obscured terrain behavior is unviewed.
	 * @this {ObscuredTerrainRegionBehaviorType}
	 * @param {RegionBehaviorUnviewedEvent} event
	 */
	static async #onBehaviorUnviewed(event) {
		RegionBehaviorGridIcons.queueRefresh();
	}

	/* ---------------------------------------- */

	/**
	 * Called when the Region boundary changes.
	 * @this {ObscuredTerrainRegionBehaviorType}
	 * @param {RegionRegionBoundaryEvent} event
	 */
	static async #onRegionBoundary(event) {
		if (!this.behavior.viewed) return;
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

	/**
	 * Check the conditions to decide if this token should be affected by the obscured terrain.
	 * @param {TokenDocument4e} token  The token to check.
	 * @returns {boolean}
	 */
	evaluateConditions(token) {
		if (this.dispositions.size && !this.dispositions.has(token.disposition)) return false;
		if (this.origins.size && !this.origins.has(token.actor.system.details?.origin)) return false;
		if (this.types.size && !this.types.has(token.actor.system.details?.type)) return false;
		if (this.excludeCreator && (this.parent.parent.flags?.dnd4e?.actorUuid === token.actor.uuid)) return false;
		return true;
	}
}
