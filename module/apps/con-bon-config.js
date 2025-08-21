import { AttributeBonusDialog } from "./attribute-bonuses.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export default class ConBonConfig extends DocumentSheet4e {
	static get defaultOptions() {
		const options = super.defaultOptions;
		return foundry.utils.mergeObject(options, {
			id: "con-bon-config",
			classes: ["dnd4e", "con-bon-config"],
			template: "systems/dnd4e/templates/apps/con-bon-config.html",
			width: 320,
			closeOnSubmit: false
		});
	}
	get title() {
		return `${this.object.name}—${game.i18n.localize( 'DND4E.CommonAttackBonuses')}`;
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
		html.find('.condition-mod-bonus').click(this._onConditionBonus.bind(this));
	}

	_onConditionBonus(event) {
		event.preventDefault();
		const conditionId = event.currentTarget.parentElement.dataset.mod;
		const target = `system.commonAttackBonuses.${conditionId}`;
		const options = {target: target, label: `${game.i18n.format('DND4E.CommonAttackBonusesConfig', {condition:game.i18n.localize(this.object.system.commonAttackBonuses[conditionId].label)})}` };
		new AttributeBonusDialog(this.object, options).render(true);
	}
	
}
