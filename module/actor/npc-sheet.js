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
		return `systems/dnd4e/templates/npc-sheet.html`;
	}

	prepareData() {
		super.prepareData();
		console.log("RIPRIP")

	}

	/** @override */
	calcDefenceStats(data) {
		console.log("RIP")
		// super.calcDefenceStats(data);
	}

	/* -------------------------------------------- */

	/** @override */
	setPosition(options={}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find(".sheet-body");
		const bodyHeight = position.height - 308;
		sheetBody.css("height", bodyHeight);
		return position;
	}
}