// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

/**
 * Extend the base Token class to implement additional system-specific logic.
 */
export default class Token4e extends foundry.canvas.placeables.Token {

	/**
	 * Update the token ring when this token is targeted.
	 * @param {User} user         The user whose targeting has changed.
	 * @param {Token4e} token       The token that was targeted.
	 * @param {boolean} targeted    Is the token targeted or not?
	 */
	static onTargetToken(user, token, targeted) {
		if ( !targeted ) return;
		if ( !token.hasDynamicRing ) return;
		const color = Color.from(user.color);
		token.ring.flashColor(color, { duration: 500, easing: token.ring.constructor.easeTwoPeaks });
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_drawBar(number, bar, data) {
		if ( data.attribute === "attributes.hp" ) return this._drawHPBar(number, bar, data);
		return super._drawBar(number, bar, data);
	}

	/* -------------------------------------------- */

	/**
	 * Specialized drawing function for HP bars.
	 * @param {number} number      The Bar number
	 * @param {PIXI.Graphics} bar  The Bar container
	 * @param {object} data        Resource data for this bar
	 * @private
	 */
	_drawHPBar(number, bar, data) {

		// Extract health data
		let {value, max} = this.document.actor.system.attributes.hp;
		let temp = this.document.actor.system.attributes.temphp.value;
		temp = Number(temp || 0);

		// Allocate percentages of the total
		const tempPct = Math.clamp(temp, 0, max) / max;
		const colorPct = Math.clamp(value, 0, max) / max;

		function getHPColor(current, max) {
			const pct = Math.clamp(current, 0, max) / max;
			return Color.fromRGB([(1-(pct/2)), pct, 0]);
		}
		const hpColor = getHPColor(value, max);

		// Determine colors to use
		const blk = 0x000000;
		const c = CONFIG.DND4E.tokenHPColors;

		// Determine the container size (logic borrowed from core)
		let s = canvas.dimensions.uiScale;
		const bw = this.w;
		const bh = 8 * (this.document.height >= 2 ? 1.5 : 1) * s;
		const bs = s;
		const bs1 = bs + s;

		// Overall bar container
		bar.clear();
		bar.beginFill(blk, 0.5).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, bw, bh, 3 * s);

		// Health bar
		if ( value >= 0 ) {
			bar.beginFill(hpColor, 1.0).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, colorPct * bw, bh, 2 * s);
		} else {
			let bloodied = this.document.actor.system.details.bloodied;
			const dyingPct = Math.clamp(Math.abs(value), 0, bloodied) / bloodied;
			const dyingColor = Color.fromRGB([(1-(dyingPct/(1.5))), 0, 0])
			bar.beginFill(dyingColor, 1.0).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, dyingPct * bw, bh, 2 * s);
		}

		// Temporary hit points
		if ( temp > 0 ) {
			bar.beginFill(c.temp, 1.0).lineStyle(0).drawRoundedRect(bs1, bs1, (tempPct * bw) - (2 * bs1), bh - (2 * bs1), s);
		}

		// Set position
		let posY = (number === 0) ? (this.h - bh) : 0;
		bar.position.set(0, posY);
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onApplyStatusEffect(statusId, active) {
		const applicableEffects = [CONFIG.specialStatusEffects.DEFEATED, CONFIG.specialStatusEffects.INVISIBLE];
		if ( applicableEffects.includes(statusId) && this.hasDynamicRing ) {
			this.renderFlags.set({refreshRingVisuals: true});
		}
		super._onApplyStatusEffect(statusId, active);
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_configureFilterEffect(statusId, active) {
		if ( (statusId === CONFIG.specialStatusEffects.INVISIBLE) && this.hasDynamicRing ) active = false;
		return super._configureFilterEffect(statusId, active);
	}

	/* -------------------------------------------- */

	/** @override */
	getRingColors() {
		return this.document.getRingColors();
	}

	/* -------------------------------------------- */

	/** @override */
	getRingEffects() {
		return this.document.getRingEffects();
	}
}