import {d20Roll} from "../dice.js";

export class SaveThrowDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4eBeta", "actor-save-throw"],
			template: "systems/dnd4eBeta/templates/apps/save-throw.html",
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


		let message = `Rolling Saving Throw, DC: ${formData.dc}`;
		const rollConfig = mergeObject({
			parts: [this.object.data.data.details.saves.value, formData.save],
			actor: this.actor,
			data: {},
			title: "",
			flavor: message,
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			messageData: {"flags.dnd4eBeta.roll": {type: "attack", itemId: this.id }},
			fastForward: true
		});
		rollConfig.event = event;
		rollConfig.critical = formData.dc;
		rollConfig.fumble = formData.dc -1;
		await d20Roll(rollConfig);
	}
}