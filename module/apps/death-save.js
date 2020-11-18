export class DeathSaveDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4ealtus", "actor-death-save"],
			template: "systems/dnd4ealtus/templates/apps/death-save.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - Death Saving Throw`;
	}

	/** @override */
	getData() {
		
		return {data: this.object.data.data}
	}
	async _updateObject(event, formData) {
		
		const updateData = {};
		
		let r = formData.save == "" ? new Roll("1d20 + " + this.object.data.data.details.deathsavebon.value) : new Roll("1d20 +" + this.object.data.data.details.deathsavebon.value + "+"+ formData.save);
		
		try{
			r.roll();
		}catch (error){
			
			console.log("Invalid roll input into Situational bonus.");
			r.roll();
		}
		
		r.toMessage({
			speaker: ChatMessage.getSpeaker()
			});
			
		if(r.total < 10)
		{
			updateData[`data.details.deathsavefail`] = this.object.data.data.details.deathsavefail + 1;
			
			if(this.object.data.data.details.deathsavefail + 1 >= this.object.data.data.details.deathsaves)
			{
				ChatMessage.create({
					user: game.user._id,
					speaker: ChatMessage.getSpeaker(),
					content: this.object.data.name + " has failed their last death saving throw and has died!"
				});					
			}
		}
		

			
		this.object.update(updateData);	
	}
}