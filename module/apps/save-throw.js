import DocumentSheet4e from "./DocumentSheet4e.js"

export class SaveThrowDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "save-throw",
		classes: ["dnd4e", "actor-save-throw", "standard-form"],
		form: {
			closeOnSubmit: true,
			handler: SaveThrowDialog.#onSubmit
		},
		position: {
			width: 500,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"]
		},
		tag: "form"
	}

	get title() {
		return `${this.document.name} - ${game.i18n.format("DND4E.SavingThrow")}`;
	}

	static PARTS = {
		SaveThrowDialog: {
			template: "systems/dnd4e/templates/apps/save-throw.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const saveOptions = this.options;
		let savableEffects = [];
		const actor = this.document;
		if (actor && !saveOptions.effectSave) {
			Array.from(actor.effects).forEach((e) => {
				if (e.flags.dnd4e?.effectData?.durationType === 'saveEnd') savableEffects.push({name: e.name, id: e.id});
			});
		}
		if (savableEffects.length) {
			savableEffects = [{name: game.i18n.format("DND4E.None"), id:''}].concat(savableEffects);
		}
		foundry.utils.mergeObject(context, {
			system: actor.system,
			rollModes: Object.keys(CONFIG.Dice.rollModes).map(key => CONFIG.Dice.rollModes[key].label),
			effectName: ( saveOptions.effectSave ? actor.effects.get(saveOptions.effectId).name : null ),
			effectId: saveOptions.saveAgainst,
			saveDC: ( saveOptions.effectSave ? actor.effects.get(saveOptions.effectId).flags.dnd4e?.effectData?.saveDC : saveOptions.saveDC ),
			savableEffects: savableEffects,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-dice-d20", label: "DND4E.SaveRoll" }
			]
		});
		return context;
	}

	async _onChangeInput(event) {
		const target = event.target;
		if (target?.name !== "saveAgainst") return;
		this.options.saveDC = this.document.effects.get(target.value)?.flags.dnd4e?.effectData?.saveDC;
		this.options.saveAgainst = target.value;
		this.render();
	}

	static async create(options) {
		const { promise, resolve } = Promise.withResolvers();
		const application = new this(options);
		application.addEventListener("close", () => resolve(application.document), { once: true });
		application.render({ force: true });
		return promise;
	}

	static #onSubmit(event, form, formData) {
		const saveData = foundry.utils.expandObject(formData.object);
		saveData.rollMode = Object.keys(CONFIG.Dice.rollModes)[saveData.rollMode]
		if (saveData.saveAgainst) {
			saveData.effectSave = true;
			saveData.effectId = saveData.saveAgainst
		}

		this.document.rollSave(event, {
			...this.options,
			...saveData
		});
	}
}
