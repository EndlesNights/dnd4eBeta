/**
 * @typedef ParsedConfig
 * @property {string} _config
 * @property {string[]} values
 */

/**
 * Parse an enricher string into a configuration object.
 * @param {string} match  Matched configuration string.
 * @param {object} [options={}]
 * @param {boolean} [options.multiple=false]  Support splitting configuration by "&" into multiple sub-configurations.
 *                                            If set to `true` then an array of configs will be returned.
 * @returns {ParsedConfig[] | ParsedConfig} Array if Multiple is true, else object.
 */
export function parseConfig(match = "", { multiple = false } = {}) {
	if (multiple) return match.split("&").map(s => parseConfig(s));
	const config = { _config: match, values: [] };
	for (const part of match.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []) {
		if (!part) continue;
		const [key, value] = part.split("=");
		const valueLower = value?.toLowerCase();
		if (value === undefined) config.values.push(key.replace(/(^"|"$)/g, ""));
		else if (["true", "false"].includes(valueLower)) config[key] = valueLower === "true";
		else if (Number.isNumeric(value)) config[key] = Number(value);
		else config[key] = value.replace(/(^"|"$)/g, "");
	}
	return config;
}
