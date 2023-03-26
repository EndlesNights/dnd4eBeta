import ActorSheet4e from "./actor-sheet.js"

export default class ActorSheet4eNPC extends ActorSheet4e {



	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["dnd4eBeta", "sheet", "actor", "NPC"],
			width: 600,
			height: 680
		});
	}
	/** @override */
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return `systems/dnd4e/templates/npc-sheet-limited.html`;
		return `systems/dnd4e/templates/npc-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	setPosition(options={}) {
		const position = super.setPosition(options);

		//TODO fix this monstrosity!
		//Because I'm bad at CSS and can't find the solution T_T
		if(this.constructor.name == "Fox4eNPCSheet"){
			const sheetBody = this.element.find(".sheet-body");
			const bodyHeight = position.height - 294;
			sheetBody.css("height", bodyHeight);
		} else {
			const sheetBody = this.element.find(".npc-lower");
			const upper = this.element.find(".npc-upper");
			const bodyHeight = sheetBody.parent().height() - upper.height() - 5; //extra 5 for the padding
			sheetBody.css("height", bodyHeight);
		}
		return position;
	}
}