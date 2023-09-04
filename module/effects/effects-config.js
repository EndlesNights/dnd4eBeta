import { DND4EBETA } from "../config.js";

export default class ActiveEffectConfig4e extends ActiveEffectConfig {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["sheet", "active-effect-sheet"],
			template: "systems/dnd4e/templates/sheets/active-effect-config.html",
			width: 580,
			height: "auto",
			tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "details"}]
		});
	}

	/** @override */
	async getData(options) {
		let data = await super.getData(options);
		
		data.config = CONFIG.DND4EBETA;
		data.powerParent = (this.object.parent.type === "power");

		return data;
	}
	
	/* ----------------------------------------- */

	/* Event listener for DOT control buttons */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".effect-dot-control").click(this._onEffectDotControl.bind(this));
	}

	/* ----------------------------------------- */

	/**
	* Handling for mouse clicks on DOT control buttons - adapted from _onEffectControl
	* Delegate responsibility out to action-specific handlers depending on the button action.
	* @param {MouseEvent} event      The originating click event
	*/
	_onEffectDotControl(event) {
		event.preventDefault();
		const button = event.currentTarget;
		switch ( button.dataset.action ) {
			case "add":
				return this._addEffectDot();
			case "delete":
				console.log(button.closest(".effect-dot"));
				button.closest(".effect-dot").remove();
				return this.submit({preventClose: true}).then(() => this.render());
				//return this._removeEffectDot(button);
		}
	}

	/* ----------------------------------------- */

	/**
	* Handle adding a new dot to the dots array - adapted from _addEffectChange
	*/
	async _addEffectDot() {
		const i = this.document.flags.dnd4e.dots.length;
		//const idx = this.document.flags.dnd4e.dots.length;
		return this.submit({preventClose: true, updateData: {
			[`flags.dnd4e.dots.${i}`] : {amount: "", type: "", typesArray: []}
		}});
	}

	/* ----------------------------------------- */
	/* I'm really worried that I had to override this method form the core class.
		I'm afraid it might mess up module compatibility or something!
		If anybody knows a better way, please let me know. - Fox
	*/
	_getSubmitData(updateData={}) {
		const fd = new FormDataExtended(this.form, {editors: this.editors});
		let data = foundry.utils.expandObject(fd.object);
		if ( updateData ) foundry.utils.mergeObject(data, updateData);
		data.changes = Array.from(Object.values(data.changes || {}));	
		//data.flags.dnd4e.dots = Array.from(Object.values(data.flags.dnd4e.dots || {}));
		
		data.flags.dnd4e.dots = Array.from(Object.values(data.flags.dnd4e.dots || {}));
		if (data.flags.dnd4e.dots.length){
			for (let [i, dot] of data.flags.dnd4e.dots.entries()){
				data.flags.dnd4e.dots[i].amount = parseInt(dot.amount);
				if(!dot.type) {
					data.flags.dnd4e.dots[i].typesArray = ['physical'];
				} else {
					let type = dot.type.toLowerCase().replaceAll(/( and )|(;(?! ))|(; )|(, )|(,(?! ))|([^;,]) (?!and)/g,"$6|");
					data.flags.dnd4e.dots[i].typesArray = type.split("|").sort();
				}
			}
			console.log(data.flags.dnd4e.dots);
		}
		
		return data;
	}
}
