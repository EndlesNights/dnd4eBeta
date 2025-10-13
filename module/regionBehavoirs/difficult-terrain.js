// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * The data model for a region behavior that represents an area of difficult terrain.
 */
export default class DifficultTerrainRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

  /** @override */
  static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.DifficultTerrain"];

  /* ---------------------------------------- */

  /** @override */
  static defineSchema() {
    const dispositions = { ...foundry.applications.sheets.TokenConfig.TOKEN_DISPOSITIONS };
    delete dispositions[CONST.TOKEN_DISPOSITIONS.SECRET];
    return {
      types: new SetField(new StringField()),
      ignoredDispositions: new SetField(new NumberField({ choices: dispositions }))
    };
  }

  /* ---------------------------------------- */

  /**
   * Called when the difficult terrain behavior is viewed.
   * @param {RegionBehaviorViewedEvent} event
   * @this {DifficultTerrainRegionBehaviorType}
   */
  static async #onBehaviorViewed(event) {
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /* ---------------------------------------- */

  /**
   * Called when the difficult terrain behavior is unviewed.
   * @param {RegionBehaviorUnviewedEvent} event
   * @this {DifficultTerrainRegionBehaviorType}
   */
  static async #onBehaviorUnviewed(event) {
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /* ---------------------------------------- */

  /**
   * Called when the boundary of an event has changed.
   * @param {RegionRegionBoundryEvent} event
   * @this {DifficultTerrainRegionBehaviorType}
   */
  static async #onRegionBoundary(event) {
    if ( !this.behavior.viewed ) return;
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /* ---------------------------------------- */

  /** @override */
  static events = {
    [CONST.REGION_EVENTS.BEHAVIOR_VIEWED]: this.#onBehaviorViewed,
    [CONST.REGION_EVENTS.BEHAVIOR_UNVIEWED]: this.#onBehaviorUnviewed,
    [CONST.REGION_EVENTS.REGION_BOUNDARY]: this.#onRegionBoundary
  };

  /* ---------------------------------------- */

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if ( ("system" in changed) && !this.behavior.viewed ) return;
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /* ---------------------------------------- */

  /** @override */
  _getTerrainEffects(token, segment) {
    const ignoredTypes = new Set(token.actor?.system.movement?.ignoredDifficultTerrain);
    if ( this.ignoredDispositions.has(token.disposition) || ignoredTypes.has("all")
      || (this.types.size && !this.types.difference(ignoredTypes).size) ) return [];
    return [{ name: "difficultTerrain" }];
  }
}