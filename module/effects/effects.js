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
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);

		// Set initial duration data for Actor-owned effects
		if ( this.parent instanceof Actor ) {
			const updates = {duration: {startTime: game.time.worldTime}, transfer: false, equippedRec: false};
			const combat = game.combat;
			if (combat?.turn != null && combat.turns && combat.turns[combat.turn]) {//if combat has started - combat.turn for the first character = 0 (so cannot use truthy value).  If there are no combatents combat.turns = []
				updates.flags = {dnd4eAltus: { effectData: { startTurnInit: combat.turns[combat.turn].initiative ?? 0}}};
			}
			this.updateSource(updates);
		}
	}
	/* --------------------------------------------- */

	/**
	 * Determine whether this Active Effect is suppressed or not.
	 */
	 determineSuppression() {
		this.isSuppressed = false;

		if ( this.disabled || (this.parent.documentName !== "Actor") ) return;

		const [parentType, parentId, documentType, documentId] = this.origin?.split(".") ?? [];
		const originArray = this.origin?.split(".");

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
		if(validTypes.includes(item.type) && item.system.equipped === false){
			this.isSuppressed = this.flags.dnd4eAltus?.effectData?.equippedRec || false;
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
					name: game.i18n.localize("DND4EALTUS.EffectNew"),
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
				return effect.update({disabled: !effect.disabled});
		}
	}

	/* -------------------------------------------- */

	/**
	 * Describe whether the ActiveEffect has a temporary duration based on combat turns or rounds.
	 * @type {boolean}
	 */
	get isTemporary() {
		const durationType = this.getFlag("dnd4eAltus", "effectData")?.durationType;
		if(durationType){
			return !!durationType;
		}
		
		return super.isTemporary;
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
		const durationType = this.getFlag("dnd4eAltus", "effectData")?.durationType;
		if(durationType){

			if(durationType === "endOfTargetTurn") return  game.i18n.localize("DND4EALTUS.DurationEndOfTargetTurnSimp");
			else if(durationType === "startOfTargetTurn")  return game.i18n.localize("DND4EALTUS.DurationStartOfTargetTurnSimp");

			return CONFIG.DND4EALTUS.durationType[durationType];
		}

		return super._getDurationLabel(rounds, turns);
	}

	_getIsSave() {
		return this.getFlag("dnd4eAltus", "effectData")?.durationType === "saveEnd";
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
				label: game.i18n.localize("DND4EALTUS.EffectTemporary"),
				effects: []
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("DND4EALTUS.EffectPassive"),
				effects: []
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("DND4EALTUS.EffectInactive"),
				effects: []
			},
			suppressed: {
				type: "suppressed",
				label: game.i18n.localize("DND4EALTUS.EffectUnavailable"),
				effects: [],
				info: [game.i18n.localize("DND4EALTUS.EffectUnavailableInfo")]
			}
		};

		// Iterate over active effects, classifying them into categories
		for ( let e of effects ) {
			if ( e.isSuppressed ) categories.suppressed.effects.push(e);
			else if ( e.disabled ) categories.inactive.effects.push(e);
			else if ( e.isTemporary ) categories.temporary.effects.push(e);
			else categories.passive.effects.push(e);
		}

		categories.suppressed.hidden = !categories.suppressed.effects.length;
		return categories;
	}

	async _preUpdate(data, options, user){
		super._preUpdate(data, options, user);
		console.log(this);
		console.log(data);
		console.log(options);
		console.log(user);

		console.log(this.changes[0].value)
	}
	// _onUpdate(data, options, userId) {
	// 	super._onUpdate(data, options, userId);

	// 	//check if the effect if on an Item that is on an Actor
	// 	if(this.parent.documentName === "Item" && this.parent.parent?.documentName ==="Actor"){
	// 		if(this.parent.type === "power"){
	// 			return;
	// 		}

	// 		console.log(this);
	// 		console.log(data);
	// 		console.log(options);
	// 		console.log(userId);

	// 		const actor = this.parent.parent;
	// 		for(const effect of actor.effects){
	// 			if(effect.origin.includes(`Item.${this.parent.id}`)){
	// 				console.log(effect);

	// 				console.log(this.changes[0].key)
	// 				console.log(this.changes[0].value)
	// 				// effect.apply(actor, options);
	// 			}
	// 		}
	// 	}
	// }

	// _onDelete(options, userId) {
	// 	console.trace();
	// 	super._onDelete(options, userId);
	// }
}
