import {d20Roll} from "../dice.js";

export class SaveThrowDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "save-throw",
			classes: ["dnd4eAltus", "actor-save-throw"],
			template: "systems/dnd4eAltus/templates/apps/save-throw.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - Saving Throw`;
	}

	/** @override */
	getData() {
		return {
			data: this.object.data.data,
			rollModes: CONFIG.Dice.rollModes
		};
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
			messageData: {"flags.dnd4eAltus.roll": {type: "attack", itemId: this.id }},
			fastForward: true,
			rollMode: formData.rollMode
		});
		rollConfig.event = event;
		rollConfig.critical = formData.dc - this.object.data.data.details.saves.value - formData.save || 10;
		rollConfig.fumble = formData.dc -1 - this.object.data.data.details.saves.value - formData.save || 9;
		await d20Roll(rollConfig);
	}
}