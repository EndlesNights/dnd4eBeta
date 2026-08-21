import { FormulaField } from "../fields/_module.mjs";
import * as utils from "../../utils/utils.mjs";

const { BooleanField, ColorField, NumberField, SetField, StringField } = foundry.data.fields;

/**
 * @import { DamagingRegionRegionBehaviorSystemData } from "./_types.mjs";
 * @import { GridIconData } from "../../canvas/_types.mjs";
 */

/**
 * The data model for a region behavior that deals damage to certain tokens.
 * @extends {foundry.data.regionBehaviors.RegionBehaviorType<DamagingRegionRegionBehaviorSystemData>}
 * @mixes DamagingRegionRegionBehaviorSystemData
 */
export default class DamagingRegionRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DND4E.RegionBehaviors.DamagingRegion"];

	/* ---------------------------------------- */

	/** @inheritDoc */
	static defineSchema() {
		const dispositions = { ...foundry.applications.sheets.TokenConfig.TOKEN_DISPOSITIONS };
		delete dispositions[CONST.TOKEN_DISPOSITIONS.SECRET];
		const damageTypes = { ...CONFIG.DND4E.damageTypes, ...CONFIG.DND4E.healingTypes };
		delete damageTypes["damage"];
		delete damageTypes["ongoing"];
		return {
			events: this._createEventsField(),
			damage: new FormulaField({ initial: "" }),
			damageTypes: new SetField(new StringField({ choices: damageTypes })),
			dispositions: new SetField(new NumberField({ choices: dispositions })),
			origins: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureOrigin })),
			types: new SetField(new StringField({ choices: () => CONFIG.DND4E.creatureType })),
			oncePerTurn: new BooleanField(),
			onlyInCombat: new BooleanField(),
			excludeCreator: new BooleanField(),
			showGridIcons: new BooleanField({ initial: false }),
			gridIconTint: new ColorField({ nullable: false, initial: "#808080" }),
		};
	}

	/* ---------------------------------------- */

	/**
	 * Get the difficult terrain grid icon configuration.
	 * @returns {GridIconData|null}
	 */
	get gridIconData() {
		if (!this.showGridIcons) return null;

		/** @type { GridIconData } */
		const GRID_ICON = {
			key: "default",
			type: "fontAwesome",
			source: "fa-solid fa-burst",
			tint: Number(this.gridIconTint),
			order: 0,
		};
		return GRID_ICON;
	}

	/* ---------------------------------------- */
	/*  Methods                                 */
	/* ---------------------------------------- */

	/** @inheritDoc */
	_preUpdate(changes, options, userId) {
		if (changes.system?.gridIconTint === null) {
			changes.system.gridIconTint = this.schema.fields.gridIconTint.initial;
		}
	}

	/* ---------------------------------------- */

	/** @inheritDoc */
	async _handleRegionEvent(event) {
		if (!this.damage) return;

		if (this.onlyInCombat && !game.combat) return;

		const { token } = event.data;
		if (!this.#evaluateConditions(token)) return;

		const actor = token.actor;
		if (!actor) return;

		let damageTypes = "";
		if (this.damageTypes.has("healing")) damageTypes = "healing";
		else if (this.damageTypes.has("temphp")) damageTypes = "temphp";
		else damageTypes = [...this.damageTypes].join(",");

		const originUuid = this.parent?.parent?.getFlag("dnd4e", "origin");
		const damageExpression = Roll.replaceFormulaData(this.damage, fromUuidSync(originUuid)?.getRollData());

		const damageRoll = new Roll(`(${damageExpression})[${damageTypes}]`);
		await damageRoll.evaluate();
		const damageTotal = damageRoll.result.toString();

		let damageTaken = 0;
		if (damageTypes === "healing") damageTaken = Math.min(damageTotal, actor.system.attributes.hp.max - actor.system.attributes.hp.value);
		else if (damageTypes === "temphp") damageTaken = Math.max(damageTotal - actor.system.attributes.temphp.value, 0);
		else damageTaken = await actor.calcDamageInner([[damageTotal, damageTypes]]);
		if ((damageTaken === 0) && ["healing", "temphp"].includes(damageTypes)) return;

		let damageImpact = "neutral";

		if (damageTypes === "healing") {
			damageImpact = "healing";
		} else if (damageTypes === "temphp") {
			damageImpact = "temphp";
		} else if (damageTaken == 0) {
			damageImpact = "resistant-full";
		} else if (damageTotal - damageTaken > 0) {
			damageImpact = "resistant";
		} else if (damageTotal - damageTaken < 0) {
			damageImpact = "vulnerable";
		}

		const chatData = {
			dot: { amount: damageTotal, dmgFormula: damageExpression },
			autoDoTs: game.settings.get("dnd4e", "autoDoTs"),
			dmgTaken: damageTaken,
			dmgDiff: Math.max(damageTotal, damageTaken) - Math.min(damageTotal, damageTaken),
			typesFormatted: damageTypes.replaceAll(/,*ongoing,*/g, "").replaceAll(",", " and "),
			actorName: token.name,
			dmgImpact: damageImpact,
			targetToken: token.id,
		};

		const html = await foundry.applications.handlebars.renderTemplate(
			"systems/dnd4e/templates/chat/ongoing-damage.hbs", chatData,
		);

		await ChatMessage.create({
			user: utils.firstOwner(actor),
			speaker: { actor: actor, alias: token.name },
			content: html,
			flavor: `${["healing", "temphp"].includes(damageTypes) ? _loc ("DND4E.Healing") : _loc ("DND4E.Damage")}: ${this.parent.name}`,
			rolls: [damageRoll],
		});

		if (game.settings.get("dnd4e", "autoDoTs") === "apply") {
			if (damageTypes == "healing") {
				await actor.applyDamage(damageTaken * -1);
			}
			else if (damageTypes === "temphp") {
				await actor.applyTempHpChange(damageTotal);
			} else {
				await actor.applyDamage(damageTaken);
			}
		}

		if (this.oncePerTurn && game.combat) {
			const perTurnArray = actor.getFlag("dnd4e", "damagingRegionPerTurn") ?? [];
			perTurnArray.push(this.behavior.uuid);
			await actor.setFlag("dnd4e", "damagingRegionPerTurn", perTurnArray);
		}
	}

	/* ---------------------------------------- */

	/**
   * Check the conditions to decide if damage should be dealt to this token.
   * @param {TokenDocument4e} token  The token to which to deal the damage.
   * @returns {boolean}
   */
	#evaluateConditions(token) {
		if (this.dispositions.size && !this.dispositions.has(token.disposition)) return false;
		if (this.origins.size && !this.origins.has(token.actor.system.details?.origin)) return false;
		if (this.types.size && !this.types.has(token.actor.system.details?.type)) return false;
		if (this.excludeCreator && (this.parent.parent.flags?.dnd4e?.actorUuid === token.actor.uuid)) return false;
		if (game.combat && token.actor.getFlag("dnd4e", "damagingRegionPerTurn")?.includes(this.behavior.uuid)) return false;
		return true;
	}
}
