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
		const extra = this.object.data.data.details.secondwindbon.custom.split(";");
		return { data: this.object.data.data, extra: extra };
	}
	async _updateObject(event, formData) {
		
		let r = await Helper.rollWithErrorHandling(formData.bonus, { errorMessageKey: "DND4EBETA.InvalidHealingBonus"})

		const updateData = {};
		if(this.object.data.data.attributes.hp.value <= 0) {
			updateData[`data.attributes.hp.value`] = Math.min(
				(this.object.data.data.details.secondWindValue + (r.total || 0)),
				this.object.data.data.attributes.hp.max
			);
		} else {
			updateData[`data.attributes.hp.value`] = Math.min(
				(this.object.data.data.attributes.hp.value + this.object.data.data.details.secondWindValue + (r.total || 0)),
				this.object.data.data.attributes.hp.max
			);
		}

		
		updateData[`data.details.secondwind`] = true;
		
		if(this.object.data.data.details.surges.value > 0)
			updateData[`data.details.surges.value`] = this.object.data.data.details.surges.value - 1;
		
			let extra = "";
			if (this.object.data.data.details.secondwindbon.custom) {
				extra = this.object.data.data.details.secondwindbon.custom;
				extra = extra.replace(/;/g,'</li><li>');
				extra = "<li>" + extra + "</li>";
			}

			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this.object, alias: this.object.data.name},
				// flavor: restFlavor,
				content: `${this.object.data.name} uses Second Wind gaining the following benifits:
					<ul>
						<li>Healing for ${(updateData[`data.attributes.hp.value`] - this.object.data.data.attributes.hp.value)} HP.</li>
						<li>Gaining a +2 to all defences until the stars of their next turn.</li>
						${extra}
					</ul>`,
					// content: this.object.data.name + " uses Second Wind, healing for " + (updateData[`data.attributes.hp.value`] - this.object.data.data.attributes.hp.value) + " HP, and gaining a +2 to all defences until the stars of their next turn."
				//game.i18n.format("DND4EBETA.ShortRestResult", {name: this.name, dice: -dhd, health: dhp})
			});		
		
		this.object.update(updateData);
	}	  
}
