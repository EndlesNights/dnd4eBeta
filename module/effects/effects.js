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
		try {
			// if(context?.parent?.type === "power"){ //this will not work outside of try catch while initilising
			if (["power", "consumable"].includes(context?.parent?.type)) {
				data.transfer = false;

				if (context.parent.system?.damageType) {
					for (const [key, value] of Object.entries(context.parent.system?.damageType)) {
						if (value && !["damage", "physical"].includes(value)) data.system.keywords.push(key);
					}
				}
				if (context.parent.system?.effectType) {
					for (const [key, value] of Object.entries(context.parent.system?.effectType)) {
						if (value) data.system.keywords.push(key);
					}
				}
				if (context.parent.system?.keywordsCustom) data.system.keywordsCustom = context.parent.system?.keywordsCustom;

				if (["equipment", "weapon"].includes(context?.parent?.type)) {
					data.system.equippedRec = true;
				}
			}
		} catch(e) {
			console.error(`Effect default config failed. Please check parent data! ${e}`);
		}
		
		super(data, context);
	}

	/* --------------------------------------------- */
	/**
	 * Returns a HTML string for the active effect tool-tip
	 * @type {string}
	 */
	get tooltip() {
		let html = "<div class=\"effect-tooltip\">";
		html += `<div><label class="name">${this.name}</label> `;
		if (this?.keywords?.string) html += `[${this.keywords.string}]</div>`;
		if (this._source.name) html += `<div><label class="source">${_loc("DND4E.Source")}: ${this._source.name}</label></div>`;
		if (this.duration.label) html += `<div><label class="duration">${_loc("DND4E.Duration")}: ${this.duration.label}</label></div>`;
		if (this.description) html += `<div class="description">${this.description}</div>`;
		html += "</div>";
		return html;
	}

	/* --------------------------------------------- */

	// Work in progress, evaluate from other actors given ID?
	
	/*otherActorLink(actor, change) {
		//Should only be based on terms not the start, cut up the string nad check by terms instead of this garbage
		if (!change.value.startsWith("@actor.")) return;

		const match = change.value.match(/@actor\.(.*?)\@/);

		if (!match || !match[1]) return;
		const targetActor = game.actors.get(match[1]);
		if (!targetActor) return;

		change.value.replace(`@actor.${match[1]}@`, "@");
		actor = targetActor;
		
	}*/

	/* --------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		const updates = {};

		// Set initial duration data for Actor-owned effects
		if (this.parent instanceof Actor) {
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
					if (combatant && (combatant.turnNumber !== null)) updates.start = { combatant: combatant.id };
					const decreaseDuration = combatant?.turnNumber > this.start.combat?.turn;
					if (decreaseDuration) updates["duration.value"] = durationConfig.value - 1;
				}
			}
			
			updates.transfer = false;
		}

		if (data.statuses?.length && data.description) {
			updates.description = _loc(data.description);
		}

		if (Object.keys(updates).length) {
			this.updateSource(updates);
		}

	}

	/** @override */
	isExpiryEvent(event, context) {
		const expiry = this.duration.expiry;
		if (event !== expiry) return false;
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
		const effects = ["Player Character", "NPC", "Hazard"].includes(owner.type) ? owner.getActiveEffects() : owner.effects.contents;

		const effect = li.dataset.effectId ? effects.find(e => e._id === li.dataset.effectId) : null;
		const isActor = owner instanceof Actor;
		switch (target.dataset.activity) {
			case "create":
				return owner.createEmbeddedDocuments("ActiveEffect", [{
					name: isActor ? _loc("DND4E.EffectNew") : owner.name,
					img: isActor ? "icons/svg/aura.svg" : owner.img,
					origin: owner.uuid,
					system: { durationType: li.dataset.effectType === "temporary" ? "endOfUserTurn" : undefined },
					disabled: li.dataset.effectType === "inactive",
				}]);
			case "edit":
				return effect.sheet.render(true);
			case "delete":
				return effect.delete();
			case "toggle":
				return effect.update({ disabled: !effect.disabled });
		}
	}

	/* -------------------------------------------- */

	/**
	 * Describe whether the ActiveEffect has a temporary duration based on combat turns or rounds.
	 * @type {boolean}
	 */
	get isTemporary() {
		const durationType = this.system.durationType;
		if (durationType) {
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
		if (this.parent instanceof CONFIG.Item.documentClass) {
			//types of items that can be equipped
			const validTypes = ["weapon", "equipment", "tool", "loot", "backpack"];
			if (validTypes.includes(this.parent.type) && (this.parent.system.equipped === false)) {
				return this.system.equippedRec || false;
			}
			return this.areEffectsSuppressed;
		}
		return false;
	}

	_prepareDuration() {
		const duration = super._prepareDuration();
		const durationType = this.system.durationType;
		if (durationType && (durationType !== "custom")) {
			duration.label = this._getDurationLabel(durationType);
		}
		return duration;
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
	_getDurationLabel(durationType) {
		if (durationType === "endOfTargetTurn") return _loc("DND4E.DurationEndOfTargetTurnSimp");
		else if (durationType === "startOfTargetTurn") return _loc("DND4E.DurationStartOfTargetTurnSimp");

		return CONFIG.DND4E.durationType[durationType].label;
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
				label: _loc("DND4E.EffectTemporary"),
				effects: [],
			},
			passive: {
				type: "passive",
				label: _loc("DND4E.EffectPassive"),
				effects: [],
			},
			inactive: {
				type: "inactive",
				label: _loc("DND4E.EffectInactive"),
				effects: [],
			},
			suppressed: {
				type: "suppressed",
				label: _loc("DND4E.EffectUnavailable"),
				effects: [],
				info: [_loc("DND4E.EffectUnavailableInfo")],
			},
		};

		// Iterate over active effects, classifying them into categories
		for (let e of effects) {
			if (e.isSuppressed) categories.suppressed.effects.push(e);
			else if (e.disabled) categories.inactive.effects.push(e);
			else if (e.isTemporary) categories.temporary.effects.push(e);
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
	get keywords() {
		const keysRef = { ...CONFIG.DND4E.damageTypes, ...CONFIG.DND4E.effectTypes, ...CONFIG.DND4E.powerSource };
		const systemKeywords = this.system.keywords;
		const customString = this.system.keywordsCustom;
		const customKeywords = customString ? customString.split(";") : [];
		
		let keywordLabels = [];
		if (systemKeywords) systemKeywords.forEach((e) => keywordLabels.push(keysRef[e]));
		keywordLabels = [...keywordLabels, ...customKeywords];
		let keywordString = keywordLabels.join(", ");
		
		return { system: systemKeywords, custom: customKeywords, string: keywordString };
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		const flags = source.flags?.dnd4e;

		if (!flags) return super.migrateData(source);

		if (flags.effectData?.durationType) {
			source.system.durationType = flags.effectData.durationType;
		}
		delete flags.effectData?.durationType;

		if (flags.effectData?.powerEffectTypes) {
			source.system.powerEffectType = flags.effectData.powerEffectTypes;
		}
		delete flags.effectData?.powerEffectType;

		if (flags.effectData?.equippedRec) {
			source.system.equippedRec = flags.effectData.equippedRec;
		}
		delete flags.effectData?.equippedRec;

		if (("effectData" in flags) && !flags.effectData) delete flags.effectData;

		if (flags.keywords?.length) {
			let keywords = [];
			for (const keyword of flags.keywords) {
				keywords.push(keyword);
			}
			source.system.keywords = keywords;
		}
		delete flags.keywords;

		if (flags.dots?.length) {
			let dots = [];
			for (const dot of flags.dots) {
				dots.push({
					amount: dot.amount,
					types: new Set(dot.typesArray),
				});
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
