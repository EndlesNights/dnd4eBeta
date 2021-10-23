import { AttributeBonusDialog } from "./attribute-bonuses.js";

export class EncumbranceDialog extends DocumentSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "encumbrance-dialog",
			classes: ["dnd4eBeta", "encumbrance-dialog"],
			template: "systems/dnd4e/templates/apps/encumbrance-dialog.html",
			width: 420,
			closeOnSubmit: false
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
		for(let data in formData) { updateData[`${data}`] = formData[`${data}`];}
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
		console.log(moveName)
		console.log(event.currentTarget.parentElement.dataset)
		console.log(event.currentTarget.parentElement)
		const options = {target: target, label: `${this.object.data.data.movement[moveName].label} Movement Bonus` };
		new AttributeBonusDialog(this.object, options).render(true);
	}
}
