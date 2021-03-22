import {d20Roll} from "../dice.js";

export class DeathSaveDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4eBeta", "actor-death-save"],
			template: "systems/dnd4eBeta/templates/apps/death-save.html",
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
		
		let message = `Rolling Death Saving Throw`;
		const rollConfig = mergeObject({
			parts: [this.object.data.data.details.deathsavebon.value, formData.save],
			actor: this.actor,
			data: {},
			title: "",
			flavor: message,
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			messageData: {"flags.dnd4eBeta.roll": {type: "attack", itemId: this.id }},
			fastForward: true
		});
		rollConfig.event = event;
		rollConfig.critical = this.object.data.data.details.deathsaveCrit || 20;
		rollConfig.fumble = 9;
		let roll = d20Roll(rollConfig);
		
		if(roll.total < 10)
		{
			updateData[`data.details.deathsavefail`] = this.object.data.data.details.deathsavefail + 1;
			

		}
		if( roll && this.object.data.data.details.deathsavefail + 1 >= this.object.data.data.details.deathsaves)
		{
			await ChatMessage.create({
				user: game.user._id,
				speaker: ChatMessage.getSpeaker(),
				content: this.object.data.name + " has failed their last death saving throw and has died!"
			});
		}

		this.object.update(updateData);

	}
}