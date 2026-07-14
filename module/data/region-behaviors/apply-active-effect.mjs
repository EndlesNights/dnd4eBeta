// Adapted from the Foundry Virtual Tabletop - Dungeons & Dragons Fifth Edition Game System licensed under the MIT license

const { DocumentUUIDField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * @import { ActiveEffect4e, Actor4e } from "../../documents/_module.mjs";
 * @import { ApplyActiveEffectRegionBehaviorSystemData } from "./_types.mjs"; 
 * @import { ActiveEffectData } from "../active-effect/_module.mjs";
 */

/**
 * The data model for a region behavior that applies active effects to certain tokens.
 * @extends {foundry.data.regionBehaviors.RegionBehaviorType<ApplyActiveEffectRegionBehaviorSystemData>}
 * @mixes ApplyActiveEffectRegionBehaviorSystemData
 */
export default class ApplyActiveEffect4eRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.ApplyActiveEffect"];

	/* ---------------------------------------- */

	/** @inheritDoc */
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
   * @this {ApplyActiveEffect4eRegionBehaviorType}
   * @param {RegionTokenEnterEvent} event
   */
	static async #onTokenEnter(event) {
		if (!event.user.isSelf) return;
		const { token, movement } = event.data;
		const actor = token.actor;
		if (!actor || !this.#evaluateConditions(token)) return;
		const resumeMovement = movement ? token.pauseMovement() : undefined;
		const effects = await Promise.all(this.effects.map(fromUuid));
		const toCreate = this.#getEffectsToCreate(actor, effects);
		if (toCreate.length) await actor.createEmbeddedDocuments("ActiveEffect", toCreate);
		await resumeMovement?.();
	}

	/* ---------------------------------------- */

	/**
   * Un-apply the Active Effects when the Token exits the Region.
   * @this {ApplyActiveEffect4eRegionBehaviorType}
   * @param {RegionTokenExitEvent} event
   */
	static async #onTokenExit(event) {
		if (!event.user.isSelf) return;
		const { token, movement } = event.data;
		const actor = token.actor;
		if (!actor) return;
		const toDelete = this.#getEffectsToDelete(actor);
		if (!toDelete.length) return;
		const resumeMovement = movement ? token.pauseMovement() : undefined;
		await actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
		await resumeMovement?.();
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	static events = {
		[CONST.REGION_EVENTS.TOKEN_ENTER]: this.#onTokenEnter,
		[CONST.REGION_EVENTS.TOKEN_EXIT]: this.#onTokenExit,
	};

	/* ---------------------------------------- */

	/** @inheritDoc */
	_onUpdate(changed, options, userId) {
		super._onUpdate(changed, options, userId);
		if (!this.behavior.active || !("system" in changed)) return;
		this.#recreateEffectsForAllTokens();
	}

	/* ---------------------------------------- */

	/**
     * Recreate the effects of tokens within the region.
     * @returns {Promise<void>}
     */
	async #recreateEffectsForAllTokens() {
		const effects = await Promise.all(this.effects.map(fromUuid));
		const operations = [];
		for (const token of this.region.tokens) {
			const actor = token.actor;
			if (!actor) continue;
			const toDelete = this.#getEffectsToDelete(actor);
			if (toDelete.length) {
				operations.push({
					action: "delete",
					documentName: "ActiveEffect",
					ids: toDelete,
					parent: actor,
				});
			}
			if (!this.#evaluateConditions(token)) continue;
			const toCreate = this.#getEffectsToCreate(actor, effects);
			if (toCreate.length) {
				operations.push({
					action: "create",
					documentName: "ActiveEffect",
					data: toCreate,
					parent: actor,
				});
			}
		}
		await foundry.documents.modifyBatch(operations);
	}

	/* ---------------------------------------- */

	/**
     * Get Active Effects that should be created for the Actor.
     * @param {Actor4e} actor            The actor the Active Effects should be created for.
     * @param {ActiveEffect4e]} effects  The effects the Active Effects are created from.
     * @returns {ActiveEffectData[]}     The data of Active Effects that should be created.
     */
	#getEffectsToCreate(actor, effects) {
		const toCreate = [];
		for (const effect of effects) {
			if (!effect) continue;
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
			data.origin = this.behavior.uuid;
			toCreate.push(data);
		}
		return toCreate;
	}

	/* ---------------------------------------- */

	/**
     * Get Active Effects that should be deleted from the Actor.
     * @param {Actor4e} actor  The actor the Active Effects should be deleted from.
     * @returns {string[]}     The IDs of Active Effects that should be deleted.
     */
	#getEffectsToDelete(actor) {
		return actor.effects.reduce((ids, effect) => {
			if (effect.origin === this.behavior.uuid) ids.push(effect.id);
			return ids;
		}, []);
	}
}
