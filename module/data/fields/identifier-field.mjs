/**
 * @import { IdentifierFieldOptions } from "./_types.mjs";
 */

/**
 * Special case StringField that includes automatic validation for identifiers.
 *
 * @param {IdentifierFieldOptions} options  Options which configure the behavior of the field.
 */
export default class IdentifierField extends foundry.data.fields.StringField {
	/** @inheritDoc */
	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {
			allowType: false,
			types: null,
		});
	}

	/* -------------------------------------------- */
	/*  Field Validation                            */
	/* -------------------------------------------- */

	/** @override */
	_validateType(value) {
		const IDENTIFIER_REGEX = /^([a-zA-Z0-9_-]+)$/i;
		if (this.allowType) {
			const split = value.split(":");
			if (split.length > 2) return false;
			value = split[1];
		}
		if (!IDENTIFIER_REGEX.test(value)) {
			throw new Error(_loc("DND4E.IdentifierError"));
		}
	}

	/* -------------------------------------------- */
	/*  Form Field Integration                      */
	/* -------------------------------------------- */

	/** @override */
	_toInput(config) {
		if (this.types?.length) config.types ??= this.types;
		if (foundry.utils.getType(config.types) === "string") config.types = config.types.split(",");
		const input = document.createElement("identifier-input");
		input.name = config.name;
		foundry.applications.fields.setInputAttributes(input, config);
		input.setAttribute("value", config.value ?? "");
		if (config.types?.length) input.setAttribute("types", config.types.join(","));
		return input;
	}
}
