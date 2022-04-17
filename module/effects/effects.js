/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
 export default class ActiveEffect4e extends ActiveEffect {


	constructor(data, context) {
		console.log(data)
		if (data.id) {
		  setProperty(data, "flags.core.statusId", data.id);
		  delete data.id;
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
			if ( game.combat ) {
				updates.duration.startRound = game.combat.round;
				updates.duration.startTurn = game.combat.turn ?? 0;
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
		if ( (parentType !== "Actor") || (parentId !== this.parent.id) || (documentType !== "Item") ) return;
		const item = this.parent.items.get(documentId);
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