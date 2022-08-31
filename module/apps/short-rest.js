import { Helper } from "../helper.js";

export class ShortRestDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "short-rest",
			classes: ["dnd4eAltus", "actor-rest"],
			template: "systems/dnd4eAltus/templates/apps/short-rest.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Short Rest`;
	}

	/** @override */
	getData() {
		
		return {system: this.object.system}
	}
	
	async _updateObject(event, formData) {
		
		const updateData = {};
		updateData[`system.attributes.hp.value`] = this.object.system.attributes.hp.value;
		
		if(formData.surge > 0)
		{
			if(formData.surge > this.object.system.details.surges.value)
				formData.surge = this.object.system.details.surges.value;
			
			let r = new Roll("0");
			let healamount = 0;
			for(let i = 0; i < formData.surge; i++){
				
				if(formData.bonus != "" ){
					r = new Roll(formData.bonus);
					try{
						await r.roll({async : true});

					}catch (error){
						ui.notifications.error(game.i18n.localize("DND4EALTUS.InvalidHealingBonus"));
						r = new Roll("0");
						await r.roll({async : true});
					}
				}
				healamount += this.object.system.details.surgeValue + (r.total || 0);
				console.log(`surgeValue:${this.object.system.details.surgeValue}`)
				console.log(`total:${r.total}`)
				console.log(`healamount:${healamount}`)
			}

			updateData[`system.attributes.hp.value`] = Math.min(
				(this.object.system.attributes.hp.value + healamount),
				this.object.system.attributes.hp.max
			);
		
			if(this.object.system.details.surges.value > 0)
				updateData[`system.details.surges.value`] = this.object.system.details.surges.value - formData.surge;
			
		}
		else if(formData.surge == 0 && this.object.system.attributes.hp.value <= 0)
		{
			updateData[`system.attributes.hp.value`] = 1;
		}
		
		if(!this.object.system.attributes.hp.temprest)
			updateData[`system.attributes.temphp.value`] = "";
		
		updateData[`system.details.secondwind`] = false;
		updateData[`system.actionpoints.encounteruse`] = false;
		updateData[`system.magicItemUse.encounteruse`] = false;
		
		console.log(this)
		Helper.rechargeItems(this.object, ["enc", "round"]);
		Helper.endEffects(this.document, ["endOfTargetTurn", "endOfUserTurn","startOfTargetTurn","startOfUserTurn","endOfEncounter"]);

		
		if(this.object.type === "Player Character"){

			console.log(updateData[`system.attributes.hp.value`])
			console.log(this.object.system.attributes.hp.value)
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this.object, alias: this.object.name},
				content: formData.surge >= 1 ? `${this.object.name} takes a short rest, spending ${formData.surge} healing surge, regaining ${(updateData[`system.attributes.hp.value`] - this.object.system.attributes.hp.value)} HP.`
					: `${this.object.name} takes a short rest.`
				
			});				
		}

		
		for (let r of Object.entries(this.object.system.resources)) {
			if(r[1].sr && r[1].max) {
				updateData[`system.resources.${r[0]}.value`] = r[1].max;
			}
		}

		console.log(updateData[`system.attributes.hp.value`]);
		console.log(this.object.system.attributes.hp.value);

		this.object.update(updateData);
	}	  
}
