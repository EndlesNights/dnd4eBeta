export class ActionPointDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "action-point",
			classes: ["action-point"],
			template: "systems/dnd4e/templates/apps/action-point.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Action Point`;
	}

	/** @override */
	getData() {
		const extra = this.object.data.data.actionpoints.custom !== "" ? this.object.data.data.actionpoints.custom.split("\n") : "";
		return { data: this.object.data.data, extra: extra };
	}
	async _updateObject(event, formData) {
		
		let extra = "";
		if (this.object.data.data.actionpoints.custom !== "") {
			extra = this.object.data.data.actionpoints.custom;
			extra = extra.replace(/\n/g,'</li><li>');
			extra = "<li>" + extra + "</li>";
		}

		if(this.object.data.data.actionpoints.value >= 1) {
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this.object, alias: this.object.data.name},
				// flavor: restFlavor,
				content: `${this.object.data.name} uses an actionpoint gaining the following benefits:
				<ul>
					<li>Gaining an addtional Standard Action</li>
					${extra}
				</ul>`
			});

			const updateData = {};
			updateData[`data.actionpoints.value`] = this.object.data.data.actionpoints.value -1;
			updateData[`data.actionpoints.encounteruse`] = true;


			this.object.update(updateData);
		}
	}	  
}
