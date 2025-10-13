// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

/**
 * Config sheet for the Difficult Terrain region behavior.
 */
export default class DifficultTerrainConfig extends foundry.applications.sheets.RegionBehaviorConfig {
  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _getFields() {
    const fieldsets = super._getFields();
    for ( const fieldset of fieldsets ) {
      const typesField = fieldset.fields.find(f => f.field.name === "types")?.field;
      if ( typesField ) {
        typesField.element.choices = CONFIG.DND4E.difficultTerrainTypes;
        break;
      }
    }
    return fieldsets;
  }
}