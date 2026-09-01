/**
 * A specialized form used to select from a checklist of attributes, traits, or properties that each have an associated value
 */
export default class TraitSelectorValues extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheet) {

	static DEFAULT_OPTIONS = {
		id: "trait-selector",
		classes: ["dnd4e", "standard-form", "default"],
		window: {
			title: "Actor Trait Selection",
			resizable: true,
		},
		position: {
			width: 340,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: true,
		},
		allowCustom: true,
		minimum: 0,
		maximum: null,
		choices: {},
	};

	static PARTS = {
		main: { template: "systems/dnd4e/templates/apps/trait-selector-values.hbs" },
		footer: { template: "templates/generic/form-footer.hbs" },
	};

	/* -------------------------------------------- */

	/**
	 * Returns a reference to the target attribute
	 * @type {string}
	 */
	get attribute() {
		return this.options.name;
	}

	/**
	 * Returns a reference to the target's custom path (or null)
	 * @type {string}
	 */
	get custom() {
		return this.options.custom ?? this.attribute.custom ?? null;
	}

	/** @inheritDoc */
	get title() {
		// const name = this.options.name.substring(this.options.name.lastIndexOf(".") + 1);
		// return `${this.object.name} - ${super.title} - ${name}`;
		return `${this.document.name} - ${this.options.window.title}`;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		// Get current values
		const attr = foundry.utils.getProperty(this.document, this.attribute) || {};
		let values = Object.keys(attr).map((key) => [key, attr[key]]);

		let dropdownTraits = foundry.utils.duplicate(this.options.dropdownTraits);
		for (let [k, v] of Object.entries(dropdownTraits)) {
			dropdownTraits[k].chosen = foundry.utils.getProperty(this.document, v.path);
		}
		context.dropdownTraits = dropdownTraits;

		context.valuelessTraits = this.options.valuelessTraits;

		// Populate choices
		let choices = foundry.utils.duplicate(this.options.choices);

		for (let [k, v] of Object.entries(choices)) {
			choices[k] = {
				label: v.label,
				chosen: attr[k].value,
				value: attr[k].value ? attr[k].range : null,
			};
		}

		context.allowCustom = this.options.allowCustom;
		context.choices = choices;
		if (this.options.custom) {
			context.custom = foundry.utils.getProperty(this.document, this.options.custom);
		} else if (attr.custom) {
			context.custom = attr.custom;
		} else {
			context.custom = "";
		}
		context.buttons = [{ type: "submit", icon: "far fa-save", label: "DND4E.Save" }];
		context.heading = _loc("DND4E.SpecialSenses");

		// Return data
		return context;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_processFormData(event, form, formData) {
		const updateData = {};

		formData = foundry.utils.expandObject(formData.object);

		// Obtain choices
		for (let [k, v] of Object.entries(formData)) {
			if (k === "custom") continue;
			if (Object.keys(this.options.dropdownTraits).includes(k)) {
				updateData[this.options.dropdownTraits[k].path] = v;
			}
			else if (Object.keys(this.options.valuelessTraits).includes(k)) {
				updateData[this.options.valuelessTraits[k].path] = v;
			} else {
				updateData[`${this.attribute}.${k}`] = { value: v[0], range: v[0] ? v[1] : null };
			}
		}

		// Include custom
		if (this.options.allowCustom && this.custom) {
			updateData[this.custom] = formData.custom;
		}

		return foundry.utils.expandObject(updateData);
	}
}
