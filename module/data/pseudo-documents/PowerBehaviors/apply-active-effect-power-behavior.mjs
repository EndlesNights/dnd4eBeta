import BasePowerBehavior from "./base-power-behavior.mjs";
import PowerBehaviorSheet from "../../../applications/sheets/pseudo-documents/power-behavior.mjs";
import ApplyActiveEffectRegionBehaviorType from "../../region-behaviors/apply-active-effect.mjs";
const { SchemaField } = foundry.data.fields;

/**
 * Pseudodocument used by powers to apply an ApplyActiveEffect region behavior to their templates.
 */
export default class ApplyActiveEffectPowerBehavior extends BasePowerBehavior {

	/** @inheritdoc */
	static get metadata() {
		return {
			...super.metadata,
			icon: "difficult-terrain-icon",
			sheetClass: PowerBehaviorSheet,
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat("DND4E.RegionBehaviors.ApplyActiveEffect");

	/** @inheritdoc */
	static defineSchema() {
		const system = new SchemaField(ApplyActiveEffectRegionBehaviorType.defineSchema());
		return Object.assign(super.defineSchema(), { system });
	}

	/** @inheritdoc */
	static get TYPE() {
		return "applyActiveEffect4e";
	}
}
