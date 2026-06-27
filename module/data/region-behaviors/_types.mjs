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
 * @property {boolean} magical                  This difficult terrain is caused by magic.
 * @property {Set<string>} types                Types of difficult terrain represented.
 * @property {Set<number>} ignoredDispositions  Token dispositions that won't be affected by this difficult terrain.
 */
