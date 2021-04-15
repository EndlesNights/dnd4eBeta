import { AttributeBonusDialog } from "./attribute-bonuses.js";

export class MovementDialog extends BaseEntitySheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4eBeta", "movement-dialog"],
			template: "systems/dnd4eBeta/templates/apps/movement-dialog.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - Movement Speed Dialog`;
	}

	/** @override */
	getData() {
		return {data: this.object.data.data}
	}
	async _updateObject(event, formData) {
		const updateData = {};
		updateData[`data.movement.basic.base`] = formData[`data.movement.basic.base`];
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
		const target = `data.movement.${moveName}`;
		const options = {target: target, label: `${this.object.data.data.movement[moveName].label} Movement Bonues` };
		new AttributeBonusDialog(this.object, options).render(true);
	}
}
