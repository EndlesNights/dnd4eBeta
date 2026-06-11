import DocumentSheet4e from "./DocumentSheet4e.js";
import { Helper } from "../helper.js";

export class HealMenuDialog extends DocumentSheet4e {

	/** @override */
	static DEFAULT_OPTIONS = {
		id: "heal-menu-dialog",
		classes: ["dnd4e", "standard-form", "default"],
		form: {
			closeOnSubmit: true,
			submitOnClose: false,
			handler: HealMenuDialog.#onSubmit,
		},
		actions: {
			spendSurgesChecked: HealMenuDialog.#setButtonEnabledState,
			healButtonClicked: HealMenuDialog.#onHealButtonClicked,
			tempHPButtonClicked: HealMenuDialog.#onTempHPButtonClicked,
			healingPotionSettingsClicked: HealMenuDialog.#onHealingPotionSettingsClicked,
		},
		position: {
			width: 500,
			height: "auto",
		},
		tag: "form",
		window: {
			title: "Healing Menu",
			contentClasses: ["standard-form"],
			resizable: true,
		},
	};

	get title() {
		return `${this.document.name} - ${_loc("DND4E.Healing")}`;
	}

	static PARTS = {
		HealMenuDialog: {
			template: "systems/dnd4e/templates/apps/heal-menu-dialog.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/** @override */
	_prepareContext(options) {
		const hpMax = this.document.system.attributes.hp.value === this.document.system.attributes.hp.max;
		const surgeValue = this.document.system.details.surgeValue;
		const constHasSurges = this.document.system.details.surges.value > 0;
		return {
			hpMax,
			constHasSurges,
			surgeValue,
			buttons: [
				{ name: "healButton", type: "heal", action: "healButtonClicked", label: "DND4E.HealingMenuHealHP" },
				{ name: "tempHPButton", type: "tempHP", action: "tempHPButtonClicked", label: "DND4E.HealingMenuGainTempHP" },
			],
		};
	}

	_onRender(context, options) {
		if (!this.document.testUserPermission(game.user, this.options.editPermission)) return;
		HealMenuDialog.#setButtonEnabledState();
	}

	static #setButtonEnabledState(event, target) {
		let hpButtonEnabled = true;
		let hpButtonText = _loc("DND4E.HealingMenuHealHP");
		let tempHPButtonEnabled = true;
		let tempHPButtonText = _loc("DND4E.HealingMenuGainTempHP");
		let evaluateFurtherHPButton = true;
		if (document.getElementById("hpMax").value === "true") {
			hpButtonEnabled = false;
			hpButtonText = _loc("DND4E.HealingMenuAtMaxHP");
			evaluateFurtherHPButton = false;
		}

		if (document.getElementById("spend-healing-surge").checked === true) {
			if (document.getElementById("hasSurges").value === "false") {
				tempHPButtonEnabled = false;
				tempHPButtonText = _loc("DND4E.HealingMenuOutOfSurges");
				if (evaluateFurtherHPButton) {
					hpButtonEnabled = true;
					hpButtonText = _loc("DND4E.HealingMenuHealOneHP");
				}
			}
		}
		function setButtonEnabled(buttonId, enabled, text) {
			const button = document.getElementsByName(buttonId)[0];
			button.innerHTML = text;
			if (enabled) {
				button.removeAttribute("disabled");
			}
			else {
				button.setAttribute("disabled", "true");
			}
		}
		setButtonEnabled("healButton", hpButtonEnabled, hpButtonText);
		setButtonEnabled("tempHPButton", tempHPButtonEnabled, tempHPButtonText);
	}

	static #onHealButtonClicked(event, target) {
		document.getElementById("heal-type").value = "heal";
	}

	static #onTempHPButtonClicked(event, target) {
		document.getElementById("heal-type").value = "tempHP";
	}

	static #onHealingPotionSettingsClicked(event, target) {
		document.getElementById("spend-healing-surge").checked = true;
		document.getElementById("gain-healing-surge-value").checked = false;
		document.getElementById("bonus").value = 10;
		HealMenuDialog._setButtonEnabledState();
	}

	/* -------------------------------------------- */

	/** @override */
	static async #onSubmit(event, form, formData) {
		const updateData = {};
		const healData = foundry.utils.expandObject(formData.object);
		const charName = this.document.name;
		const healType = healData["heal-type"];

		console.debug(JSON.stringify(healData));

		let roll = await Helper.rollWithErrorHandling(healData.bonus, { errorMessageKey: "DND4E.InvalidHealingBonus" });
		
		const surgeValue = healData["gain-healing-surge-value"] ? this.document.system.details.surgeValue : 0;
		let healTotal = this.document.system.details.surges.value > 0 ? surgeValue + roll.total : roll.total;
		
		if (healType === "tempHP") {
			await this.document.applyTempHpChange(healTotal);
		} else if (healData["spend-healing-surge"] && (this.document.system.details.surges.value == 0) && (this.document.system.attributes.hp.value <= 0)) {
			await this.document.applyDamage(1, -1);
			healTotal = 1;
		} else {
			await this.document.applyDamage(healTotal, -1);
		}

		const rollText = healData?.bonus && (healData?.bonus !== "") ? ` ${healTotal} (${roll.formula} => ${roll.result})` : healTotal;

		let messageText = "";
		if (healData["spend-healing-surge"] && this.document.system.details.surges.value) {
			if (healType === "tempHP") {
				messageText = _loc("DND4E.HealingResultSurgeTemp", { name: charName, temps: rollText });	
			} else {
				messageText = _loc("DND4E.HealingResultSurge", { name: charName, healing: rollText });		
			}
			updateData["system.details.surges.value"] = Math.max(this.document.system.details.surges.value - 1, 0);
			await this.document.update(updateData);
		} else {
			if (healType === "tempHP") {
				messageText = _loc("DND4E.HealingResultTemp", { name: charName, temps: rollText });
			} else {
				messageText = _loc("DND4E.HealingResult", { name: charName, healing: rollText });
			}			
		}

		ChatMessage.create({
			user: game.user.id,
			flavor: _loc("DND4E.Healing"),
			speaker: { actor: this.object, alias: this.document.name },
			content: messageText,
		});
	}

}
