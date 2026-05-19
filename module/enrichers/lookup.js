// Adapted from the Foundry Virtual Tabletop - Draw Steel Game System licensed under the MIT license

import { Helper } from "../helper.js";
import { parseConfig } from "./utils.js";

/**
 * @import { TextEditorEnricher, TextEditorEnricherConfig } from "@client/config.mjs";
 * @import HTMLEnrichedContentElement from "@client/applications/elements/enriched-content.mjs";
 * @import { ParsedConfig } from "./utils.js";
 */

/** @type {TextEditorEnricherConfig["id"]} */
export const id = "DND4E.lookup";

/* -------------------------------------------------- */

/** @type {TextEditorEnricherConfig["pattern"]} */
export const pattern = new RegExp("\\[\\[(?<type>lookup)(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?", "gi");

/**
 * Enricher function.
 * @type {TextEditorEnricher}
 */
export async function enricher(match, options) {
	let { config, label: fallback } = match.groups;

	/** @type {ParsedConfig} */
	const parsedConfig = parseConfig(config);
	parsedConfig._input = match[0];

	for (const val of parsedConfig.values) {
		const normalizedValue = val.toLowerCase();
		if (["capitalize", "lowercase", "uppercase"].includes(normalizedValue)) parsedConfig.style ??= normalizedValue;
		else if (normalizedValue === "evaluate") parsedConfig.evaluate = true;
		else parsedConfig.formula ??= val;
	}

	if (!parsedConfig.formula) {
		console.warn(`Lookup path must be defined to enrich ${config._input}.`);
		return null;
	}

	const data = options.rollData ?? options.relativeTo?.getRollData?.() ?? {};

	/** @type {string | number} */
	let value;
	if (parsedConfig.evaluate) {
		const replacedFormula = Roll.replaceFormulaData(parsedConfig.formula, data);
		value = (replacedFormula.includes("@")) ? fallback : Helper.evaluateFormula(replacedFormula, data, { contextName: "lookup" });
	} else {
		value = foundry.utils.getProperty(data, parsedConfig.formula.substring(1)) ?? fallback;

		switch (parsedConfig.style) {
			case "capitalize":
				value = value.capitalize();
				break;
			case "lowercase":
				value = value.toLowerCase();
				break;
			case "uppercase":
				value = value.toUpperCase();
				break;
		}
	}

	const span = document.createElement("span");
	span.classList.add("lookup-value");
	if (!value && (options.documents === false)) return null;
	else if (!value) span.classList.add("not-found");
	span.innerText = value ?? parsedConfig.formula;
	if (!options.noTooltip) span.dataset.tooltip = (!fallback || (value === fallback)) ? parsedConfig.formula : fallback;
	return span;
}

/**
 * Called when the enriched content is added to the DOM.
 * @param {HTMLEnrichedContentElement} element
 */
export async function onRender(element) {}
