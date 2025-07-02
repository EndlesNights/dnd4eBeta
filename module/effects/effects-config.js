import { DND4E } from "../config.js";

export default class ActiveEffectConfig4e extends ActiveEffectConfig {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["sheet", "active-effect-sheet"],
			template: "systems/dnd4e/templates/sheets/active-effect-config.html",
			width: 580,
			height: 514,
			resizable: true,
			tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "details"}]
		});
	}

	/** @override */
	async getData(options) {
		let data = await super.getData(options);
		
		data.config = CONFIG.DND4E;
		data.powerParent = (["power", "consumable"].includes(this.object.parent.type));
		data.config.statusEffects = CONFIG.statusEffects;
		data.config.keywords = {...data.config.effectTypes,...data.config.damageTypes};

		return data;
	}
	
	/* ----------------------------------------- */

	/* Event listener for additional form controls */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".effect-dot-control").click(this._onEffectDotControl.bind(this));
		html.find(".effect-status-control").click(this._onEffectStatusControl.bind(this));
		html.find(".effect-keyword-control").click(this._onEffectKeywordControl.bind(this));
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
	* Handling for mouse clicks on status control buttons - adapted from _onEffectControl
	* Delegate responsibility out to action-specific handlers depending on the button action.
	* @param {MouseEvent} event      The originating click event
	*/
	_onEffectStatusControl(event) {
		event.preventDefault();
		const button = event.currentTarget;
		switch ( button.dataset.action ) {
			case "copy-name":
			case "copy-icon":
			case "copy-desc":
			case "copy-mods":
			case "copy-cl":
			case "copy-all":
				const statusId = button.closest(".effect-status").getAttribute("data-status-id");
				return this._copyStatusDetails(statusId,button.dataset.action).then(() => this.render());
			case "add":
				return this._addEffectStatus();
			case "delete":
				button.closest(".effect-status").remove();
				return this.submit({preventClose: true}).then(() => this.render());
		}
	}

	/* ----------------------------------------- */

	/**
	* Handling for mouse clicks on Keyword control buttons - adapted from _onEffectControl
	* Delegate responsibility out to action-specific handlers depending on the button action.
	* @param {MouseEvent} event      The originating click event
	*/
	_onEffectKeywordControl(event) {
		event.preventDefault();
		const button = event.currentTarget;
		switch ( button.dataset.action ) {
			case "add":
				return this._addEffectKeyword();
			case "delete":
				button.closest(".effect-keyword").remove();
				return this.submit({preventClose: true}).then(() => this.render());
		}
	}

	/* ----------------------------------------- */
	
	/**
	* Handle adding a new dot to the dots array - adapted from _addEffectChange
	*/
	async _addEffectDot() {
		const i = this.document.flags.dnd4e.dots.length;
		return this.submit({preventClose: true, updateData: {
			[`flags.dnd4e.dots.${i}`] : {'amount': "", 'type': "", 'typesArray': []}
		}});
	}

	/* ----------------------------------------- */

	/**
	* Handle adding a new status to the statuses array - adapted from _addEffectChange
	*/
	async _addEffectStatus() {
		const i = this.document.statuses.size;
		return this.submit({preventClose: true, updateData: {
			[`statuses.${i}`] : "none"
		}});
	}

	/* ----------------------------------------- */

	/**
	* Handle adding a new dot to the keywords array - adapted from _addEffectChange
	*/
	async _addEffectKeyword() {
		const i = this.document.flags.dnd4e.keywords.length;
		return this.submit({preventClose: true, updateData: {
			[`flags.dnd4e.keywords.${i}`] : 'unknown'
		}});
	}

	/* ----------------------------------------- */

	/**
	* Copy fluff to effect from status condition config
	*/
	async _copyStatusDetails(statusId,scope="copy-all") {
		if(!statusId) return;
		
		const statuses = CONFIG.statusEffects;
		
		try{
			//I remembered error handling this time! This should be expected to fail if the status id isn't found, such as if you have remapped your conditions since setting up the effect.
			
			const statusIndex = statuses.findIndex((x) => x.id == statusId);
			let effectUpdates = {};
			
			if(scope == "copy-name" || scope == "copy-all"){
				effectUpdates.name = game.i18n.localize(statuses[statusIndex].label);
			}
			if(scope == "copy-icon" || scope == "copy-all"){
				effectUpdates.img = statuses[statusIndex].img;
				//console.log(effectUpdates);
			}
			if(scope == "copy-desc" || scope == "copy-all"){
				effectUpdates.description = game.i18n.localize(statuses[statusIndex].description);
			}
			if(scope == "copy-mods" || scope == "copy-all"){
				effectUpdates.changes = statuses[statusIndex].changes;
			}
			if (game.modules.get("condition-lab-triggler")?.active){
				if(scope == "copy-flags" || scope == "copy-all"){
					if(statuses[statusIndex].flags['condition-lab-triggler']){
						effectUpdates.conditionLab = statuses[statusIndex].flags['condition-lab-triggler'];
					}
				}
			}
			
			return this.submit({preventClose: true, updateData: effectUpdates });
			
		} catch(err) {
			ui.notifications.error(game.i18n.localize('ERROR.4eCopyStatusDetails'));
			console.log(err);
		}
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
		
		//console.debug(data);
		
		data.changes = Array.from(Object.values(data.changes || {}));
		data.statuses = Array.from(Object.values(data.statuses || {})).filter(x => x);
		// The form throws an error if it's updated while there is an unselected status condition row. 
		// I can't find a way to catch it, so instead I'm just trimming - Fox
		
		if(data.conditionLab){
		// This doesn't like merging directly, seemingly because of the hyphens in the property name. 
		//	Storing it in a separate property and updating manually seems to work. - Fox
			data.flags['condition-lab-triggler'] = data.conditionLab;
		}
		
		data.flags.dnd4e.dots = Array.from(Object.values(data.flags.dnd4e.dots || {}));
		if (data.flags.dnd4e.dots.length){
			for (let [i, dot] of data.flags.dnd4e.dots.entries()){
				data.flags.dnd4e.dots[i].amount = dot.amount;
				data.flags.dnd4e.dots[i].typesArray = dot.typesArray.sort();
			}
		}
		
		data.flags.dnd4e.keywords = Array.from(Object.values(data.flags.dnd4e.keywords || {})).filter(x => x);
		
		data.flags.dnd4e.keywordsCustom = data.flags.dnd4e.keywordsCustom;
		
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
