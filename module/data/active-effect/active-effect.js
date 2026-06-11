const { ArrayField, BooleanField, NumberField, SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Data structure for a standard actor trait.
 *
 * @typedef {object} DOT
 * @property {String} amount               Amount of damage this DOT does per turn.
 * @property {Set<String>} types           Damage types of this DOT's damage.
 */

/**
 * @typedef ActiveEffectSystemData
 * @property {EffectChangeData[]} changes  Changes to apply to the actor.
 * @property {String} durationType         4e-specific duration type for this effect.
 * @property {DOT[]} dots                  Ongoing damage attached to this effect.
 * @property {Set<string>} keywords        Keywords this effect possesses.
 * @property {String} keywordsCustom       Custom keywords this effect possesses.
 * @property {Number} saveDC               DC to save against this effect.
 */

/**
 * System data model for active effects.
 * @extends {ActiveEffectDataModel<ActiveEffectSystemData>}
 * @mixes ActiveEffectSystemData
 */
export default class ActiveEffectData extends foundry.data.ActiveEffectTypeDataModel {
	/* -------------------------------------------- */
	/*  Model Configuration                         */
	/* -------------------------------------------- */

	/** @override */
	static LOCALIZATION_PREFIXES = ["DND4E.Effect"];

	/* -------------------------------------------- */

	/** @override
   * @returns {ActiveEffectSystemData}
  */
	static defineSchema() {
		const keywords = {
			...CONFIG.DND4E.effectTypes,
			...CONFIG.DND4E.damageTypes,
			...CONFIG.DND4E.powerSource,
		};
		return {
			...super.defineSchema(),
			durationType: new StringField({ initial: "" }),
			powerEffectType: new StringField({ initial: "misc" }),
			dots: new ArrayField(new SchemaField({
				// TODO: Make FormulaField when "$solidify()" is fully deprecated.
				amount: new StringField({ initial: "0" }),
				types: new SetField(new StringField({ initial: "" })),
			})),
			equippedRec: new BooleanField({ initial: false }),
			keywords: new SetField(new StringField({ choices: keywords })),
			keywordsCustom: new StringField({ initial: "" }),
			useSourceActorData: new BooleanField({ initial: true }),
			saveDC: new NumberField(),
		};
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
   * Actor within which this effect is embedded.
   * @type {Actor4e|void}
   */
	get actor() {
		return this.item ? this.item.actor : this.parent.parent instanceof Actor ? this.parent.parent : undefined;
	}

	/* -------------------------------------------- */

	/**
   * Item within which this effect is contained, if any.
   * @type {Item4e|void}
   */
	get item() {
		return this.parent.parent instanceof Item ? this.parent.parent : undefined;
	}

	/* -------------------------------------------- */

	/**
   * Keywords which this effect has (including custom keywords), if any.
   * @type {Set<String>}
   */
	get allKeywords() {
		return this.keywordsCustom ? this.keywords.union(new Set(this.keywordsCustom.trim().split(";").map(k => k.trim()))) : this.keywords;
	}
}
