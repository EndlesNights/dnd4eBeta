export class SecondWindDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4eBeta", "second-wind"],
			template: "systems/dnd4eBeta/templates/apps/second-wind.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Second Wind`;
	}

	/** @override */
	getData() {
		
		return {data: this.object.data.data}
	}
	async _updateObject(event, formData) {
		
		let r = new Roll("0");
		if(formData.bonus != "" ){
			r = new Roll(formData.bonus);
			try{
				r.roll();

			}catch (error){
				
				console.log("Invalid roll input into healing surge bonus.");
				r.roll();
			}
		}
		
		const updateData = {};
		updateData[`data.health.value`] = Math.min(
			(this.object.data.data.health.value + this.object.data.data.details.secondWindValue + r.total),
			this.object.data.data.health.max
		);
		
		updateData[`data.details.secondwind`] = true;
		
		if(this.object.data.data.details.surgeCur > 0)
			updateData[`data.details.surgeCur`] = this.object.data.data.details.surgeCur - 1;
		
		ChatMessage.create({
			user: game.user._id,
			speaker: {actor: this.object, alias: this.object.data.name},
			// flavor: restFlavor,
			content: this.object.data.name + " uses Second Wind, healing for " + (updateData[`data.health.value`] - this.object.data.data.health.value) + " HP, and gaining a +2 to all defences until the stars of their next turn."
			//game.i18n.format("DND4EBETA.ShortRestResult", {name: this.name, dice: -dhd, health: dhp})
		});		
		
		this.object.update(updateData);
	}	  
}


