import ActorSheet4e from "./actor-sheet.js"

export default class ActorSheet4eHazard extends ActorSheet4e {

	static DEFAULT_OPTIONS = {
		classes: ["Hazard"],
		position: {
			width: 510,
			height: 680
		}
	};

	static PARTS = {
		sheet: {
			template: "systems/dnd4e/templates/actors/hazard-sheet.hbs",
			scrollable: [
				"",
				".inventory .inventory-list",
				".features .inventory-list",
				".powers .inventory-list",
				".section--sidebar",
				".section--tabs-content",
				".section--skills",
				".tab.active"
			],
			templates: [
				"systems/dnd4e/templates/actors/tabs/powers.hbs",
				"systems/dnd4e/templates/actors/tabs/effects.hbs",
				"templates/generic/tab-navigation.hbs"
			]
		}
	}

	static TABS = {
		primary: {
			tabs: [
				{id: "description", label: "DND4E.Sheet.Description"},
				{id: "powers", label: "DND4E.Sheet.Powers"},
				{id: "effects", label: "DND4E.Sheet.Effects"}
			],
			initial: "powers"
		}
	}

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		//console.debug(coreData);
		let hazardData = {};
		
		hazardData.descHTML = await CONFIG.ux.TextEditor.enrichHTML(context.system.description, {
			secrets: context.owner,
			async: true,
			relativeTo: this.actor
		});
		
		hazardData.countersHTML = await CONFIG.ux.TextEditor.enrichHTML(context.system.details.countermeasures, {
			secrets: context.owner,
			async: true,
			relativeTo: this.actor
		});
		
		hazardData.notesHTML = await CONFIG.ux.TextEditor.enrichHTML(context.system.details.notes, {
			secrets: context.owner,
			async: true,
			relativeTo: this.actor
		});
		
		let combinedData = {...context,...hazardData};		
		return combinedData;
	}
}