// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

/**
 * @import { TokenMeasureMovementPathOptions, TokenMovementActionCostFunction } from "@client/_types.mjs";
 */

/**
 * Extend the base TokenDocument class to implement system-specific HP bar logic.
 */
export default class TokenDocument4e extends TokenDocument {

	/**
	 * Cached sense-derived overrides, used to skip vision re-derivation when senses are unchanged.
	 * @type {{ sight: object, detectionModes: Record<string, number> }}
	 */
	#senseOverrides;

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Is the dynamic token ring enabled?
	 * @type {boolean}
	 */
	get hasDynamicRing() {
		return this.ring.enabled;
	}

	/* -------------------------------------------- */
	/*  Data Preparation                            */
	/* -------------------------------------------- */

	/** @inheritDoc */
	_prepareDetectionModes() {
		// Set sight & sense detection modes before calling super so basicSight is seeded from the derived sight range.
		this._applySenseVision();
		super._prepareDetectionModes();
	}

	/* -------------------------------------------- */

	/**
	 * Derive token sight range and detection modes from the actor's senses.
	 * @protected
	 */
	_applySenseVision() {
		if (!game.settings.get("dnd4e", "senseVisionSync")) return;
		const senses = this.actor?.system?.senses?.special;
		if (senses) TokenDocument4e.applySenseOverrides(senses, this);
	}

	/* -------------------------------------------- */

	/**
	 * Compute sense-derived sight and detection mode data from actor senses.
	 * @param {object} senses                          Object containing sense ranges.
	 * @returns {{ sight: object, detectionModes: Record<string, number> }}
	 */
	static computeSenseOverrides(senses) {
		const detectionModes = {};
		let maxSightRange = -Infinity;
		let sightVisionMode = null;

		for (const [key, config] of Object.entries(CONFIG.DND4E.senses)) {
			if (!senses[key]?.value) continue;
			const range = config.range ?? senses[key]?.range ?? Infinity;

			if (config.detectionMode) detectionModes[config.detectionMode] = range;

			if (config.grantsSight && (range > maxSightRange)) {
				maxSightRange = range;
				sightVisionMode = config.visionMode ?? null;
			}
		}

		const sight = maxSightRange > -Infinity
			? { enabled: true, range: maxSightRange, visionMode: sightVisionMode ?? "basic" }
			: {};

		return { sight, detectionModes };
	}

	/* -------------------------------------------- */

	/**
	 * Apply sense-derived overrides to a token-like target's prepared data.
	 * @param {object} senses                         Object containing sense ranges.
	 * @param {object} target                         Target with `sight` and `detectionModes` properties.
	 */
	static applySenseOverrides(senses, target) {
		const { sight, detectionModes } = TokenDocument4e.computeSenseOverrides(senses);

		for (const [id, range] of Object.entries(detectionModes)) {
			const existing = target.detectionModes[id];
			if (existing) Object.assign(existing, { enabled: true, range });
			else target.detectionModes[id] = { enabled: true, range };
		}

		if (Object.keys(sight).length) {
			Object.assign(target.sight, sight);
		}
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Movement                                    */
	/* -------------------------------------------- */

	/**
	 * Set up the system's movement action customization.
	 */
	static registerMovementActions() {
		for (const type of Object.keys(CONFIG.DND4E.movementTypes)) {
			const actionConfig = CONFIG.Token.movement.actions[type];
			if (!actionConfig) continue;
			actionConfig.getAnimationOptions = token => {
				if (type === "teleport") return { duration: 0 };
				if (token?.actor?.statuses.has("prone")) return { movementSpeed: CONFIG.Token.movement.defaultSpeed / 2 };
				const actorMovement = token?.actor?.system.movement ?? {};
				if (!(type in actorMovement) || actorMovement[type]?.value) return {};
				return { movementSpeed: CONFIG.Token.movement.defaultSpeed / 2 };
			};
			actionConfig.getCostFunction = (...args) => this.getMovementActionCostFunction(type, ...args);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Return the movement action cost function for a specific movement type.
	 * @param {string} type
	 * @param {TokenDocument4e} token
	 * @param {TokenMeasureMovementPathOptions} options
	 * @returns {TokenMovementActionCostFunction}
	 */
	static getMovementActionCostFunction(type, token, options) {
		const { actor } = token;
		const actorMovement = actor?.system.movement;
		const walkFallback = CONFIG.DND4E.movementTypes[type]?.walkFallback;
		const hasMovement = actorMovement !== undefined;
		const speed = actorMovement?.[type].value;
		return !["Player Character", "NPC"].includes(actor?.type) || !hasMovement || speed || (!speed && !walkFallback)
			? cost => cost
			: (cost, _from, _to, distance) => cost + distance;
	}

	/* -------------------------------------------- */
	/*  Ring Animations                             */
	/* -------------------------------------------- */

	/**
	 * Determine if any rings colors should be forced based on current status.
	 * @returns {{[ring]: number, [background]: number}}
	 */
	getRingColors() {
		const colors = {};
		if (this.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)) {
			colors.ring = CONFIG.DND4E.tokenRingColors.defeated;
		}
		return colors;
	}

	/* -------------------------------------------- */

	/**
	 * Determine what ring effects should be applied on top of any set by flags.
	 * @returns {string[]}
	 */
	getRingEffects() {
		const e = foundry.canvas.placeables.tokens.TokenRing.effects;
		const effects = [];
		if (this.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)) effects.push(e.INVISIBILITY);
		else if (this === game.combat?.combatant?.token) effects.push(e.RING_GRADIENT);
		return effects;
	}

	/* -------------------------------------------- */

	/**
	 * Flash the token ring based on damage, healing, or temp HP.
	 * @param {string} type     The key to determine the type of flashing.
	 */
	flashRing(type, pct, isDamage) {
		if (!this.rendered) return;
		const color = CONFIG.DND4E.tokenRingColors[type];
		if (!color) return;
		const options = {};
		options.duration = 500 + pct * 2000;
		if (isDamage) {
			options.easing = foundry.canvas.placeables.tokens.TokenRing.easeTwoPeaks;
		}
		else {
			options.easing = foundry.canvas.placeables.tokens.TokenRing.easePingPong;
		}
		return this.object.ring?.flashColor(Color.from(color), options);
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onRelatedUpdate(update = {}, operation = {}) {
		super._onRelatedUpdate(update, operation);
		if (!game.settings.get("dnd4e", "senseVisionSync")) return;
		const senses = this.actor?.system?.senses?.special;
		if (!senses) return;

		// Re-derive vision whenever sense-granting data changes, covering direct edits and item/effect-granted senses.
		const overrides = TokenDocument4e.computeSenseOverrides(senses);
		if (foundry.utils.equals(overrides, this.#senseOverrides)) return;
		this.#senseOverrides = overrides;
		if (!this.parent?.isView) return;
		this.reset();
		this.object?.initializeVisionSource();
	}
}
