import BasePowerBehavior from "./base-power-behavior.mjs";
import PowerBehaviorSheet from "../../../applications/sheets/pseudo-documents/power-behavior.mjs";
const { SchemaField } = foundry.data.fields;

/**
 * Pseudodocument used by powers to apply an ExecuteScript region behavior to their templates. This should only be available to GMs.
 */
export default class ExecuteScriptPowerBehavior extends BasePowerBehavior {

	/** @inheritdoc */
	static get metadata() {
		return {
			...super.metadata,
			icon: "fa-brands fa-js",
			sheetClass: PowerBehaviorSheet,
			condition: dnd4e.CONFIG.PowerBehavior.executeScript.condition,
			warningString: "DND4E.PSEUDO.Notifications.PowerBehaviorPermissions",
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat("BEHAVIOR.TYPES.executeScript");

	/** @inheritdoc */
	static defineSchema() {
		const system = new SchemaField(foundry.data.regionBehaviors.ExecuteScriptRegionBehaviorType.defineSchema());
		return Object.assign(super.defineSchema(), { system });
	}

	/** @inheritdoc */
	static get TYPE() {
		return "executeScript";
	}
}
