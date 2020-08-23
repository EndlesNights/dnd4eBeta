export class LongRestDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4ealtus", "actor-rest"],
			template: "systems/dnd4ealtus/templates/apps/long-rest.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Long Rest`;
	}

	/** @override */
	getData() {
		
		return {data: this.object.data.data}
	}
	async _updateObject(event, formData) {
		
		const updateData = {};
		
		if(this.object.data.data.details.surgeEnv > this.object.data.data.details.surgeDay)
		{
			updateData[`data.details.surgeCur`] = 0;
			updateData[`data.health.value`] = this.object.data.data.health.max + (this.object.data.data.details.surgeDay - this.object.data.data.details.surgeEnv) *  Math.floor(this.object.data.data.details.bloodied / 2);
		}
		else{
			updateData[`data.details.surgeCur`] = this.object.data.data.details.surgeDay - this.object.data.data.details.surgeEnv;
			updateData[`data.health.value`] = this.object.data.data.health.max;
		}

		updateData[`data.details.temp`] = "";
		updateData[`data.actionpoints.value`] = 1;
		
		updateData[`data.details.secondwind`] = false;
		updateData[`data.actionpoints.encounteruse`] = false;
		
		// *** TODO For Each reset encounter & daily power HERE
		
		ChatMessage.create({
			user: game.user._id,
			speaker: {actor: this.object, alias: this.object.data.name},
			// flavor: restFlavor,
			content: this.object.data.name + " takes a long rest."
		});		
		
		this.object.update(updateData);
	}	  
}


