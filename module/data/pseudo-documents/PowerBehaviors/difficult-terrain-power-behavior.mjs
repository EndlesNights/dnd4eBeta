import BasePowerBehavior from "./base-power-behavior.mjs";
import DifficultTerrainPowerBehaviorSheet from "../../../applications/sheets/pseudo-documents/difficult-terrain-power-behavior.mjs";
import DifficultTerrainRegionBehaviorType from "../../region-behaviors/difficult-terrain.mjs";
const { SchemaField } = foundry.data.fields;

export default class DifficultTerrainPowerBehavior extends BasePowerBehavior {

	/** @inheritdoc */
	static get metadata() {
		return {
			...super.metadata,
			icon: "difficult-terrain-icon",
			sheetClass: DifficultTerrainPowerBehaviorSheet,
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat("DND4E.RegionBehaviors.DifficultTerrain");

	/** @inheritdoc */
	static defineSchema() {
		const system = new SchemaField(DifficultTerrainRegionBehaviorType.defineSchema());
		return Object.assign(super.defineSchema(), { system });
	}

	/** @inheritdoc */
	static get TYPE() {
		return "difficultTerrain";
	}
}
