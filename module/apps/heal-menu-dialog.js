import {Helper} from "../helper.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export class HealMenuDialog extends DocumentSheet4e {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "heal-menu-dialog",
			classes: ["dnd4eAltus"],
			title: "Healing Menu",
			template: "systems/dnd4eAltus/templates/apps/heal-menu-dialog.html",
			width: 500,
			height: "auto",
			closeOnSubmit: true,
			submitOnClose: false
		});
	}
	get title() {
		return `${this.object.name} - ${game.i18n.localize( 'DND4EALTUS.Healing')}`;
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

		let roll = await Helper.rollWithErrorHandling(formData.bonus, { errorMessageKey: "DND4EALTUS.InvalidHealingBonus"})

		let surgeValueText = "0"
		let surgeValue = 0
		if (formData["gain-healing-surge-value"] === true) {
			surgeValue = this.object.system.details.surgeValue
			surgeValueText = surgeValue
		}

		const healTotal = surgeValue + roll.total

		const healType = formData["heal-type"]
		let healTypeText = game.i18n.localize("DND4EALTUS.regains")
		let hpTypeText = game.i18n.localize("DND4EALTUS.HP")
		if (healType === "tempHP") {
			healTypeText = game.i18n.localize("DND4EALTUS.gains")
			hpTypeText = game.i18n.localize("DND4EALTUS.TempHPTip")
			await this.object.applyTempHpChange(healTotal)
		}
		else if (this.object.system.details.surges.value > 0){
			await this.object.applyDamage(healTotal, -1)
		} else if (this.object.system.details.surges.value == 0 && this.object.system.attributes.hp.value <= 0){
			await this.object.applyDamage(1, -1)
			surgeValueText = 1;
		} else {
			surgeValueText = 0;
		}

		let healingSurgeText = ""
		if (formData["spend-healing-surge"] === true) {
			if(this.object.system.details.surges.value > 0){
			    healingSurgeText = game.i18n.localize("DND4EALTUS.SurgeSpendAnd");
			} else {
			    healingSurgeText = game.i18n.localize("DND4EALTUS.SurgeNotSpendAnd");
			}
			updateData[`system.details.surges.value`] = Math.max(this.object.system.details.surges.value - 1, 0)
			await this.object.update(updateData);
		}

		const rollMessage = formData.bonus && formData.bonus !== "" ? ` + ${roll.total} (${roll.formula} => ${roll.result})` : ""

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this.object, alias: this.object.name},
			content: `${this.object.name} ${healingSurgeText} ${healTypeText} ${surgeValueText} ${rollMessage} ${hpTypeText}.`,
		});
	}
}
