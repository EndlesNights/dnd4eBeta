/**
 * @typedef ApplyActiveEffectRegionBehaviorSystemData
 * @property {Set<string>} effects       UUIDs of effects to apply.
 * @property {Set<number>} dispositions  If not empty, only apply effects to tokens with these dispositions.
 * @property {Set<string>} origins       If not empty, only apply effects to tokens with these creature origins.
 * @property {Set<string>} types         If not empty, only apply effects to tokens with these creature types.
 * @property {boolean} excludeCreator    If set, don't apply effects to the actor that created the region.
 */

/**
 * @typedef DamagingRegionRegionBehaviorSystemData
 * @property {String} damage             Damage to be dealt to tokens within the region.
 * @property {Set<string>} damageTypes   Damage types this region behavior should deal.
 * @property {Set<number>} dispositions  If not empty, only deal damage to tokens with these dispositions.
 * @property {Set<string>} origins       If not empty, only deal damage to tokens with these creature origins.
 * @property {Set<string>} types         If not empty, only deal damage to tokens with these creature types.
 * @property {boolean} oncePerTurn       If set, only deal damage to a give token once per turn.
 * @property {boolean} onlyInCombat      If set, don't deal damage outside of combat.
 * @property {boolean} excludeCreator    If set, don't deal damage to the actor that created the region.
 * @property {boolean} showGridIcons     Whether to display grid icons for this damaging region.
 * @property {string} gridIconTint       Color to use for grid icons.
 * @property {number} gridIconAlpha      Transparency for grid icons.
 */

/**
 * @typedef DifficultTerrainRegionBehaviorSystemData
 * @property {Set<string>} types                Types of difficult terrain represented.
 * @property {Set<number>} ignoredDispositions  Token dispositions that won't be affected by this difficult terrain.
 * @property {boolean} excludeCreator           If set, don't affect the actor that created the region.
 * @property {boolean} showGridIcons            Whether to display grid icons for this difficult terrain.
 * @property {string} gridIconTint       Color to use for grid icons.
 * @property {number} gridIconAlpha      Transparency for grid icons.
 */

/**
 * @typedef ObscuredTerrainRegionBehaviorSystemData
 * @property {Number} level              Level of obscurement this region creates.
 * @property {Set<number>} dispositions  If not empty, only tokens with these dispositions are affected.
 * @property {Set<string>} origins       If not empty, only tokens with these creature origins are affected.
 * @property {Set<string>} types         If not empty, only tokens with these creature types are affected.
 * @property {boolean} excludeCreator    If set, the actor that created the region is not affected.
 * @property {boolean} showGridIcons     Whether to display grid icons for this obscured terrain.
 * @property {string} gridIconTint       Color to use for grid icons.
 * @property {number} gridIconAlpha      Transparency for grid icons.
 */
