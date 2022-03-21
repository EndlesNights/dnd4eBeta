export class ActionPointExtraDialog extends DocumentSheet {

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
		return {data: this.object.data.data}
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for(let data in formData) { updateData[`${data}`] = formData[`${data}`];}
		return this.object.update(updateData);
	}
}
