export class ItemImporterDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return foundry.utils.mergeObject(options, {
			id: "item-importer",
			classes: ["dnd4e", "item-importer"],
			template: "systems/dnd4e/templates/apps/item-importer.html",
			width: 500,
			closeOnSubmit: false
		});
	}
	
	get title() {
		return `${this.object.name} - JSON Item Importer`;
	}

	/** @override */
	getData() {
		return {system: this.object.system}
	}
	async _updateObject(event, formData) {
		let obj = "";

		try{
			obj = JSON.parse(('Pasted content: ', formData.input))
		} catch(err) {
			console.error("Invalid JSON Input")
			ui.notifications.info("Invalid Input, JSON formating did not validate");
			return;
		}

		//check if JSON type is valid
		const validTypes = ["weapon", "equipment", "consumable", "tool", "loot", "classFeats", "feat", "backpack", "raceFeats", "pathFeats", "destinyFeats", "ritual", "power"];
		if(!validTypes.includes(obj.type)) {
			console.error(`Invalid Object Type of "${obj.type}"`)
			ui.notifications.info(`Invalid Object Type of "${obj.type}"`);
			return;
		}
		//assign obj ID if one was not made
		if(!obj._id) { obj._id = foundry.utils.randomID(16); }
		//generate new item
		this.object.createEmbeddedDocuments("Item",[obj])
	}
}