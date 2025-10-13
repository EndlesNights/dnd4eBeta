import ActorSheet4e from "./actor-sheet.js"

export default class ActorSheet4eNPC extends ActorSheet4e {

	static DEFAULT_OPTIONS = {
		classes: ["NPC"],
		position: {
			width: 600,
			height: 680
		}
	};

	static PARTS = {
		sheet: {
			template: "systems/dnd4e/templates/actors/npc-sheet.hbs",
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
				"systems/dnd4e/templates/actors/tabs/biography.hbs",
				"systems/dnd4e/templates/actors/tabs/inventory.hbs",
				"systems/dnd4e/templates/actors/tabs/features.hbs",
				"systems/dnd4e/templates/actors/tabs/powers.hbs",
				"systems/dnd4e/templates/actors/tabs/effects.hbs",
				"templates/generic/tab-navigation.hbs"
			]
		},
		limited: {
			template: "systems/dnd4e/templates/actors/npc-sheet-limited.hbs",
			templates: [
				"systems/dnd4e/templates/actors/tabs/biography.hbs"
			]
		}
	};

	static TABS = {
		primary: {
			tabs: [
				{id: "biography", label: "DND4E.Sheet.Biography"},
				{id: "skills", label: "DND4E.Sheet.Skills"},
				{id: "inventory", label: "DND4E.Sheet.Inventory"},
				{id: "features", label: "DND4E.Sheet.Features"},
				{id: "powers", label: "DND4E.Sheet.Powers"},
				{id: "effects", label: "DND4E.Sheet.Effects"}
			],
			initial: "powers"
		}
	}

	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		if (this.document.limited) {
			options.parts = ['limited'];
		} else {
			options.parts = ['sheet'];
		}
	}
}