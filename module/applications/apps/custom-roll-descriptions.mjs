import DocumentSheet4e from "../sheets/DocumentSheet4e.mjs";

export default class CustomRolldDescriptions extends DocumentSheet4e {
	
	static DEFAULT_OPTIONS = {
		id: "custom-roll",
		classes: ["dnd4e", "actor-rest", "standard-form", "default"],
		form: {
			closeOnSubmit: false,
			submitOnClose: true,
		},
		position: {
			width: 500,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true,
		},
		tag: "form",
	};

	static PARTS = {
		CustomRolldDescriptions: {
			template: "systems/dnd4e/templates/apps/custom-roll-descriptions.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/** @inheritDoc */
	get title() {
		return `${this.document.name} - ${_loc("DND4EUI.CustomizeRollDescriptions")}`;
	}
	
	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		foundry.utils.mergeObject(context, {
			system: this.document.system,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.Save" },
			],
		});
		return context;
	}
	
	/** @inheritDoc */
	async _updateObject(event, formData) {
		const updateData = {};
		for (let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.document.update(updateData);
	}
	
}
