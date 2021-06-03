import {d20Roll} from "../dice.js";

export class DeathSaveDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "death-save",
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
		return {
			data: this.object.data.data,
			rollModes: CONFIG.Dice.rollModes
		};
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
			fastForward: true,
			rollMode: formData.rollMode
		});
		rollConfig.event = event;
		rollConfig.critical = this.object.data.data.details.deathsaveCrit || 20;
		rollConfig.fumble = 9 - formData.save - this.object.data.data.details.deathsavebon.value;
		const roll = await d20Roll(rollConfig);
		
		if(roll.total < 10)
		{
			updateData[`data.details.deathsavefail`] = this.object.data.data.details.deathsavefail + 1;
		}
		if( roll.total < 10 && this.object.data.data.details.deathsavefail + 1 >= this.object.data.data.details.deathsaves)
		{
			await ChatMessage.create({
				user: game.user._id,
				speaker: ChatMessage.getSpeaker(),
				content: this.object.data.name + " has failed their last death saving throw and has died!"
			});
		}
		else if(roll.total - formData.save - this.object.data.data.details.deathsavebon.value >= rollConfig.critical) {
			await ChatMessage.create({
				user: game.user._id,
				speaker: ChatMessage.getSpeaker(),
				content: this.object.data.name + " has has critical succedded their death saving throw, is no longer unconouse and has regained 1 HP!"
			});
		}

		this.object.update(updateData);
	}
}