/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
 export default class ActiveEffect4e extends ActiveEffect {
	constructor(data, context) {
		if(!data.flags?.dnd4e?.dots) foundry.utils.setProperty(data, "flags.dnd4e.dots", new Array);	//Empty array for storing Ongoing Damage instances
		if(!data.flags?.dnd4e?.effectData?.durationType) foundry.utils.setProperty(data, "flags.dnd4e.effectData.durationType", '');
		if (data.id) {
		  foundry.utils.setProperty(data, "flags.core.statusId", data.id);
		  delete data.id;
		}
		try{
			// if(context?.parent?.type === "power"){ //this will not work outside of try catch while initilising
			if(['power','consumable'].includes(context?.parent?.type)){
				data.transfer = false;
				if(!data.flags?.dnd4e?.keywords){
					foundry.utils.setProperty(data, "flags.dnd4e.keywords", new Array);	//Empty array for storing Keywords
					if(context.parent.system?.damageType){
						for (const [key, value] of Object.entries(context.parent.system?.damageType)){
							if(value && !['damage','physical'].includes(value)) data.flags.dnd4e.keywords.push(key);
						}
					}
					if(context.parent.system?.effectType){
						for (const [key, value] of Object.entries(context.parent.system?.effectType)){
							if(value) data.flags.dnd4e.keywords.push(key);
						}
					}
					if(context.parent.system?.keywordsCustom) data.flags.dnd4e.keywordsCustom = context.parent.system?.keywordsCustom;
				}
			}
			if(['equipment','weapon'].includes(context?.parent?.type)){
				foundry.utils.setProperty(data, "flags.dnd4e.effectData.equippedRec", true);
			}
		} catch(e){
			console.error(`Effect default config failed. Please check parent data! ${e}`)
		}
		
		if(!data.flags?.dnd4e?.keywords){
			foundry.utils.setProperty(data, "flags.dnd4e.keywords", new Array);	//Empty array for storing Keywords
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
		html += `<div><label class="name">${this.name}</label> [${this.keywords.string}]</div>`;
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
	 * @param {*} wrapped   The next call in the libWrapper chain
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
		  change.value = Roll.replaceFormulaData(game.helper.commonReplace(change.value, actor), actor.getRollData());
	  
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
			updates.duration = {startTime: game.time.worldTime};
			updates.transfer = false;
			updates.equippedRec = false;

			const duration4e = await this._durationFlags4e({...data,...updates});
			
			/*const combat = game.combat;
			if (combat?.turn != null && combat.turns && combat.turns[combat.turn]) {//if combat has started - combat.turn for the first character = 0 (so cannot use truthy value).  If there are no combatents combat.turns = []
				updates.flags = {dnd4e: { effectData: { startTurnInit: combat.turns[combat.turn].initiative ?? 0}}};
			}*/
			
			updates.flags = {dnd4e: {effectData: duration4e.flags.dnd4e.effectData}};
		}

		if(data.statuses?.length && data.description){
			updates.description = game.i18n.localize(data.description);
		}

		if(Object.keys(updates).length){
			this.updateSource(updates);
		}

	}
	/* --------------------------------------------- */

	/**
	 * Determine whether this Active Effect is suppressed or not.
	 */
	determineSuppression() {
		this.isSuppressed = false;
		if ( this.parent instanceof CONFIG.Item.documentClass ){
			//types of items that can be equipped
			const validTypes = ["weapon", "equipment", "tool", "loot", "backpack"];
			if(validTypes.includes(this.parent.type) && this.parent.system.equipped === false){
				return this.isSuppressed = this.flags.dnd4e?.effectData?.equippedRec || false;
			}
			this.isSuppressed = this.areEffectsSuppressed;
		}
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
		const effects = ["Player Character","NPC","Hazard"].includes(owner.type) ? owner.getActiveEffects() : owner.effects.contents;
		const effect = li.dataset.effectId ? effects.find(e => e._id === li.dataset.effectId) : null;
		switch ( a.dataset.action ) {
			case "create":
				const isActor = owner instanceof Actor;
				return owner.createEmbeddedDocuments("ActiveEffect", [{
					name: isActor ? game.i18n.localize("DND4E.EffectNew") : owner.name,
					img: isActor ? "icons/svg/aura.svg" : owner.img,
					origin: owner.uuid,
					"flags.dnd4e.effectData.durationType": li.dataset.effectType === "temporary" ? "endOfUserTurn" : undefined,
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
		const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
		if(durationType){
			return !!durationType;
		}
		
		return super.isTemporary;
	}

	_prepareDuration(){
		if(["power", "consumable"].includes(this.parent?.type)){
			const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
			if(durationType){
				return{
					label: this._getDurationLabel(0,0)
				};
			}
		}
		
		const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
		if(durationType){

			const d = this.duration;
			const cbt = game.combat;
			if ( !cbt ) return {
				type: "turns",
				_combatTime: undefined
			};

			const c = {round: cbt.round ?? 0, turn: cbt.turn ?? 0, nTurns: cbt.turns.length || 1};
			const current = this._getCombatTime(c.round, c.turn);
			const duration = this._getCombatTime(d.rounds, d.turns);
			const start = this._getCombatTime(d.startRound, d.startTurn, c.nTurns);

			// Some number of remaining rounds and turns (possibly zero)
			const remaining = Math.max(((start + duration) - current).toNearest(0.01), 0);
			const remainingRounds = Math.floor(remaining);
			let remainingTurns = 0;
			if ( remaining > 0 ) {
			let nt = c.turn - d.startTurn;
			while ( nt < 0 ) nt += c.nTurns;
			remainingTurns = nt > 0 ? c.nTurns - nt : 0;
			}

			return {
				type: "turns",
				duration: duration,
				// remaining: remaining,
				remaining: ((d.rounds == null && d.turns == null && d.seconds == null ) ? null : remaining),
				label: this._getDurationLabel(d.rounds, d.turns),
				_combatTime: current
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
		const durationType = this.getFlag("dnd4e", "effectData")?.durationType;
		if(durationType){
			if(durationType === "endOfTargetTurn") return  game.i18n.localize("DND4E.DurationEndOfTargetTurnSimp");
			else if(durationType === "startOfTargetTurn")  return game.i18n.localize("DND4E.DurationStartOfTargetTurnSimp");

			return game.i18n.localize(CONFIG.DND4E.durationType[durationType]);
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
	
	/** Blatantly stolen from Black Flag: fix for core issue
	*   https://github.com/foundryvtt/foundryvtt/issues/11527
	*   Can be removed when the system goes V13-only
	*/	
	_applyUpgrade(actor, change, current, delta, changes){
		if (current === null) return this._applyOverride(actor, change, current, delta, changes);
		
		let update;
		const ct = foundry.utils.getType(current);
		
		switch (ct){
			case "boolean":
			case "number":
				if (change.mode === CONST.ACTIVE_EFFECT_MODES.UPGRADE && delta > current) update = delta;
				else if (change.mode === CONST.ACTIVE_EFFECT_MODES.DOWNGRADE && delta < current) update = delta;
				break;
		}
		if (update !== undefined) changes[change.key] = update;
	}


	/* --------------------------------------------- */
	/**
	 * Returns an object with official and custom keywords
	 * @type {string}
	 */
	get keywords(){
		const keysRef = {...CONFIG.DND4E.damageTypes,...CONFIG.DND4E.effectTypes,...CONFIG.DND4E.powerSource};
		const systemKeywords = this.flags.dnd4e?.keywords || [];
		const customString = this.flags.dnd4e?.keywordsCustom || '';
		const customKeywords = customString ? customString.split(';') : [];
		
		let keywordLabels = [];
		if(systemKeywords) systemKeywords.forEach((e) => keywordLabels.push(keysRef[e]));
		keywordLabels = [...keywordLabels, ...customKeywords];
		let keywordString = keywordLabels.join(', ');
		
		return {'system': systemKeywords,'custom': customKeywords,'string': keywordString};
	}
	
	async _preUpdate(changed,options,user){
		if(this.modifiesActor && (changed?.flags?.dnd4e?.effectData?.durationType != this?.flags?.dnd4e?.effectData?.durationType || changed?.duration?.turns != this?.duration?.turns || changed?.duration?.rounds != this?.duration?.rounds)){
			changed = this._durationFlags4e(changed);
		}
		return super._preUpdate(changed,options,user);
	}
	
	async _durationFlags4e(updates = {}) {		
		if(updates.flags?.dnd4e?.effectData?.durationType){
			// Re-calc duration data for Actor-owned effects
			try{
				const combat = game.combat;		
			
				if (combat?.turn != null && combat.turns && combat.turns[combat.turn]) {
				//if combat has started - combat.turn for the first character = 0 (so cannot use truthy value).  If there are no combatents combat.turns = []
					if(!updates.flags.dnd4e.effectData?.startTurnInit) updates.flags.dnd4e.effectData.startTurnInit = combat?.turns[combat?.turn]?.initiative || -1;
					let userInit;
					let targetInit;
					
					if(this?.origin){
						if(this.origin.includes('Token')){
							const originId = this.origin.replace(/.*Token\.([^\.]*)\..*/,'$1');
							userInit = game.helper.getInitiativeByToken(originId);
						}else if(this.origin.includes('Actor')){
							const originId = this.origin.replace(/.*Actor\.([^\.]*)*/,'$1');
							const combatant = combat.getCombatantsByActor(originId)[0];
							if(combatant) userInit = combatant.initiative;
						}
						
						if(this?.parent.id != this?.origin){
							let targetTokenId;
							if(this?.parent?.parent instanceof Actor){ //For effects from chat cards, the parent is the item, so we want the grandparent
								targetTokenId = game.helper.getTokenIdForLinkedActor(this.parent.parent);
							}else if(this?.parent instanceof Actor){ //Otherwise the parent should be the owner
								targetTokenId = game.helper.getTokenIdForLinkedActor(this.parent);
							}
							if(targetTokenId) targetInit = game.helper.getInitiativeByToken(targetTokenId);
						}
					}
					
					const currentInit = game.helper.getCurrentTurnInitiative();
					
					if((updates.flags.dnd4e.effectData.durationType === "endOfTargetTurn" || updates.flags.dnd4e.effectData.durationType === "startOfTargetTurn") && targetInit){
						updates.flags.dnd4e.effectData.durationRound = combat? currentInit > targetInit ? combat.round : combat.round + 1 : 0;
						updates.flags.dnd4e.effectData.durationTurnInit = targetInit;						
					}
					else if((updates.flags.dnd4e.effectData.durationType === "endOfUserTurn" || updates.flags.dnd4e.effectData.durationType === "startOfUserTurn" ) && userInit){
						updates.flags.dnd4e.effectData.durationRound = combat? currentInit > userInit ? combat.round : combat.round + 1 : 0;
						updates.flags.dnd4e.effectData.durationTurnInit = userInit;
					}
					else if(updates.flags.dnd4e.effectData.durationType === "endOfUserCurrent" && userInit) {
						updates.flags.dnd4e.effectData.durationRound = combat? combat.round : 0;
						updates.flags.dnd4e.effectData.durationTurnInit = combat? currentInit : 0;
					}
					else if(updates.flags.dnd4e.effectData.durationType === "custom" && (updates.duration.rounds || updates.duration.turns)){
						updates.flags.dnd4e.effectData.durationRound = (this.duration.startRound || 1) + (updates.duration.rounds || 0 );
						if(!updates.duration.turns){
							updates.flags.dnd4e.effectData.durationTurnInit = updates.flags.dnd4e.effectData.startTurnInit;
						}else{
							let initIndex = updates.duration.turns - 1;
							for (const [i, turn] of combat.turns.entries()) {
								if (turn?.initiative == updates.flags.dnd4e.effectData.startTurnInit) initIndex += i;
							}
							initIndex = Math.min(Math.max(initIndex,0),combat.turns.length-1);
							updates.flags.dnd4e.effectData.durationTurnInit = combat.turns[initIndex].initiative;
						}
					}else{
						updates.flags.dnd4e.effectData.durationRound = '';
						updates.flags.dnd4e.effectData.durationTurnInit = '';
					}
				}
			}catch(e){
				console.error(`Effect expiry calculation failed. Please check the input data. ${e}`);
				updates.flags.dnd4e.effectData.durationRound = '';
				updates.flags.dnd4e.effectData.durationTurnInit = '';
			}
		}
		return updates;
	}
}
