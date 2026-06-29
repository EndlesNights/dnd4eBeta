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
}
