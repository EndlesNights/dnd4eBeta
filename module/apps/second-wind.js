
export default class SecondWindDialog extends Dialog {
  constructor(actor, dialogData = {}, options = {}) {
    super(dialogData, options);
    this.actor = actor;
  }

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/dnd4eAltus/templates/apps/second-wind.html",
      classes: ["dnd4eAltus", "dialog"]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
	  const data = super.getData();
	  return data;
		// console.log(this.object.data.data);
		// return {data: this.object.data.data}
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    let btn = html.find("#roll-hd");
    btn.click(this._onRollHitDie.bind(this));
    super.activateListeners(html);
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling a Hit Die as part of a Short Rest action
   * @param {Event} event     The triggering click event
   * @private
   */
  async _onRollHitDie(event) {
	  console.log("enter?");
    event.preventDefault();
    const btn = event.currentTarget;
    this._denom = btn.form.hd.value;
    await this.actor.rollHitDie(this._denom);
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * A helper constructor function which displays the Short Rest dialog and returns a Promise once it's workflow has
   * been resolved.
   * @param {Actor5e} actor
   * @return {Promise}
   */
  static async SecondWindDialog({actor}={}) {
    return new Promise((resolve, reject) => {
		
      const dlg = new this(actor, {
        title: "Second Wind",
        buttons: {
          secondwind: {
            icon: '<i class="fas fa-running"></i>',
            label: "Second Wind",
            callback: resolve => {
				console.log("second wind");
              // let newDay = false;
              // if (game.settings.get("dnd5e", "restVariant") === "gritty")
                // newDay = html.find('input[name="newDay"]')[0].checked;
              // resolve(newDay);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: reject => {
				console.log("cancel");
			}
          }
        },
        close: reject
      });
      dlg.render(true);
    });
  }

  /* -------------------------------------------- */

  /**
   * A helper constructor function which displays the Long Rest confirmation dialog and returns a Promise once it's
   * workflow has been resolved.
   * @deprecated
   * @param {Actor5e} actor
   * @return {Promise}
   */
  static async longRestDialog({actor}={}) {
    console.warn("WARNING! ShortRestDialog.longRestDialog has been deprecated, use LongRestDialog.longRestDialog instead.");
    return LongRestDialog.longRestDialog(...arguments);
  }
}