/**
 * A specialized Dialog subclass for ability usage
 * @type {foundry.applications.api.Dialog}
 */
export default class AbilityUseDialog extends foundry.applications.api.Dialog {
  constructor({item, ...options}) {
    super(options);

    /**
     * Store a reference to the Item entity being used
     * @type {Item4e}
     */
    this.item = item;
  }

  static DEFAULT_OPTIONS = {
    classes: ["dnd4e","dialog","default"]
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * A constructor function which displays the Spell Cast Dialog app for a given Actor and Item.
   * Returns a Promise which resolves to the dialog FormData once the workflow has been completed.
   * @param {Item4e} item
   * @return {Promise}
   */
  static async create(item) {
    if ( !item.isOwned ) throw new Error("You cannot display an ability usage dialog for an unowned item");

    // Prepare data
    const actorData = item.actor.system;
    const itemData = item.system;
    const uses = itemData.uses || {};
    const quantity = itemData.quantity || 0;
    const recharge = itemData.recharge || {};
    const recharges = !!recharge.value;

    // Prepare dialog form data
    const system = {
      item: item.system,
      title: game.i18n.format("DND4E.AbilityUseHint", item),
      note: this._getAbilityUseNote(item, uses, recharge),
      hasLimitedUses: itemData.preparedMaxUses || recharges,
      canUse: recharges ? recharge.charged : (quantity > 0 && !uses.value) || uses.value > 0,
      hasPlaceableTemplate: game.user.can("TEMPLATE_CREATE") && item.hasAreaTarget,
      errors: []
    };

    // Render the ability usage template
    const html = await foundry.applications.handlebars.renderTemplate("systems/dnd4e/templates/apps/ability-use.hbs", system);

    // Create the Dialog and return as a Promise
    const icon = "fa-fist-raised";
    const label = game.i18n.localize("DND4E.AbilityUseItem");
    return new Promise((resolve) => {
      const dlg = new this({
        item,
        window: {
          title: `${item.name}: Usage Configuration`,
		  resizable: true
        },
        content: html,
        buttons: [
          {
            action: "use",
            label,
            icon: `fa-solid ${icon}`,
            callback: (event, button, dialog) => resolve(new FormData(dialog.element.querySelector("form"))),
            default: true
          }
        ],
        close: () => resolve(null)
      });
      dlg.render(true);
    });
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Get the ability usage note that is displayed
   * @private
   */
  static _getAbilityUseNote(item, uses, recharge) {

    // Zero quantity
    const quantity = item.system.quantity;
    if ( quantity <= 0 ) return game.i18n.localize("DND4E.AbilityUseUnavailableHint");

    // Abilities which use Recharge
    if ( !!recharge.value ) {
      return game.i18n.format(recharge.charged ? "DND4E.AbilityUseChargedHint" : "DND4E.AbilityUseRechargeHint", {
        type: item.type,
      })
    }

    // Does not use any resource
    if ( !uses.per || !item.system.preparedMaxUses ) return "";

    // Consumables
    if ( item.type === "consumable" ) {
      let str = "DND4E.AbilityUseNormalHint";
      if ( uses.value >= 1 ) str = "DND4E.AbilityUseConsumableChargeHint";
      else if ( item.system.quantity === 1 && uses.autoDestroy ) str = "DND4E.AbilityUseConsumableDestroyHint";
      else if ( item.system.quantity > 1 ) str = "DND4E.AbilityUseConsumableQuantityHint";
      return game.i18n.format(str, {
        type: item.system.consumableType,
        value: uses.value,
        quantity: item.system.quantity,
        max: item.system.preparedMaxUses,
        per: CONFIG.DND4E.limitedUsePeriods[uses.per]
      });
    }

    // Other Items
    else {
      return game.i18n.format("DND4E.AbilityUseNormalHint", {
        type: item.type,
        value: uses.value,
        max: item.system.preparedMaxUses,
        per: CONFIG.DND4E.limitedUsePeriods[uses.per]
      });
    }
  }

  /* -------------------------------------------- */

  static _handleSubmit(formData, item) {

  }
}
