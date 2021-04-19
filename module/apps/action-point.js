export class ActionPointDialog extends BaseEntitySheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "action-point",
			classes: ["dnd4eBeta", "action-point"],
			template: "systems/dnd4eBeta/templates/apps/action-point.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Action Point`;
	}

	/** @override */
	getData() {
		
		return {data: this.object.data.data}
	}
	async _updateObject(event, formData) {
		
		if(this.object.data.data.actionpoints.value >= 1) {
			ChatMessage.create({
				user: game.user._id,
				speaker: {actor: this.object, alias: this.object.data.name},
				// flavor: restFlavor,
				content: `${this.object.data.name} uses an actionpoint to gain an extra action.`
				//game.i18n.format("DND4EBETA.ShortRestResult", {name: this.name, dice: -dhd, health: dhp})
			});

			const updateData = {};
			updateData[`data.actionpoints.value`] = this.object.data.data.actionpoints.value -1;
			updateData[`data.actionpoints.encounteruse`] = true;


			this.object.update(updateData);
		}
	}	  
}
