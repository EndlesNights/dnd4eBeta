/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
 export default class ActiveEffect4e extends ActiveEffect {
	constructor(data, context) {
		if (data.id) {
		  setProperty(data, "flags.core.statusId", data.id);
		  delete data.id;
		}


		try{
			if(context?.parent?.type === "power"){ //this will not work outside of try catch while initilising
				data.transfer = false;
			}
		} catch{

		}
		super(data, context);
	}

	/**
	 * Is this active effect currently suppressed?
	 * @type {boolean}
	 */
	isSuppressed = false;

	/* --------------------------------------------- */

	/** @inheritdoc */
	apply(actor, change) {
		if ( this.isSuppressed ) return null;
		return super.apply(actor, change);
	}


  /** @inheritdoc */
  _onUpdate(data, options, userId) {
	super._onUpdate(data, options, userId);
	if ( "disabled" in data ) this._displayScrollingStatus(!data.disabled);
  }

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		// Set initial duration data for Actor-owned effects
		if ( this.parent instanceof Actor ) {
			const updates = {duration: {startTime: game.time.worldTime}, transfer: false, equippedRec: false};
			const combat = game.combat;
			if ( combat ) {

				updates.flags = {dnd4e: { effectData: { startTurnInit: combat.turns[combat.turn].data.initiative ?? 0}}};
			}
			this.data.update(updates);
		}
	}
	/* --------------------------------------------- */

	/**
	 * Determine whether this Active Effect is suppressed or not.
	 */
	 determineSuppression() {
		this.isSuppressed = false;

		if ( this.data.disabled || (this.parent.documentName !== "Actor") ) return;

		const [parentType, parentId, documentType, documentId] = this.data.origin?.split(".") ?? [];
		const originArray = this.data.origin?.split(".");

		// if ( (parentType !== "Actor") || (parentId !== this.parent.id) || (documentType !== "Item") ) return;

		let indexItemID = originArray?.indexOf('Item') > 0 ? originArray.indexOf('Item') + 1 : -1;
		if(indexItemID < 1){
			return;
		}
		// const item = this.parent.items.get(documentId);
		const item = this.parent.items.get(originArray[indexItemID]);

		if ( !item ) return;

		//types of items that can be equipted
		const validTypes = ["weapon", "equipment", "consumable", "tool", "loot", "backpack"];
		if(validTypes.includes(item.type) && item.data.data.equipped === false){
			this.isSuppressed = this.data.flags.dnd4e?.effectData?.equippedRec || false;
			return;
		}
		this.isSuppressed = item.areEffectsSuppressed;
	}

	/* --------------------------------------------- */

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	static onManageActiveEffect(event, owner) {
		event.preventDefault();
		const a = event.currentTarget;
		const li = a.closest("li");
		const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
		switch ( a.dataset.action ) {
			case "create":
				return owner.createEmbeddedDocuments("ActiveEffect", [{
					label: game.i18n.localize("DND4EBETA.EffectNew"),
					icon: "icons/svg/aura.svg",
					origin: owner.uuid,
					"duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
					disabled: li.dataset.effectType === "inactive"
				}]);
			case "edit":
				return effect.sheet.render(true);
			case "delete":
				return effect.delete();
			case "toggle":
				return effect.update({disabled: !effect.data.disabled});
		}
	}

	/* -------------------------------------------- */

	/**
	 * Describe whether the ActiveEffect has a temporary duration based on combat turns or rounds.
	 * @type {boolean}
	 */
	get isTemporary() {
		const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
		if(durationType){
			return !!durationType;
		}
		
		return super.isTemporary;
		// const duration = this.data.duration.seconds ?? (this.data.duration.rounds || this.data.duration.turns) ?? 0;
		// return (duration > 0) || this.getFlag("core", "statusId");
	}

	// /* --------------------------------------------- */

	// /**
	//  * Summarize the active effect duration
	//  * @type {{type: string, duration: number|null, remaining: number|null, label: string}}
	//  */
	// get duration() {
	// 	const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
	// 	if(durationType){
	// 		console.log(durationType)
	// 		return durationType;
	// 	}

	// 	return super.duration;
	// }

	/* --------------------------------------------- */

	
	/**
	 * @override
	 * Summarize the active effect duration
	 * @type {{type: string, duration: number|null, remaining: number|null, label: string}}
	 */
	get duration() {
		if(this.data.flags?.dnd4e?.effectData?.durationType){
			const d = this.data.duration;
			const duration = this._getCombatTime(d.rounds, d.turns);
			return {
				type: "turns",
				duration: duration,
				remaining: duration,
				label: this._getDurationLabel(d.rounds, d.turns)
			}
		}
		return super.duration;
	}
	/* -------------------------------------------- */

	/**
	 * @override
	 * Format a number of rounds and turns into a human-readable duration label
	 * @param {number} rounds   The number of rounds
	 * @param {number} turns    The number of turns
	 * @returns {string}        The formatted label
	 * @private
	 */
	_getDurationLabel(rounds, turns) {
		const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
		if(durationType){

			if(durationType === "endOfTargetTurn") return  game.i18n.localize("DND4EBETA.DurationEndOfTargetTurnSimp");
			else if(durationType === "startOfTargetTurn")  return game.i18n.localize("DND4EBETA.DurationStartOfTargetTurnSimp");

			return CONFIG.DND4EBETA.durationType[durationType];
		}

		return super._getDurationLabel(rounds, turns);
	}

	_getIsSave() {
		return this.getFlag("dnd4e", "effectData")?.durationType === "saveEnd";
	}
	/* --------------------------------------------- */

	/**
	 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
	 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
	 * @returns {object}                  Data for rendering
	 */
	static prepareActiveEffectCategories(effects) {
		// Define effect header categories
		const categories = {
			temporary: {
				type: "temporary",
				label: game.i18n.localize("DND4EBETA.EffectTemporary"),
				effects: []
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("DND4EBETA.EffectPassive"),
				effects: []
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("DND4EBETA.EffectInactive"),
				effects: []
			},
			suppressed: {
				type: "suppressed",
				label: game.i18n.localize("DND4EBETA.EffectUnavailable"),
				effects: [],
				info: [game.i18n.localize("DND4EBETA.EffectUnavailableInfo")]
			}
		};

		// Iterate over active effects, classifying them into categories
		for ( let e of effects ) {
			e._getSourceName(); // Trigger a lookup for the source name
			if ( e.isSuppressed ) categories.suppressed.effects.push(e);
			else if ( e.data.disabled ) categories.inactive.effects.push(e);
			else if ( e.isTemporary ) categories.temporary.effects.push(e);
			else categories.passive.effects.push(e);
		}

		categories.suppressed.hidden = !categories.suppressed.effects.length;
		return categories;
	}
}


// /**
//  * Manage Active Effect instances through the Actor Sheet via effect control buttons.
//  * @param {MouseEvent} event      The left-click event on the effect control
//  * @param {Actor|Item} owner      The owning entity which manages this effect
//  */
//  export function onManageActiveEffect(event, owner) {
// 	event.preventDefault();
// 	const a = event.currentTarget;
// 	const li = a.closest("li");
// 	const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
// 	switch ( a.dataset.action ) {
// 		case "create":
// 			return owner.createEmbeddedDocuments("ActiveEffect", [{
// 				label: game.i18n.localize("DND4EBETA.EffectNew"),
// 				icon: "icons/svg/aura.svg",
// 				origin: owner.uuid,
// 				"duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
// 				disabled: li.dataset.effectType === "inactive"
// 			}]);
// 		case "edit":
// 			return effect.sheet.render(true);
// 		case "delete":
// 			return effect.delete();
// 		case "toggle":
// 			return effect.update({disabled: !effect.data.disabled});
// 	}
// }

// /**
//  * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
//  * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
//  * @return {object}                   Data for rendering
//  */
// export function prepareActiveEffectCategories(effects) {

// 		// Define effect header categories
// 		const categories = {
// 			temporary: {
// 				type: "temporary",
// 				label: game.i18n.localize("DND4EBETA.EffectTemporary"),
// 				effects: []
// 			},
// 			passive: {
// 				type: "passive",
// 				label: game.i18n.localize("DND4EBETA.EffectPassive"),
// 				effects: []
// 			},
// 			inactive: {
// 				type: "inactive",
// 				label: game.i18n.localize("DND4EBETA.EffectInactive"),
// 				effects: []
// 			}
// 		};

// 		// Iterate over active effects, classifying them into categories
// 		for ( let e of effects ) {
// 			e._getSourceName(); // Trigger a lookup for the source name
// 			if ( e.data.disabled ) categories.inactive.effects.push(e);
// 			else if ( e.isTemporary ) categories.temporary.effects.push(e);
// 			else categories.passive.effects.push(e);
// 		}
// 		return categories;
// }