import {Helper} from "../helper.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export class HealMenuDialog extends DocumentSheet4e {

	/** @override */
	static DEFAULT_OPTIONS = {
		id: "heal-menu-dialog",
		classes: ["dnd4e", "standard-form"],
		form: {
			closeOnSubmit: true,
			submitOnClose: false,
			handler: HealMenuDialog.#onSubmit
		},
		actions: {
			spendSurgesChecked: HealMenuDialog._setButtonEnabledState,
			healButtonClicked: HealMenuDialog._onHealButtonClicked,
			tempHPButtonClicked: HealMenuDialog._onTempHPButtonClicked,
			healingPotionSettingsClicked: HealMenuDialog._onHealingPotionSettingsClicked
		},
		position: {
			width: 500,
			height: "auto",
		},
        tag: "form",
		window : {
			title: "Healing Menu"
		}
	}

	get title() {
		return `${this.document.name} - ${game.i18n.localize( 'DND4E.Healing')}`;
	}

	static PARTS = {
		HealMenuDialog: {
			template: "systems/dnd4e/templates/apps/heal-menu-dialog.hbs"
		}
	}


	/** @override */
	_prepareContext(options) {
		const hpMax = this.document.system.attributes.hp.value === this.document.system.attributes.hp.max
		const surgeValue = this.document.system.details.surgeValue
		const constHasSurges = this.document.system.details.surges.value > 0
		return { hpMax, constHasSurges, surgeValue }
	}

	_onRender(context, options) {
		if (!this.document.testUserPermission(game.user, this.options.editPermission)) return;
		this.element.querySelector('.heal-button')?.addEventListener("click", this._onHealButton.bind(this));
		HealMenuDialog._setButtonEnabledState();
	}

	static _setButtonEnabledState() {
		let hpButtonEnabled = true
		let hpButtonText = game.i18n.localize("DND4E.HealingMenuHealHP");
		let tempHPButtonEnabled = true
		let tempHPButtonText = game.i18n.localize("DND4E.HealingMenuGainTempHP");
		let evaluateFurtherHPButton = true
		if (document.getElementById('hpMax').value === "true") {
			hpButtonEnabled = false
			hpButtonText = game.i18n.localize("DND4E.HealingMenuAtMaxHP");
			evaluateFurtherHPButton = false
		}

		if (document.getElementById('spend-healing-surge').checked === true) {
			if (document.getElementById('hasSurges').value === "false") {
				tempHPButtonEnabled = false
				tempHPButtonText = game.i18n.localize("DND4E.HealingMenuOutOfSurges");
				if (evaluateFurtherHPButton) {
				hpButtonEnabled = true
				hpButtonText = game.i18n.localize("DND4E.HealingMenuHealOneHP");
				}
			}
		}
		function setButtonEnabled(buttonId, enabled, text) {
			const button = document.getElementById(buttonId)
			button.innerHTML = text
			if (enabled) {
				button.removeAttribute("disabled")
			}
			else {
				button.setAttribute("disabled", "true")
			}
		}
		setButtonEnabled('healButton', hpButtonEnabled, hpButtonText)
		setButtonEnabled('tempHpButton', tempHPButtonEnabled, tempHPButtonText)
	}

	static _onHealButtonClicked() {
		document.getElementById("heal-type").value = "heal";
	}

	static _onTempHPButtonClicked() {
		document.getElementById("heal-type").value = "tempHP";
	}

	static _onHealingPotionSettingsClicked() {
		document.getElementById("spend-healing-surge").checked = true
		document.getElementById("gain-healing-surge-value").checked = false
		document.getElementById("bonus").value = 10
		HealMenuDialog._setButtonEnabledState();
	}

	/* -------------------------------------------- */

	/** @override */
	static async #onSubmit(event, form, formData) {
		const updateData = {};
		const healData = foundry.utils.expandObject(formData.object);

		console.log(JSON.stringify(healData))

		let roll = await Helper.rollWithErrorHandling(healData.bonus, { errorMessageKey: "DND4E.InvalidHealingBonus"})

		let surgeValueText = "0"
		let surgeValue = 0
		if (healData["gain-healing-surge-value"] === true) {
			surgeValue = this.document.system.details.surgeValue
			surgeValueText = surgeValue
		}

		const healTotal = surgeValue + roll.total

		const healType = healData["heal-type"]
		let healTypeText = game.i18n.localize("DND4E.regains")
		let hpTypeText = game.i18n.localize("DND4E.HP")
		if (healType === "tempHP") {
			healTypeText = game.i18n.localize("DND4E.gains")
			hpTypeText = game.i18n.localize("DND4E.TempHPTip")
			await this.document.applyTempHpChange(healTotal)
		}
		else if (this.document.system.details.surges.value > 0){
			await this.document.applyDamage(healTotal, -1)
		} else if (this.document.system.details.surges.value == 0 && this.document.system.attributes.hp.value <= 0){
			await this.document.applyDamage(1, -1)
			surgeValueText = 1;
		} else {
			surgeValueText = 0;
		}

		let healingSurgeText = ""
		if (healData["spend-healing-surge"] === true) {
			if(this.document.system.details.surges.value > 0){
				healingSurgeText = game.i18n.localize("DND4E.SurgeSpendAnd");
			} else {
				healingSurgeText = game.i18n.localize("DND4E.SurgeNotSpendAnd");
			}
			updateData[`system.details.surges.value`] = Math.max(this.document.system.details.surges.value - 1, 0)
			await this.document.update(updateData);
		}

		const rollMessage = healData.bonus && healData.bonus !== "" ? ` + ${roll.total} (${roll.formula} => ${roll.result})` : ""

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this.object, alias: this.document.name},
			content: `${this.document.name} ${healingSurgeText} ${healTypeText} ${surgeValueText} ${rollMessage} ${hpTypeText}.`,
		});
	}

}
