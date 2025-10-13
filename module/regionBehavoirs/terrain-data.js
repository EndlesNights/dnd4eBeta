// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

const { BooleanField } = foundry.data.fields;

/**
 * Extension of terrain data with support for 4e concepts.
 */
export default class TerrainData4e extends foundry.data.TerrainData {

  /** @inheritDoc */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      difficultTerrain: new BooleanField()
    };
  }

  /* -------------------------------------------- */

  /** @override */
  static resolveTerrainEffects(effects) {
    let data = super.resolveTerrainEffects(effects);
    if ( !effects.some(e => e.name === "difficultTerrain") ) return data;
    if ( !data ) return new this({ difficulty: 2, difficultTerrain: true });

    let difficulty = data.difficulty + 1;
    if ( !Number.isFinite(difficulty) ) difficulty = null;
    data.updateSource({ difficulty, difficultTerrain: true });
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  equals(other) {
    if ( !(other instanceof TerrainData4e) ) return false;
    return (this.difficulty === other.difficulty)
      && (this.difficultTerrain === other.difficultTerrain);
  }
}