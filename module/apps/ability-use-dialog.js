/**
 * A specialized Dialog subclass for ability usage
 * @type {Dialog}
 */
export default class AbilityUseDialog extends Dialog {
  constructor(item, dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["dnd4eBeta", "dialog"];

    /**
     * Store a reference to the Item entity being used
     * @type {Item4e}
     */
    this.item = item;
  }

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
    const actorData = item.actor.data.data;
    const itemData = item.data.data;
    const uses = itemData.uses || {};
    const quantity = itemData.quantity || 0;
    const recharge = itemData.recharge || {};
    const recharges = !!recharge.value;

    // Prepare dialog form data
    const data = {
      item: item.data,
      title: game.i18n.format("DND4EBETA.AbilityUseHint", item.data),
      note: this._getAbilityUseNote(item.data, uses, recharge),
      hasLimitedUses: itemData.preparedMaxUses || recharges,
      canUse: recharges ? recharge.charged : (quantity > 0 && !uses.value) || uses.value > 0,
      hasPlaceableTemplate: game.user.can("TEMPLATE_CREATE") && item.hasAreaTarget,
      errors: []
    };

    // Render the ability usage template
    const html = await renderTemplate("systems/dnd4e/templates/apps/ability-use.html", data);

    // Create the Dialog and return as a Promise
    const icon = "fa-fist-raised";
    const label = game.i18n.localize("DND4EBETA.AbilityUseItem");
    return new Promise((resolve) => {
      const dlg = new this(item, {
        title: `${item.name}: Usage Configuration`,
        content: html,
        buttons: {
          use: {
            icon: `<i class="fas ${icon}"></i>`,
            label: label,
            callback: html => resolve(new FormData(html[0].querySelector("form")))
          }
        },
        default: "use",
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
    const quantity = item.data.quantity;
    if ( quantity <= 0 ) return game.i18n.localize("DND4EBETA.AbilityUseUnavailableHint");

    // Abilities which use Recharge
    if ( !!recharge.value ) {
      return game.i18n.format(recharge.charged ? "DND4EBETA.AbilityUseChargedHint" : "DND4EBETA.AbilityUseRechargeHint", {
        type: item.type,
      })
    }

    // Does not use any resource
    if ( !uses.per || !item.data.preparedMaxUses ) return "";

    // Consumables
    if ( item.type === "consumable" ) {
      let str = "DND4EBETA.AbilityUseNormalHint";
      if ( uses.value >= 1 ) str = "DND4EBETA.AbilityUseConsumableChargeHint";
      else if ( item.data.quantity === 1 && uses.autoDestroy ) str = "DND4EBETA.AbilityUseConsumableDestroyHint";
      else if ( item.data.quantity > 1 ) str = "DND4EBETA.AbilityUseConsumableQuantityHint";
      return game.i18n.format(str, {
        type: item.data.consumableType,
        value: uses.value,
        quantity: item.data.quantity,
        max: item.data.preparedMaxUses,
        per: CONFIG.DND4EBETA.limitedUsePeriods[uses.per]
      });
    }

    // Other Items
    else {
      return game.i18n.format("DND4EBETA.AbilityUseNormalHint", {
        type: item.type,
        value: uses.value,
        max: item.data.preparedMaxUses,
        per: CONFIG.DND4EBETA.limitedUsePeriods[uses.per]
      });
    }
  }

  /* -------------------------------------------- */

  static _handleSubmit(formData, item) {

  }
}
