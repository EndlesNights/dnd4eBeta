/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
 export default class ActiveEffect4e extends ActiveEffect {
	constructor(data, context) {
		if(!data.flags?.dnd4e?.dots){
			foundry.utils.setProperty(data, "flags.dnd4e.dots", new Array);	//Empty array for storing Ongoing Damage instances
		}
		if (data.id) {
		  foundry.utils.setProperty(data, "flags.core.statusId", data.id);
		  delete data.id;
		}
		try{
			
			// if(context?.parent?.type === "power"){ //this will not work outside of try catch while initilising
			if(["power", "consumable"].includes(context?.parent?.type)){
				data.transfer = false;
			}
		} catch{

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
		html += `<div><label class="name">${this.name}</label></div>`;
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
			// const updates = {duration: {startTime: game.time.worldTime}, transfer: false, equippedRec: false};
			updates.duration = {startTime: game.time.worldTime};
			updates.transfer = false;
			updates.equippedRec = false;

			const combat = game.combat;
			if (combat?.turn != null && combat.turns && combat.turns[combat.turn]) {//if combat has started - combat.turn for the first character = 0 (so cannot use truthy value).  If there are no combatents combat.turns = []
				updates.flags = {dnd4e: { effectData: { startTurnInit: combat.turns[combat.turn].initiative ?? 0}}};
			}
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
		const originArray = this.origin?.split(".");

		if ( this.disabled || !originArray || originArray[0] == "Actor" || originArray.indexOf("Item") < 0 ) return;
		
		const item = this.parent;
		if ( !item ) return;

		//types of items that can be equipped
		const validTypes = ["weapon", "equipment", "tool", "loot", "backpack"];
		if(validTypes.includes(item.type) && item.system.equipped === false){
			this.isSuppressed = this.flags.dnd4e?.effectData?.equippedRec || false;
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
		const effects = ["Player Character", "NPC"].includes(owner.type) ? owner.getActiveEffects() : owner.effects.contents;
		const effect = li.dataset.effectId ? effects.find(e => e._id === li.dataset.effectId) : null;
		switch ( a.dataset.action ) {
			case "create":
				const isActor = owner instanceof Actor;
				return owner.createEmbeddedDocuments("ActiveEffect", [{
					name: isActor ? game.i18n.localize("DND4E.EffectNew") : owner.name,
					img: isActor ? "icons/svg/aura.svg" : owner.img,
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
}
