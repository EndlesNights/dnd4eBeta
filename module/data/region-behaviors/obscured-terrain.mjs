const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * @import { ObscuredTerrainRegionBehaviorSystemData } from "./_types.mjs";
 */

/**
 * The data model for a region behavior that represents an area of difficult terrain.
 * * @extends {foundry.data.regionBehaviors.RegionBehaviorType<ObscuredTerrainRegionBehaviorSystemData>}
 * @mixes ObscuredTerrainRegionBehaviorSystemData
 */
export default class ObscuredTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.ObscuredTerrain"];

	/* ---------------------------------------- */

	/** @inheritDoc */
	static defineSchema() {
		const dispositions = { ...foundry.applications.sheets.TokenConfig.TOKEN_DISPOSITIONS };
		delete dispositions[CONST.TOKEN_DISPOSITIONS.SECRET];
		return {
			level: new NumberField({ choices: CONFIG.DND4E.OBSCUREMENT_LABELS }),
			dispositions: new SetField(new NumberField({ choices: dispositions })),
			origins: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureOrigin })),
			types: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureType })),
		};
	}

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
		return true;
	}
}
