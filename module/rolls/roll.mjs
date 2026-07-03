export default class Roll4e extends Roll {
	constructor (formula, data = {}, options = {}) {
		super(formula, data, options);
		foundry.utils.mergeObject(this.options, this.constructor.DEFAULT_OPTIONS, {
			insertKeys: true,
			insertValues: true,
			overwrite: false,
		});
	}

	/* -------------------------------------------------- */

	static DEFAULT_OPTIONS = Object.freeze({
		bonuses: {
			feat: [],
			item: [],
			power: [],
			race: [],
			untyped: [],
		},
	});

	/* -------------------------------------------- */

	/** @inheritDoc */
	async evaluate(options = {}) {
		this.processBonuses();
		return super.evaluate(options);
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	evaluateSync(options = {}) {
		this.processBonuses();
		return super.evaluateSync(options);
	}

	/* -------------------------------------------- */

	/**
     * Processes this roll's bonuses and adds them to its formula, obeying type and stacking rules.
     */
	processBonuses() {
		for (const [type, bonuses] of Object.entries(this.options.bonuses)) {
			if (bonuses.length) {
				const bonus = type == "untyped" ? bonuses.reduce((acc, curr) => acc + parseInt(curr), 0) : bonuses.reduce((max, curr) => Math.max(max, parseInt(curr)), -Infinity);
				const bonusString = String(bonus);
				this._formula += ` + (${bonus})`;
				const operatorTerm = new foundry.dice.terms.OperatorTerm({ operator: "+" });
				const options = {};
				if (this.terms[0]?.flavor) options.flavor = this.terms[0].flavor;
				const parentheticalTerm = new foundry.dice.terms.ParentheticalTerm({ term: bonusString, options });
				this.terms.push(operatorTerm);
				this.terms.push(parentheticalTerm);
			}
		}
	}
}
