import {Helper} from "../helper.js";

export class HealMenuDialog extends FormApplication {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "heal-menu-dialog",
			classes: ["dnd4eBeta"],
			title: "Healing Menu",
			template: "systems/dnd4e/templates/apps/heal-menu-dialog.html",
			width: 500,
			height: "auto",
			closeOnSubmit: true,
			submitOnClose: false
		});
	}

	/** @override */
	getData(options) {
		const hpMax = this.object.system.attributes.hp.value === this.object.system.attributes.hp.max
		const surgeValue = this.object.system.details.surgeValue
		const constHasSurges = this.object.system.details.surges.value > 0
		return {hpMax, constHasSurges, surgeValue}
	}

	/* -------------------------------------------- */

	/** @override */
	async _updateObject(event, formData) {
		const updateData = {};

		console.log(JSON.stringify(formData))

		let roll = await Helper.rollWithErrorHandling(formData.bonus, { errorMessageKey: "DND4EBETA.InvalidHealingBonus"})

		let surgeValueText = "0"
		let surgeValue = 0
		if (formData["gain-healing-surge-value"] === true) {
			surgeValue = this.object.system.details.surgeValue
			surgeValueText = surgeValue
		}

		const healTotal = surgeValue + roll.total

		const healType = formData["heal-type"]
		let healTypeText = "heals"
		if (healType === "tempHP") {
			healTypeText = "gains temp HP"
			await this.object.applyTempHpChange(healTotal)
		}
		else {
			await this.object.applyDamage(healTotal, -1)
		}

		let healingSurgeText = ""
		if (formData["spend-healing-surge"] === true) {
			healingSurgeText = "Spending a healing surge for"
			updateData[`system.details.surges.value`] = Math.max(this.object.system.details.surges.value - 1, 0)
			this.object.update(updateData);
		}
		else {
			healingSurgeText = "For"
		}

		const rollMessage = formData.bonus && formData.bonus !== "" ? ` + ${roll.total} (${roll.formula} => ${roll.result})` : ""

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this.object, alias: this.object.system.name},
			content: `${this.object.system.name} ${healTypeText}. ${healingSurgeText} ${surgeValueText} ${rollMessage}`,
		});
	}
}
