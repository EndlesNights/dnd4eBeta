import { AttributeBonusDialog } from "./attribute-bonuses.js";
import DocumentSheet4e from "./DocumentSheet4e.js";

export class EncumbranceDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "encumbrance-dialog",
		classes: ["dnd4e", "encumbrance-dialog", "standard-form", "default"],
		form: {
			closeOnSubmit: false,
		},
		position: {
			width: 420,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true,
		},
		tag: "form",
	};

	get title() {
		return `${this.document.name} - ${_loc("DND4E.Encumbrance")}`;
	}

	static PARTS = {
		EncumbranceDialog: {
			template: "systems/dnd4e/templates/apps/encumbrance-dialog.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/** @override */
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

	async _updateObject(event, formData) {
		const updateData = {};
		for (let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		this.document.update(updateData);
	}
}
