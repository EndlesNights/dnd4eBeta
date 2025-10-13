import DocumentSheet4e from "./DocumentSheet4e.js"

export class ActionPointExtraDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "action-point-extra",
		classes: ["action-point", "standard-form"],
		form: {
			closeOnSubmit: true,
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
	
	get title() {
		return `${this.document.name} - ${game.i18n.localize("DND4E.ActionPointRiders")}`;
	}

	static PARTS = {
		actionPointExtra: {
			template: "systems/dnd4e/templates/apps/action-point-extra.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	_prepareContext() {
		return {
			system: this.document.system,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: `${game.i18n.localize("DND4E.Update")} ${game.i18n.localize("DND4E.ActionPointRiders")}` }
			]
		}
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.document.update(updateData);
	}

}
