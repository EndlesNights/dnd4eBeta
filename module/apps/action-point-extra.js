import DocumentSheet4e from "./DocumentSheet4e.js";

export class ActionPointExtraDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "action-point-extra",
		classes: ["dnd4e", "action-point", "standard-form", "default"],
		form: {
			closeOnSubmit: true,
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
	
	get title() {
		return `${this.document.name} - ${_loc("DND4E.ActionPointRiders")}`;
	}

	static PARTS = {
		actionPointExtra: {
			template: "systems/dnd4e/templates/apps/action-point-extra.hbs",
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
				{ type: "submit", icon: "fa-solid fa-save", label: `${_loc("DND4E.Update")} ${_loc("DND4E.ActionPointRiders")}` },
			],
		});
		return context;
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for (let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.document.update(updateData);
	}

}
