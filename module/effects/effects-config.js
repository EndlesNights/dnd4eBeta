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
		data.powerParent = (["power", "consumable"].includes(this.object.parent.type));

		return data;
	}
	
	/* ----------------------------------------- */

	/* Event listener for additional form controls */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".effect-dot-control").click(this._onEffectDotControl.bind(this));
		html.find(".refreshes").change(this._refresh.bind(this));
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
				button.closest(".effect-dot").remove();
				return this.submit({preventClose: true}).then(() => this.render());
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
	/* I'm really worried that I had to override this method from the core class.
		I'm afraid it might mess up module compatibility or something!
		If anybody knows a better way, please let me know. - Fox
	*/
	_getSubmitData(updateData={}) {
		const fd = new FormDataExtended(this.form, {editors: this.editors});
		let data = foundry.utils.expandObject(fd.object);
		if ( updateData ) foundry.utils.mergeObject(data, updateData);
		data.changes = Array.from(Object.values(data.changes || {}));
		
		data.flags.dnd4e.dots = Array.from(Object.values(data.flags.dnd4e.dots || {}));
		if (data.flags.dnd4e.dots.length){
			for (let [i, dot] of data.flags.dnd4e.dots.entries()){
				data.flags.dnd4e.dots[i].amount = parseInt(dot.amount);
				data.flags.dnd4e.dots[i].typesArray = dot.typesArray.sort();
				/*if(!dot.type) {
					data.flags.dnd4e.dots[i].typesArray = ['physical'];
				} else {
					let type = dot.type.toLowerCase().replaceAll(/( and )|(;(?! ))|(; )|(, )|(,(?! ))|([^;,]) (?!and)/g,"$6|");
					data.flags.dnd4e.dots[i].typesArray = type.split("|").sort();
				}*/
			}
		}
		
		return data;
	}
	
	/* ----------------------------------------- */

	/**
	* Allows changing a field to re-render the form (such as for the DOT damage type selector/dropdown)
	* @param {MouseEvent} event      The originating change event
	*/
	_refresh(event){
		return this.submit({preventClose: true}).then(() => this.render());
	}
	
}
