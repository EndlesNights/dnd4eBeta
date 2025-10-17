import DocumentSheet4e from "./DocumentSheet4e.js"

export class CustomRolldDescriptions extends DocumentSheet4e {
	
	static DEFAULT_OPTIONS = {
		id: "custom-roll",
		classes: ["dnd4e", "actor-rest", "standard-form"],
		form: {
			closeOnSubmit: false,
			submitOnClose: true
		},
		position: {
			width: 500,
			height: "auto"
		},
		window: {
			contentClasses: ["standard-form"]
		},
		tag: "form"
	}

	static PARTS = {
		CustomRolldDescriptions: {
			template: "systems/dnd4e/templates/apps/custom-roll-descriptions.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	get title() {
		return `${this.document.name} - ${game.i18n.localize("DND4E.CustomizeRollDescriptions")}`;
	}
	
	/** @override */
	async _prepareContext() {
		const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
			system: this.document.system,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.Save" }
			]
		});
        return context;
	}
	
	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.document.update(updateData);
	}
	
}