/**
 * @import { FormulaFieldOptions } from "./_types.mjs";
 */

/**
 * Special case StringField which represents a formula.
 *
 * @param {FormulaFieldOptions} [options={}]  Options which configure the behavior of the field.
 * @property {boolean} deterministic=false    Is this formula not allowed to have dice values?
 */
export default class FormulaField extends foundry.data.fields.StringField {

	/** @inheritDoc */
	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {
			deterministic: false,
		});
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	clean(value, options = {}, _state = {}) {
		if (value && (typeof (value) === "string")) {
			const wepDiceRegex = /@wepDice\(.*\)/gm;
			if (wepDiceRegex.test(value)) {
				// Clean out old "@wepDice(x)" usage; replace with just "0".
				value = value.replace(wepDiceRegex, "0");
			}
			if (value.includes("@scale")) {
				// Convert @scaleX to scale(@lv, X).
				value = value.replace(/@scale(\d*)/gm, "(scale(@lv, $1))");
				value = value.replace(/@scale/gm, "(scale(@lv))");
			}
			const operatorRegex = /\s*([+\-*/])\s*/g;
			value = value.replace(operatorRegex, " $1 ");
		}
		return super.clean(value, options, _state);
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_validateType(value) {
		const roll = new Roll(value.replace(/@([a-z.0-9_-]+)/gi, "1"));
		roll.evaluateSync({ strict: false });
		if (this.options.deterministic && !roll.isDeterministic) throw new Error(`must not contain dice terms: ${value}`);
		super._validateType(value);
	}

	/* -------------------------------------------- */
	/*  Form Field Integration                      */
	/* -------------------------------------------- */

	/** @inheritDoc */
	toFormGroup(groupConfig = {}, inputConfig = {}) {
		groupConfig.classes ||= [];
		groupConfig.classes.push("formula-input");
		return super.toFormGroup(groupConfig, inputConfig);
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_toInput(config) {
		const input = super._toInput(config);
		if ((input.tagName !== "INPUT") || (game.release.generation < 14)) return input;
		config.value ??= this.getInitialValue({}) ?? "";
		return foundry.applications.elements.HTMLFormulaInputElement.create(config);
	}

	/* -------------------------------------------- */
	/*  Active Effect Integration                   */
	/* -------------------------------------------- */

	/** @inheritDoc */
	_castChangeDelta(delta, replacementData = {}) {
		return this._cast(delta).trim();
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_applyChangeAdd(value, delta, model, change) {
		if (!value) return delta;
		const operator = delta.startsWith("-") ? "-" : "+";
		delta = delta.replace(/^[+-]/, "").trim();
		return `${value} ${operator} ${delta}`;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_applyChangeSubtract(value, delta, model, change) {
		if (!value) return `-(${delta})`;
		return `${value} - (${delta})`;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_applyChangeMultiply(value, delta, model, change) {
		if (!value) return value;
		if (new Roll(value).terms.length > 1) value = `(${value})`;
		if (new Roll(delta).terms.length > 1) delta = `(${delta})`;
		return `${value} * ${delta}`;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_applyChangeUpgrade(value, delta, model, change) {
		if (!value) return delta;
		const terms = new Roll(value).terms;
		if ((terms.length === 1) && (terms[0].fn === "max")) return value.replace(/\)$/, `, ${delta})`);
		return `max(${value}, ${delta})`;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_applyChangeDowngrade(value, delta, model, change) {
		if (!value) return delta;
		const terms = new Roll(value).terms;
		if ((terms.length === 1) && (terms[0].fn === "min")) return value.replace(/\)$/, `, ${delta})`);
		return `min(${value}, ${delta})`;
	}
}
