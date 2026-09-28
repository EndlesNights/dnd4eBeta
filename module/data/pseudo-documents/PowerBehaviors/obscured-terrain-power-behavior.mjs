import BasePowerBehavior from "./base-power-behavior.mjs";
import PowerBehaviorSheet from "../../../applications/sheets/pseudo-documents/power-behavior.mjs";
import ObscuredTerrainRegionBehaviorType from "../../region-behaviors/obscured-terrain.mjs";
const { SchemaField } = foundry.data.fields;

/**
 * Pseudodocument used by powers to apply an ObscuredTerrain region behavior to their templates.
 */
export default class DamagingRegionPowerBehavior extends BasePowerBehavior {

	/** @inheritdoc */
	static get metadata() {
		return {
			...super.metadata,
			icon: "fa-solid fa-smog",
			sheetClass: PowerBehaviorSheet,
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat("DND4E.RegionBehaviors.DamagingRegion");

	/** @inheritdoc */
	static defineSchema() {
		const system = new SchemaField(ObscuredTerrainRegionBehaviorType.defineSchema());
		return Object.assign(super.defineSchema(), { system });
	}

	/** @inheritdoc */
	static get TYPE() {
		return "obscuredTerrain";
	}
}
