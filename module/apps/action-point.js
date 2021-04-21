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
		const extra = this.object.data.data.actionpoints.custom.split(";");
		return { data: this.object.data.data, extra: extra };
	}
	async _updateObject(event, formData) {
		
		let extra = "";
		if (this.object.data.data.actionpoints.custom) {
			extra = this.object.data.data.actionpoints.custom;
			extra = extra.replace(/;/g,'</li><li>');
			extra = "<li>" + extra + "</li>";
		}

		if(this.object.data.data.actionpoints.value >= 1) {
			ChatMessage.create({
				user: game.user._id,
				speaker: {actor: this.object, alias: this.object.data.name},
				// flavor: restFlavor,
				content: `${this.object.data.name} uses an actionpoint gaining the following benifits:
				<ul>
					<li>Gaining an addtional Standard ACtion</li>
					${extra}
				</ul>`
				//game.i18n.format("DND4EBETA.ShortRestResult", {name: this.name, dice: -dhd, health: dhp})
			});

			const updateData = {};
			updateData[`data.actionpoints.value`] = this.object.data.data.actionpoints.value -1;
			updateData[`data.actionpoints.encounteruse`] = true;


			this.object.update(updateData);
		}
	}	  
}
