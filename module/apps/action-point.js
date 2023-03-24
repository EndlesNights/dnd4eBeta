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
		const extra = this.object.system.actionpoints.custom !== "" ? this.object.system.actionpoints.custom.split("\n") : "";
		return { system: this.object.system, extra: extra };
	}
	async _updateObject(event, formData) {
		
		const options = this.options;

		this.object.actionPoint(event, options);
		// let extra = "";
		// if (this.object.system.actionpoints.custom !== "") {
		// 	extra = this.object.system.actionpoints.custom;
		// 	extra = extra.replace(/\n/g,'</li><li>');
		// 	extra = "<li>" + extra + "</li>";
		// }

		// if(this.object.system.actionpoints.value >= 1) {
		// 	ChatMessage.create({
		// 		user: game.user.id,
		// 		speaker: {actor: this.object, alias: this.object.name},
		// 		// flavor: restFlavor,
		// 		content: `${this.object.name} uses an actionpoint gaining the following benefits:
		// 		<ul>
		// 			<li>Gaining an addtional Standard Action</li>
		// 			${extra}
		// 		</ul>`
		// 	});

		// 	const updateData = {};
		// 	updateData[`system.actionpoints.value`] = this.object.system.actionpoints.value -1;
		// 	updateData[`system.actionpoints.encounteruse`] = true;


		// 	this.object.update(updateData);
		// }
	}
}
