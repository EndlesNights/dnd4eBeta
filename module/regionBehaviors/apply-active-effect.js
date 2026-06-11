// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

const { DocumentUUIDField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * @typedef ApplyActiveEffectRegionBehaviorSystemData
 * @property {Set<string>} effects       UUIDs of effects to apply.
 * @property {Set<number>} dispositions  If not empty, only apply effects to tokens with these dispositions.
 * @property {Set<string>} origins       If not empty, only apply effects to tokens with these creature origins.
 * @property {Set<string>} types         If not empty, only apply effects to tokens with these creature types.
 */

/**
 * The data model for a region behavior that applies active effects to certain tokens.
 * @extends {foundry.data.regionBehaviors.RegionBehaviorType<ApplyActiveEffectRegionBehaviorSystemData>}
 * @mixes ApplyActiveEffectRegionBehaviorSystemData
 */
export default class ApplyActiveEffect4eRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

	/** @override */
	static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.ApplyActiveEffect"];

	/* ---------------------------------------- */

	/** @override */
	static defineSchema() {
		const dispositions = { ...foundry.applications.sheets.TokenConfig.TOKEN_DISPOSITIONS };
		delete dispositions[CONST.TOKEN_DISPOSITIONS.SECRET];
		return {
			effects: new SetField(new DocumentUUIDField({ type: "ActiveEffect", nullable: false })),
			dispositions: new SetField(new NumberField({ choices: dispositions })),
			origins: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureOrigin })),
			types: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureType })),
		};
	}

	/* ---------------------------------------- */
	/*  Methods                                 */
	/* ---------------------------------------- */

	/**
   * Check the conditions to decide if effects should be added to this token.
   * @param {TokenDocument4e} token  The token to which to add the effects.
   * @returns {boolean}
   */
	#evaluateConditions(token) {
		if (this.dispositions.size && !this.dispositions.has(token.disposition)) return false;
		if (this.origins.size && !this.origins.has(token.actor.system.details?.origin)) return false;
		if (this.types.size && !this.types.has(token.actor.system.details?.type)) return false;
		return true;
	}

	/* ---------------------------------------- */

	/**
   * Apply the Active Effects when the Token enters the Region.
   * @param {RegionTokenEnterEvent} event
   * @this {ApplyActiveEffect4eRegionBehaviorType}
   */
	static async #onTokenEnter(event) {
		if (!event.user.isSelf) return;
		const { token, movement } = event.data;
		const actor = token.actor;
		if (!actor || !this.#evaluateConditions(token)) return;
		const resumeMovement = movement ? token.pauseMovement() : undefined;
		const effects = await Promise.all(this.effects.map(fromUuid));
		const toCreate = [];
		for (const effect of effects) {
			const data = effect.toObject();
			delete data._id;
			if (effect.compendium) {
				data._stats.duplicateSource = null;
				data._stats.compendiumSource = effect.uuid;
			} else {
				data._stats.duplicateSource = effect.uuid;
				data._stats.compendiumSource = null;
			}
			data._stats.exportSource = null;
			data.origin = this.parent.uuid;
			toCreate.push(data);
		}
		if (toCreate.length) await actor.createEmbeddedDocuments("ActiveEffect", toCreate);
		await resumeMovement?.();
	}

	/* ---------------------------------------- */

	/**
   * Un-apply the Active Effects when the Token exists the Region.
   * @param {RegionTokenExitEvent} event
   * @this {ApplyActiveEffect4eRegionBehaviorType}
   */
	static async #onTokenExit(event) {
		if (!event.user.isSelf) return;
		const { token, movement } = event.data;
		const actor = token.actor;
		if (!actor) return;
		const toDelete = [];
		for (const effect of actor.effects) {
			if (effect.origin === this.parent.uuid) {
				toDelete.push(effect.id);
			}
		}
		if (!toDelete.length) return;
		const resumeMovement = movement ? token.pauseMovement() : undefined;
		await actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
		await resumeMovement?.();
	}

	/* ---------------------------------------- */

	/** @override */
	static events = {
		[CONST.REGION_EVENTS.TOKEN_ENTER]: this.#onTokenEnter,
		[CONST.REGION_EVENTS.TOKEN_EXIT]: this.#onTokenExit,
	};
}
