import { AttributeBonusDialog } from "./attribute-bonuses.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export class MovementDialog extends DocumentSheet4e {
	static get defaultOptions() {
		const options = super.defaultOptions;
		return foundry.utils.mergeObject(options, {
			id: "movement-dialog",
			classes: ["dnd4e", "movement-dialog"],
			template: "systems/dnd4e/templates/apps/movement-dialog.html",
			width: 420,
			closeOnSubmit: false
		});
	}
	get title() {
		return `${this.object.name} - ${game.i18n.localize( 'DND4E.SpeedAndMove')}`;
	}

	/** @override */
	getData() {
		return {system: this.object.system}
	}
	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		this.object.update(updateData);
	}

	activateListeners(html) {
		super.activateListeners(html);
		if (!this.options.editable) return;
		html.find('.move-bonus').click(this._onMovementBonus.bind(this));
	}

	_onMovementBonus(event) {
		event.preventDefault();
		const moveName = event.currentTarget.parentElement.dataset.movement;
		const target = `system.movement.${moveName}`;
		console.debug(moveName);
		console.debug(event.currentTarget.parentElement.dataset);
		console.debug(event.currentTarget.parentElement);
		console.debug(this.object.system.movement[moveName]);
		const options = {target: target, label: `${game.i18n.format('DND4E.MovementBonus',{mode: moveName})}` };
		new AttributeBonusDialog(this.object, options).render(true);
	}
}
