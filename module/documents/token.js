// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

/**
 * Extend the base TokenDocument class to implement system-specific HP bar logic.
 */
export default class TokenDocument4e extends TokenDocument {

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
	/*  Movement                                    */
	/* -------------------------------------------- */

	/**
	 * Set up the system's movement action customization.
	 */
	static registerMovementActions() {
		for ( const type of Object.keys(CONFIG.DND4E.movementTypes) ) {
			const actionConfig = CONFIG.Token.movement.actions[type];
			if ( !actionConfig ) continue;
			actionConfig.getAnimationOptions = token => {
				if (type === 'teleport') return { duration: 0 };
				if (token?.actor?.statuses.has('prone')) return { movementSpeed: CONFIG.Token.movement.defaultSpeed / 2 };
				const actorMovement = token?.actor?.system.movement ?? {};
				if ( !(type in actorMovement) || actorMovement[type]?.value ) return {};
				return { movementSpeed: CONFIG.Token.movement.defaultSpeed / 2 };
			};
			actionConfig.getCostFunction = (...args) => this.getMovementActionCostFunction(type, ...args);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Return the movement action cost function for a specific movement type.
	 * @param {string} type
	 * @param {TokenDocument5e} token
	 * @param {TokenMeasureMovementPathOptions} options
	 * @returns {TokenMovementActionCostFunction}
	 */
	static getMovementActionCostFunction(type, token, options) {
		const { actor } = token;
		const actorMovement = actor?.system.movement;
		const walkFallback = CONFIG.DND4E.movementTypes[type]?.walkFallback;
		const hasMovement = actorMovement !== undefined;
		const speed = actorMovement?.[type].value;
		return !["Player Character","NPC"].includes(actor?.type) || !hasMovement || speed || (!speed && !walkFallback)
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
		if ( this.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED) ) {
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
		if ( this.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE) ) effects.push(e.INVISIBILITY);
		else if ( this === game.combat?.combatant?.token ) effects.push(e.RING_GRADIENT);
		return effects;
	}

	/* -------------------------------------------- */

	/**
	 * Flash the token ring based on damage, healing, or temp HP.
	 * @param {string} type     The key to determine the type of flashing.
	 */
	flashRing(type, pct, isDamage) {
		if ( !this.rendered ) return;
		const color = CONFIG.DND4E.tokenRingColors[type];
		if ( !color ) return;
		const options = {};
		options.duration = 500 + pct * 2000;
		if ( isDamage ) {
			options.easing = foundry.canvas.placeables.tokens.TokenRing.easeTwoPeaks;
		}
		else {
			options.easing = foundry.canvas.placeables.tokens.TokenRing.easePingPong;
		}
		return this.object.ring?.flashColor(Color.from(color), options);
	}
}