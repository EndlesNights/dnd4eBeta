/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
 export default class ActiveEffect4e extends ActiveEffect {
	constructor(data, context) {
		if (data.id) {
		  foundry.utils.setProperty(data, "flags.core.statusId", data.id);
		  delete data.id;
		}
		try{
			// if(context?.parent?.type === "power"){ //this will not work outside of try catch while initilising
			if(['power','consumable'].includes(context?.parent?.type)){
				data.transfer = false;

				if(context.parent.system?.damageType){
					for (const [key, value] of Object.entries(context.parent.system?.damageType)){
						if(value && !['damage','physical'].includes(value)) data.system.keywords.push(key);
					}
				}
				if(context.parent.system?.effectType){
					for (const [key, value] of Object.entries(context.parent.system?.effectType)){
						if(value) data.system.keywords.push(key);
					}
				}
				if(context.parent.system?.keywordsCustom) data.system.keywordsCustom = context.parent.system?.keywordsCustom;

				if(['equipment','weapon'].includes(context?.parent?.type)){
					foundry.utils.setProperty(data, "flags.dnd4e.effectData.equippedRec", true);
				}
			}
		} catch(e){
			console.error(`Effect default config failed. Please check parent data! ${e}`)
		}
		
		super(data, context);
	}

	/* --------------------------------------------- */
	/**
	 * Returns a HTML string for the active effect tool-tip
	 * @type {string}
	 */
	get tooltip(){
		let html = `<div class="effect-tooltip">`;
		html += `<div><label class="name">${this.name}</label> `;
		if(this?.keywords?.string) html+= `[${this.keywords.string}]</div>`;
		if(this._source.name) html += `<div><label class="source">${game.i18n.localize("DND4E.Source")}: ${this._source.name}</label></div>`;
		if(this.duration.label) html += `<div><label class="duration">${game.i18n.localize("DND4E.Duration")}: ${this.duration.label}</label></div>`;
		if(this.description) html += `<div class="description">${this.description}</div>`;
		html += `</div>`
		return html;
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
		
		// this.otherActorLink(actor, change);
		this.safeEvalEffectValue(actor, change);

		return super.apply(actor, change);
	}

	/* --------------------------------------------- */

	// Work in progress, evaluate from other actors given ID?
	
	otherActorLink(actor, change){
		//Should only be based on terms not the start, cut up the string nad check by terms instead of this garbage
		if(!change.value.startsWith("@actor.")) return;

		const match = change.value.match(/@actor\.(.*?)\@/);

		if(!match || !match[1]) return;
		const targetActor = game.actors.get(match[1])
		if(!targetActor) return;

		change.value.replace(`@actor.${match[1]}@`, '@');
		actor = targetActor;
		
	}
	/* --------------------------------------------- */

	/**
	 * Before passing changes to the parent ActiveEffect class,
	 * we want to make some modifications to make the effect
	 * rolldata aware.
	 * 
	 * @param {Actor} actor     The Actor that is affected by the effect
	 * @param {Object} change    The changeset to be applied with the Effect
	 * @returns 
	 */
	safeEvalEffectValue(actor, change){
		const stringDiceFormat = /\d+d\d+/;
	
		// If the user wants to use the rolldata format
		// for grabbing data keys, why stop them?
		// This is purely syntactic sugar, and for folks
		// who copy-paste values between the key and value
		// fields.
		if (change.key.indexOf('@') === 0)
		  change.key = change.key.replace('@', '');
	  
		// If the user entered a dice formula, I really doubt they're 
		// looking to add a random number between X and Y every time
		// the Effect is applied, so we treat dice formulas as normal
		// strings.
		// For anything else, we use Roll.replaceFormulaData to handle
		// fetching of data fields from the actor, as well as math
		// operations.  
		if (!change.value.match(stringDiceFormat))
		  change.value = Roll.replaceFormulaData(change.value, actor.getRollData());
	  
		// If it'll evaluate, we'll send the evaluated result along 
		// for the change.
		// Otherwise we just send along the exact string we were given. 
		try {
		  change.value = Roll.safeEval(change.value).toString();
		} catch (e) { /* noop */ }
	}

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		const updates = {};

		// Set initial duration data for Actor-owned effects
		if ( this.parent instanceof Actor ) {
			//const updates = {duration: {startTime: game.time.worldTime}, transfer: false, equippedRec: false};
			const durationType = data.system.durationType;
			if (durationType) {
				const durationConfig = CONFIG.DND4E.durationType[durationType].duration;
				for (const [key, value] of Object.entries(durationConfig)) {
					updates[`duration.${key}`] = value;
				}
				
				if (["endOfTargetTurn", "startOfTargetTurn", "endOfUserTurn", "startOfUserTurn"].includes(durationType)) {
					let relevantActor;
					switch (durationType) {
						case "endOfTargetTurn":
						case "startOfTargetTurn":
							relevantActor = this.parent;
							break;
						case "endOfUserTurn":
						case "startOfUserTurn":
							relevantActor = fromUuidSync(this.origin);
							break;
					}
					const combatant = this.start.combat?.getCombatantsByActor(relevantActor)[0];
					if ( combatant && (combatant.turnNumber !== null) ) updates.start = {combatant: combatant.id};
					const decreaseDuration = combatant?.turnNumber > this.start.combat?.turn;
					if ( decreaseDuration ) updates["duration.value"] = durationConfig.value - 1;
				}
			}
			
			updates.transfer = false;
			updates.equippedRec = false;
		}

		if(data.statuses?.length && data.description){
			updates.description = game.i18n.localize(data.description);
		}

		if(Object.keys(updates).length){
			this.updateSource(updates);
		}

	}

	/** @override */
	isExpiryEvent(event, context) {
		const expiry = this.duration.expiry;
		if ( event !== expiry ) return false;
		switch (event) {
			case "dayEnd":
				return context.actor === this.system.actor?.uuid;
			case "save":
				return context.effect === this.id;
			default:
				return super.isExpiryEvent(event, context);
		}
	}

	/* --------------------------------------------- */

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	static onManageActiveEffect(event, target, owner) {
		event.preventDefault();
		const li = target.closest("li");
		const effects = ["Player Character","NPC","Hazard"].includes(owner.type) ? owner.getActiveEffects() : owner.effects.contents;

		const effect = li.dataset.effectId ? effects.find(e => e._id === li.dataset.effectId) : null;
		switch ( target.dataset.activity ) {
			case "create":
				const isActor = owner instanceof Actor;
				return owner.createEmbeddedDocuments("ActiveEffect", [{
					name: isActor ? game.i18n.localize("DND4E.EffectNew") : owner.name,
					img: isActor ? "icons/svg/aura.svg" : owner.img,
					origin: owner.uuid,
					system: { durationType: li.dataset.effectType === "temporary" ? "endOfUserTurn" : undefined },
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
		const durationType = this.system.durationType;
		if(durationType){
			return !!durationType;
		}
		
		return super.isTemporary;
	}

	/**
	 * Describe whether the ActiveEffect is suppressed.
	 * @type {boolean}
	 */
	get isSuppressed() {
		if (super.isSuppressed) return true;
		if ( this.parent instanceof CONFIG.Item.documentClass ){
			//types of items that can be equipped
			const validTypes = ["weapon", "equipment", "tool", "loot", "backpack"];
			if(validTypes.includes(this.parent.type) && this.parent.system.equipped === false){
				return this.flags.dnd4e?.effectData?.equippedRec || false;
			}
			return this.areEffectsSuppressed;
		}
	}

	_prepareDuration(){
		const durationType = this.system.durationType;
		if(durationType){
			return{
				label: this._getDurationLabel(0,0)
			};
		}
		return super._prepareDuration();
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
		const durationType = this.system.durationType;
		if(durationType){
			if(durationType === "endOfTargetTurn") return  game.i18n.localize("DND4E.DurationEndOfTargetTurnSimp");
			else if(durationType === "startOfTargetTurn")  return game.i18n.localize("DND4E.DurationStartOfTargetTurnSimp");

			return game.i18n.localize(CONFIG.DND4E.durationType[durationType].label);
		}

		return super._getDurationLabel(rounds, turns);
	}

	_getIsSave() {
		return this.system.durationType === "saveEnd";
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
				label: game.i18n.localize("DND4E.EffectTemporary"),
				effects: []
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("DND4E.EffectPassive"),
				effects: []
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("DND4E.EffectInactive"),
				effects: []
			},
			suppressed: {
				type: "suppressed",
				label: game.i18n.localize("DND4E.EffectUnavailable"),
				effects: [],
				info: [game.i18n.localize("DND4E.EffectUnavailableInfo")]
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

	/* --------------------------------------------- */

	/**
	 * Returns an object with official and custom keywords
	 * @type {string}
	 */
	get keywords(){
		const keysRef = {...CONFIG.DND4E.damageTypes,...CONFIG.DND4E.effectTypes,...CONFIG.DND4E.powerSource};
		const systemKeywords = this.system.keywords;
		const customString = this.system.keywordsCustom;
		const customKeywords = customString ? customString.split(';') : [];
		
		let keywordLabels = [];
		if(systemKeywords) systemKeywords.forEach((e) => keywordLabels.push(keysRef[e]));
		keywordLabels = [...keywordLabels, ...customKeywords];
		let keywordString = keywordLabels.join(', ');
		
		return {'system': systemKeywords,'custom': customKeywords,'string': keywordString};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source){
		const flags = source.flags?.dnd4e;

		if (!flags) return super.migrateData(source);

		if (flags.effectData?.durationType) {
			source.system.durationType = flags.effectData.durationType;
		}
		delete flags.effectData?.durationType;

        if (flags.effectData?.powerEffectTypes) {
            source.system.powerEffectType = flags.effectData.powerEffectTypes;
        }
        delete flags.effectData?.durationType;

        if (flags.effectData != null && !flags.effectData) delete flags.effectData;

		if (flags.keywords?.length) {
			let keywords = []
			for (const keyword of flags.keywords) {
				keywords.push(keyword)
			}
			source.system.keywords = keywords;
		}
		delete flags.keywords;

		if (flags.dots?.length) {
			let dots = []
			for (const dot of flags.dots) {
				dots.push({
					amount: dot.amount,
					types: new Set(dot.typesArray)
				})
			}
			source.system.dots = dots;
		}
		delete flags.dots;

		if (flags.keywordsCustom) {
			source.system.keywordsCustom = flags.keywordsCustom;
		}
		delete flags.keywordsCustom;

		if (flags.effectData?.saveDC) {
			source.system.saveDC = flags.effectData.saveDC;
		}
		delete flags.effectData?.saveDC;

		return super.migrateData(source);
	}
}
