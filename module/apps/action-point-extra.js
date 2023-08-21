import DocumentSheet4e from "./DocumentSheet4e.js"

export class ActionPointExtraDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "action-point-extra",
			classes: ["action-point"],
			template: "systems/dnd4e/templates/apps/action-point-extra.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Action Point Riders`;
	}

	/** @override */
	getData() {
		return {system: this.object.system}
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.object.update(updateData);
	}
}
