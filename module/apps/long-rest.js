import { Helper } from "../helper.js";

export class LongRestDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "long-rest",
			classes: ["dnd4eBeta", "actor-rest"],
			template: "systems/dnd4e/templates/apps/long-rest.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Long Rest`;
	}

	/** @override */
	getData() {
		return {system: this.object.system}
	}
	
	async _updateObject(event, formData) {
		
		const updateData = {};
		
		if(formData.envi == "false")
		{
			if(this.object.system.details.surgeEnv.value > this.object.system.details.surges.max)
			{
				updateData[`system.details.surges.value`] = 0;
				updateData[`system.attributes.hp.value`] = this.object.system.attributes.hp.max + (this.object.system.details.surges.max - this.object.system.details.surgeEnv.value) *  Math.floor(this.object.system.details.bloodied / 2);
			}
			else{
				updateData[`system.details.surges.value`] = this.object.system.details.surges.max - this.object.system.details.surgeEnv.value;
				updateData[`system.attributes.hp.value`] = this.object.system.attributes.hp.max;
			}
		}
		else
		{
			updateData[`system.details.surges.value`] = this.object.system.details.surges.max;
			updateData[`system.attributes.hp.value`] = this.object.system.attributes.hp.max;
			
			updateData[`system.details.surgeEnv.value`] = 0;
			updateData[`system.details.surgeEnv.bonus`] = [{}];
		}

		updateData[`system.attributes.temphp.value`] = "";
		updateData[`system.details.deathsavefail`] = 0;
		updateData[`system.actionpoints.value`] = 1;
		updateData[`system.magicItemUse.milestone`] = 0;
		updateData[`system.magicItemUse.dailyuse`] = this.object.system.magicItemUse.perDay;
		
		updateData[`system.details.secondwind`] = false;
		updateData[`system.actionpoints.encounteruse`] = false;
		updateData[`system.magicItemUse.encounteruse`] = false;
		
		Helper.rechargeItems(this.object, ["enc", "day", "round"]);
		Helper.endEffects(this.document, ["endOfTargetTurn", "endOfUserTurn","startOfTargetTurn","startOfUserTurn","endOfEncounter", "endOfDay"]);


		if(this.object.type === "Player Character"){
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this.object, alias: this.object.system.name},
				// flavor: restFlavor,
				content: `${this.object.name} takes a long rest.`
			});
		}
		
		for (let r of Object.entries(this.object.system.resources)) {
			if((r[1].sr || r[1].lr) && r[1].max) {
				updateData[`system.resources.${r[0]}.value`] = r[1].max;
			}
		}

		this.object.update(updateData);
	}	  
}
