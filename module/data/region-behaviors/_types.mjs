/**
 * @typedef ApplyActiveEffectRegionBehaviorSystemData
 * @property {Set<string>} effects       UUIDs of effects to apply.
 * @property {Set<number>} dispositions  If not empty, only apply effects to tokens with these dispositions.
 * @property {Set<string>} origins       If not empty, only apply effects to tokens with these creature origins.
 * @property {Set<string>} types         If not empty, only apply effects to tokens with these creature types.
 */

/**
 * @typedef DamagingRegionRegionBehaviorSystemData
 * @property {String} damage             Damage to be dealt to tokens within the region.
 * @property {Set<string>} damageTypes   Damage types this region behavior should deal.
 * @property {Set<number>} dispositions  If not empty, only apply effects to tokens with these dispositions.
 * @property {Set<string>} origins       If not empty, only apply effects to tokens with these creature origins.
 * @property {Set<string>} types         If not empty, only apply effects to tokens with these creature types.
 */

/**
 * @typedef DifficultTerrainRegionBehaviorSystemData
 * @property {Set<string>} types                Types of difficult terrain represented.
 * @property {Set<number>} ignoredDispositions  Token dispositions that won't be affected by this difficult terrain.
 */

/**
 * @typedef ObscuredTerrainRegionBehaviorSystemData
 * @property {Number} level              Level of obscurement this region creates.
 * @property {Set<number>} dispositions  If not empty, only tokens with these dispositions are affected.
 * @property {Set<string>} origins       If not empty, only tokens with these creature origins are affected.
 * @property {Set<string>} types         If not empty, only tokens with these creature types are affected.
 */
