import { AttributeBonusDialog } from "./attribute-bonuses.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export class EncumbranceDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "encumbrance-dialog",
		classes: ["dnd4e", "encumbrance-dialog", "standard-form"],
		form: {
			closeOnSubmit: false
		},
		position: {
			width: 420,
			height: "auto"
		}
	}

	get title() {
		return `${this.document.name} - ${game.i18n.localize( "DND4E.Encumbrance")}`;
	}

	static PARTS = {
		EncumbranceDialog: {
			template: "systems/dnd4e/templates/apps/encumbrance-dialog.hbs"
		}
	}

	/** @override */
	_prepareContext() {
		return {system: this.document.system}
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		this.document.update(updateData);
	}

	_onRender(context, options) {
		if (!this.document.testUserPermission(game.user, this.options.editPermission)) return;
		this.element.querySelector('.move-bonus')?.addEventListener("click", this._onMovementBonus.bind(this));
	}

	_onMovementBonus(event) {
		event.preventDefault();
		const moveName = event.currentTarget.parentElement.dataset.movement;
		const target = `system.movement.${moveName}`;
		console.log(moveName)
		console.log(event.currentTarget.parentElement.dataset)
		console.log(event.currentTarget.parentElement)
		const options = {document: this.document, target: target, label: `${this.document.system.movement[moveName].label} Movement Bonus` };
		new AttributeBonusDialog(options).render(true);
	}

}
