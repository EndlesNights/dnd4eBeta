import ActorSheet4e from "./actor-sheet.js"

export default class ActorSheet4eHazard extends ActorSheet4e {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["dnd4e", "sheet", "actor", "Hazard"],
			width: 510,
			height: 680
		});
	}
	
	/** @override */
	get template() {
		return `systems/dnd4e/templates/hazard-sheet.html`;
	}
	
	/** @override */
	async getData(options) {

		const coreData = await super.getData(options);
		//console.debug(coreData);
		let hazardData = {};
		
		hazardData.descHTML = await TextEditor.enrichHTML(coreData.system.description, {
			secrets: coreData.owner,
			async: true,
			relativeTo: this.actor
		});
		
		hazardData.countersHTML = await TextEditor.enrichHTML(coreData.system.details.countermeasures, {
			secrets: coreData.owner,
			async: true,
			relativeTo: this.actor
		});
		
		hazardData.notesHTML = await TextEditor.enrichHTML(coreData.system.details.notes, {
			secrets: coreData.owner,
			async: true,
			relativeTo: this.actor
		});
		
		let combinedData = {...coreData,...hazardData};		
		return combinedData;
	}

	/* -------------------------------------------- */

	/** @override */
	setPosition(options={}) {
		const position = super.setPosition(options);

		//TODO fix this monstrosity!
		//Because I'm bad at CSS and can't find the solution T_T
		const sheetBody = this.element.find(".npc-lower");
		const upper = this.element.find(".npc-upper");
		const bodyHeight = sheetBody.parent().height() - upper.height() - 15; //extra 15 for the padding
		sheetBody.css("height", bodyHeight);
		
		return position;
	}

}