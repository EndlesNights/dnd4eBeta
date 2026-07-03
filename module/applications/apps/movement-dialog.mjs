import { default as AttributeBonusDialog } from "./attribute-bonuses.mjs";
import DocumentSheet4e from "../sheets/DocumentSheet4e.mjs";

export default class MovementDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "movement-dialog",
		classes: ["dnd4e", "movement-dialog", "standard-form", "default"],
		form: {
			closeOnSubmit: false,
			handler: MovementDialog.#onSubmit,
		},
		actions: {
			movementBonusClicked: MovementDialog._onMovementBonus,
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

	/** @inheritDoc */
	get title() {
		return `${this.document.name} - ${_loc("DND4E.SpeedAndMove")}`;
	}

	static PARTS = {
		MovementDialog: {
			template: "systems/dnd4e/templates/apps/movement-dialog.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.config = CONFIG.DND4E;
		context.system = this.document.system;
		return {
			...context,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.Save" },
			],
		};
	}

	/**
     * @param {Event} event
     * @param {Object} form
     * @param {Object} formData
     */
	static async #onSubmit(event, form, formData) {
		const updateData = foundry.utils.expandObject(formData.object);
		this.document.update(updateData);
	}

	static _onMovementBonus(event, target) {
		event.preventDefault();
		const moveName = target.parentElement.dataset.movement;
		const targetString = `system.movement.${moveName}`;
		console.debug(moveName);
		console.debug(target.parentElement.dataset);
		console.debug(target.parentElement);
		console.debug(this.document.system.movement[moveName]);
		const options = { document: this.document, target: targetString, label: `${_loc("DND4E.MovementBonus", { mode: moveName })}` };
		new AttributeBonusDialog(options).render(true);
	}
}
