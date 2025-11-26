export default class RollDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dnd4e","standard-form","default","roll-dialogue"],
    tag: "form",
    position: {
      width: 500
    },
    window: {
      resizable: true
    },
    form: {
      handler: RollDialog.onSubmit
    },
    actions: {
      minus: RollDialog.#onMinus,
      plus: RollDialog.#onPlus,
      toggleMultiBonus: RollDialog.#toggleMultiBonus,
      next: RollDialog.#nextPrev,
      prev: RollDialog.#nextPrev,
    }
  };

  static PARTS = {
    dialog: { template: "systems/dnd4e/templates/chat/roll-dialog.hbs" },
    footer: { template: "templates/generic/form-footer.hbs"}
  };

  #callback;
  #isResolved = false;

  currentTab = 0;
  multiTargetToggle = 1;
  multiTargetToggleString = game.i18n.localize("DND4E.RollMultiSharedChange");
  multiTargetToggleIcon = "<i class=\"fa-solid fa-users-rays\"></i>";

  constructor({dialogData, rollConfig, callbackFn, buttons, resolve, ...args}) {
    super({dialogData, rollConfig, callbackFn, buttons, ...args});

    this.dialogData = dialogData;
    this.rollConfig = rollConfig;
    this.callbackFn = callbackFn;
    this.buttons = buttons;
    this.#callback = resolve;

  }

  static asPromise({dialogData, rollConfig, callbackFn, buttons, ...args}) {
    return new Promise((resolve) => new RollDialog({dialogData, rollConfig, callbackFn, buttons, resolve, ...args}).render({ force: true }));
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    foundry.utils.mergeObject(context, {
      rollModes: CONFIG.Dice.rollModes,
      config: CONFIG.DND4E,
      buttons: this.buttons,
      ...this.dialogData
    });
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#showTab(this.currentTab);
  }

  _onClose(options) {
    super._onClose(options);
    if (!this.#isResolved) this.#callback(false);
  }

  #resolve(result) {
    this.#isResolved = true;
    this.#callback(result);
    this.close();
  }

  /**
   * @this {RollDialog}
   */
  static async onSubmit(event, form, formData) {
    const buttonAction = event.submitter?.dataset?.action ?? 'normal';
    this.rollConfig.hitType = buttonAction;
    const result = await this.callbackFn(form, this.rollConfig);
    this.#resolve(result);
  }

  static #onMinus(event, target) {
    const input = this.element.querySelector("#d20");
    const currentValue = Number(input.value) ?? 0;
    if (event.ctrlKey) input.value = currentValue - 2;
    else input.value = currentValue - 1;
  }

  static #onPlus(event, target) {
    const input = this.element.querySelector("#d20");
    const currentValue = Number(input.value) ?? 0;
    if (event.ctrlKey) input.value =  currentValue + 2;
    else input.value = currentValue + 1;
  }

  /**
   * Function to toggle the state of the attack bonus tabs between Shared and 
   * Per-target attack bonuses based on the current value of the toggle button.
   *
   * Each option will update the button value, then update the toggle value, 
   * then update the button text. 
   *
   * The condition for toggling from true to false then sets the current tab index
   * to 0 to show only the first tab.
   * 
   * Both conditions then call the showTab function to update the currently
   * displayed tab.
   * @this {RollDialog}
   */
  static #toggleMultiBonus(event, target) {
    if (this.element.querySelector("#multibonus-toggle").value == "false"){
      this.element.querySelector("#multibonus-toggle").value = "true";
      this.multiTargetToggle = 1;
      this.multiTargetToggleString = game.i18n.localize("DND4E.RollMultiSharedChange");
      this.multiTargetToggleIcon = '<i class="fa-solid fa-users-rays"></i>';
      this.#showTab(this.currentTab);
    } else if (this.element.querySelector("#multibonus-toggle").value == "true") {
      this.element.querySelector("#multibonus-toggle").value = "false";
      this.multiTargetToggle = 0;
      this.multiTargetToggleString = game.i18n.localize("DND4E.RollMultiIndividualChange");
      this.multiTargetToggleIcon = '<i class="fa-solid fa-person-rays"></i>';
      this.currentTab = 0;
      this.#showTab(this.currentTab);
      const targetData = this.dialogData.targetData;
      //Checks if multi target attack that is universal, and display an alternative target dialog with every target's name in it.
      if (targetData.targNameArray){
        this.element.querySelector("#targetNameDisplay").innerHTML = `All Targets (${targetData.targNameArray})`;
      }
    }
  }

  /**
   * @this {RollDialog} 
   */
  static #nextPrev(event, target) {
    const toAdd = target.dataset.action === "next" ? 1 : -1;
    const x = this.element.querySelectorAll(".multitarget-tab");
    x[this.currentTab].style.display = "none";
    this.currentTab += toAdd;
    this.#showTab(this.currentTab);
  }

  #showTab(n) {
    let x = this.element.querySelectorAll(".multitarget-tab");
    let numTargets = x.length;
    if (this.element.querySelector("#multibonus-toggle")) {
      if (numTargets <= 1) {
        this.multiTargetToggleString = ""
        this.element.querySelector("#multibonus-toggle").disabled = true;
      }

      this.element.querySelector("#multibonus-toggle").innerHTML = this.multiTargetToggleIcon;
      this.element.querySelector("#multibonus-toggle").setAttribute("data-tooltip",this.multiTargetToggleString);
      this.element.querySelector("#targetNameDisplay").innerHTML = this.element.querySelector("#targetName-"+[n]).innerHTML;

      for(let item of x){
        item.style.display = "none";
      }

      x[n].style.display = "block";
      if (n <= 0){
        this.element.querySelector("#prevBtn").disabled = true;
      } else {
        this.element.querySelector("#prevBtn").disabled = false;
      }
      if (n >= x.length - 1 || this.multiTargetToggle == 0 || numTargets <= 1){
        this.element.querySelector("#nextBtn").disabled = true;
      } else {
        this.element.querySelector("#nextBtn").disabled = false;
      }
    }
  }
}