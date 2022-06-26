import {d20Roll} from "../dice.js";

export class DeathSaveDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "death-save",
			classes: ["dnd4eBeta", "actor-death-save"],
			template: "systems/dnd4e/templates/apps/death-save.html",
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
		const parts = [this.object.data.data.details.deathsavebon.value]
		if (formData.save) {
			parts.push(formData.save)
		}
		const rollConfig = mergeObject({
			parts,
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
				user: game.user.id,
				speaker: ChatMessage.getSpeaker(),
				content:this.object.data.name + game.i18n.localize("DND4EBETA.DeathSaveFailure")
			});
		}
		else if(roll.total >= rollConfig.critical) {
			await ChatMessage.create({
				user: game.user.id,
				speaker: ChatMessage.getSpeaker(),
				content:this.object.data.name + game.i18n.localize("DND4EBETA.DeathSaveCriticalSuccess")
			});
		}
		console.log(roll.total)
		console.log(rollConfig.critical)
		this.object.update(updateData);
	}
}