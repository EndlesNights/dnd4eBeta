import { AttributeBonusDialog } from "./attribute-bonuses.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export class MovementDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "movement-dialog",
		classes: ["dnd4e", "movement-dialog", "standard-form"],
		form: {
			closeOnSubmit: false,
			handler: MovementDialog.#onSubmit
		},
		actions: {
			movementBonusClicked: MovementDialog._onMovementBonus
		},
		position: {
			width: 420,
			height: "auto",
		},
		tag: "form"
	}

	get title() {
		return `${this.document.name} - ${game.i18n.localize( 'DND4E.SpeedAndMove')}`;
	}

	static PARTS = {
		MovementDialog: {
			template: "systems/dnd4e/templates/apps/movement-dialog.hbs"
		}
	}

	/** @override */
	_prepareContext() {
		return {system: this.document.system}
	}

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
		const options = {document: this.document, target: targetString, label: `${game.i18n.format('DND4E.MovementBonus',{mode: moveName})}` };
		new AttributeBonusDialog(options).render(true);
	}
}