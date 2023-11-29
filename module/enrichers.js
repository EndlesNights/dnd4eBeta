/**
 * Set up the custom text enricher.
 */
export function registerCustomEnrichers() {
	CONFIG.TextEditor.enrichers.push({
		pattern: /\[\[\/(?<type>attack|check|damage|effect|heal|skill|resource) (?<config>[^\]]+)]](?:{(?<label>[^}]+)})?/gi,
		enricher: enrichString
	});

	document.body.addEventListener("click", rollAction);
}

/* -------------------------------------------- */

/**
 * Parse the enriched string and provide the appropriate content.
 * @param {RegExpMatchArray} match       The regular expression match result.
 * @param {EnrichmentOptions} options    Options provided to customize text enrichment.
 * @returns {Promise<HTMLElement|null>}  An HTML element to insert in place of the matched text or null to
 *                                       indicate that no replacement should be made.
 */
async function enrichString(match, options) {
	let { type, config, label } = match.groups;
	config = parseConfig(config, match.input);
	config.input = match[0];
	switch ( type.toLowerCase() ) {
		case "attack": return enrichAttack(config, label, options);
		case "check":
		case "skill": return enrichCheck(config, label, options);
		case "damage": return enrichDamage(config, label, options);
		case "effect": return enrichEffect(config, label, options);
		case "effechealt": return enrichHeal(config, label, options);
		case "resource": return enrichResource(config, label, options);
	}
	return match.input;
}
  