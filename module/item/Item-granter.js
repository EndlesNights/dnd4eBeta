export default class ItemGranter extends foundry.abstract.DataModel {

  /* -------------------------------------------- */

  /**
   * The item types that are supported in Item Grant.
   * @type {Set<string>}
   */
  static VALID_TYPES = new Set(["weapon", "equipment", "consumable", "tool", "loot", "classFeats", "feat", "backpack", "raceFeats", "pathFeats", "destinyFeats", "ritual", "power"]);
  
  /* -------------------------------------------- */

  /**
   * Verify that the provided item can be used with this advancement based on the configuration.
   * @param {Item4e} item                   Item that needs to be tested.
   * @param {object} config
   * @param {boolean} [config.strict=true]  Should an error be thrown when an invalid type is encountered?
   * @returns {boolean}                     Is this type valid?
   * @throws An error if the item is invalid and strict is `true`.
   */

  _validateItemType(item, { strict=true }={}) {
    if ( this.constructor.VALID_TYPES.has(item.type) ) return true;
    const type = game.i18n.localize(CONFIG.Item.typeLabels[item.type]);
    if ( strict ) throw new Error(game.i18n.format("DND4E.AdvancementItemTypeInvalidWarning", {type}));
    return false;
  }
}
