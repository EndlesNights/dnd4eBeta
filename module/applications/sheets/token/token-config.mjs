import TraitSelectorValues from "../../apps/trait-selector-sense.mjs";

/**
 * Custom token configuration application for handling synced senses.
 */
export class TokenConfig4e extends foundry.applications.sheets.TokenConfig {

	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);
		if (!this.rendered) return;
		this._applySenseSyncNotice(this.element);
	}

	/* -------------------------------------------- */

	/**
   * Lock the Vision tab fields that are derived from the actor's senses and surface a sync notice.
   * @param {HTMLElement} html  The rendered markup.
   * @protected
   */
	_applySenseSyncNotice(html) {
		if (!game.settings.get("dnd4e", "senseVisionSync")) return;
		const actor = this.actor ?? this.object?.actor;
		const senses = actor?.system?.senses?.special;
		if (!senses) return;

		const { sight, detectionModes } = CONFIG.Token.documentClass.computeSenseOverrides(senses);
		if (!sight.enabled && foundry.utils.isEmpty(detectionModes)) return;

		// Lock sight to the derived values; these bind to source, so they would otherwise show stale, editable data.
		if (sight.enabled) {
			const range = html.querySelector("[name=\"sight.range\"]");
			const mode = html.querySelector("[name=\"sight.visionMode\"]");
			if (range) Object.assign(range, { value: sight.range, disabled: true });
			if (mode) Object.assign(mode, { value: sight.visionMode, disabled: true });
		}

		// Surface a notice atop the Vision tab linking to the senses config.
		const tab = html.querySelector("[data-application-part=\"vision\"]");
		if (!tab || tab.querySelector(".sense-sync-notice")) return;
		const link = `<a data-action="editSenses">${_loc("SETTINGS.4eSenseVisionSenses")}</a>`;
		const notice = document.createElement("p");
		notice.className = "hint sense-sync-notice";
		notice.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${
			_loc("SETTINGS.4eSenseVisionNotice", { senses: link })}`;
		notice.querySelector("[data-action=editSenses]")?.addEventListener("click", () => {
			const options = { name: "system.senses.special", window: { title: _loc("DND4E.SpecialSenses") }, choices: CONFIG.DND4E["senses"] };
			new TraitSelectorValues({ document: actor, ...options }).render(true, { force: true });
		});
		tab.prepend(notice);
	}
}

/**
 * Custom prototype token configuration application for handling synced senses.
 */
export class PrototypeTokenConfig4e extends foundry.applications.sheets.PrototypeTokenConfig {
	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);
		if (!this.rendered) return;
		TokenConfig4e.prototype._applySenseSyncNotice.call(this, this.element);
	}
}
