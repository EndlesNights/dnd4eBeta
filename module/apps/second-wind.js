import DocumentSheet4e from "./DocumentSheet4e.js"

export class SecondWindDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "second-wind",
		classes: ["dnd4e","second-wind","standard-form","default"],
		form: {
			handler: SecondWindDialog.#onSubmit,
			closeOnSubmit: true,
		},
		position: {
			width: 500,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true
		},
		tag: "form",
	}
	
	get title() {
		return `${this.document.name} - ${game.i18n.localize("DND4E.SecondWind")}`;
	}

	static PARTS = {
		SecondWindDialog: {
			template: "systems/dnd4e/templates/apps/second-wind.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
        const extra = this.document.system.details.secondwindbon.custom.split(";");
		foundry.utils.mergeObject(context, {
			system: this.document.system,
			extra: extra,
			buttons: [
				{ name: "secondWindButton", type: "submit", label: "DND4E.SecondWind" }
			]
		});
        return context;
	}

	_onRender(context, options) {
		this._setButtonEnabledState();
	}

	_setButtonEnabledState() {
		let swButtonEnabled = true;
		let swButtonText = game.i18n.localize("DND4E.SecondWind");

		if (Number(document.getElementById('surges').value) <= 0) {
			swButtonEnabled = false;
			swButtonText = game.i18n.localize("DND4E.HealingMenuOutOfSurges");
		}

		function setButtonEnabled(buttonId, enabled, text) {
			const button = document.getElementsByName(buttonId)[0];
			button.innerHTML = text;
			if (enabled) {
				button.removeAttribute("disabled");
			}
			else {
				button.setAttribute("disabled", "true");
			}
		}
		setButtonEnabled('secondWindButton', swButtonEnabled, swButtonText);
	}

	static async #onSubmit(event, form, formData) {
		const secondWindData = foundry.utils.expandObject(formData.object);

		this.document.secondWind(event, {
			...this.options,
			...secondWindData
		});
	}
}
