import {Helper} from "../helper.js";

export class SecondWindDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "second-wind",
			classes: ["dnd4eBeta", "second-wind"],
			template: "systems/dnd4e/templates/apps/second-wind.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Second Wind`;
	}

	/** @override */
	getData() {
		const extra = this.object.system.details.secondwindbon.custom.split(";");
		return { system: this.object.system, extra: extra };
	}
	async _updateObject(event, formData) {
		
		let r = await Helper.rollWithErrorHandling(formData.bonus, { errorMessageKey: "DND4EBETA.InvalidHealingBonus"})

		const updateData = {};
		if(this.object.system.attributes.hp.value <= 0) {
			updateData[`system.attributes.hp.value`] = Math.min(
				(this.object.system.details.secondWindValue + (r.total || 0)),
				this.object.system.attributes.hp.max
			);
		} else {
			updateData[`system.attributes.hp.value`] = Math.min(
				(this.object.system.attributes.hp.value + this.object.system.details.secondWindValue + (r.total || 0)),
				this.object.system.attributes.hp.max
			);
		}

		
		updateData[`system.details.secondwind`] = true;
		
		if(this.object.system.details.surges.value > 0)
			updateData[`system.details.surges.value`] = this.object.system.details.surges.value - 1;
		
			let extra = "";
			if (this.object.system.details.secondwindbon.custom) {
				extra = this.object.system.details.secondwindbon.custom;
				extra = extra.replace(/;/g,'</li><li>');
				extra = "<li>" + extra + "</li>";
			}
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this.object, alias: this.object.name},
				// flavor: restFlavor,
				content: `${this.object.system.name} uses Second Wind gaining the following benifits:
					<ul>
						<li>Healing for ${(updateData[`system.attributes.hp.value`] - this.object.system.attributes.hp.value)} HP.</li>
						<li>Gaining a +2 to all defences until the stars of their next turn.</li>
						${extra}
					</ul>`,
					// content: this.object.system.name + " uses Second Wind, healing for " + (updateData[`system.attributes.hp.value`] - this.object.system.attributes.hp.value) + " HP, and gaining a +2 to all defences until the stars of their next turn."
				//game.i18n.format("DND4EBETA.ShortRestResult", {name: this.name, dice: -dhd, health: dhp})
			});		
		
		this.object.update(updateData);
	}	  
}
