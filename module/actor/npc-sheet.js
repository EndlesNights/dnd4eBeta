import ActorSheet4e from "./actor-sheet.js"

export default class ActorSheet4eNPC extends ActorSheet4e {



	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["dnd4eAltus", "sheet", "actor", "NPC"],
			width: 600,
			height: 680
		});
	}
	/** @override */
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return `systems/dnd4eAltus/templates/npc-sheet-limited.html`;
		return `systems/dnd4eAltus/templates/npc-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	setPosition(options={}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find(".sheet-body");
		const bodyHeight = position.height - 294;
		sheetBody.css("height", bodyHeight);
		return position;
	}
}