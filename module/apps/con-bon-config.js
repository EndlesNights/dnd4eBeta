import { AttributeBonusDialog } from "./attribute-bonuses.js";
import DocumentSheet4e from "./DocumentSheet4e.js"

export default class ConBonConfig extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "con-bon-config",
		classes: ["dnd4e","con-bon-config","standard-form","default"],
		form: {
			closeOnSubmit: false
		},
		position: {
			width: 420,
			height: "auto"
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true
		},
		tag: "form"
	}

	get title() {
		return `${this.document.name} — ${game.i18n.localize("DND4EUI.ConditionalAtkMods")}`;
	}

	static PARTS = {
		ConBonConfig: {
			template: "systems/dnd4e/templates/apps/con-bon-config.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
			system: this.document.system,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.Save" }
			]
		});
        return context;
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		this.document.update(updateData);
	}

	_onRender(context, options) {
		if (!this.document.testUserPermission(game.user, this.options.editPermission)) return;
		this.element.querySelectorAll(".condition-mod-bonus").forEach((el) => {
			el.addEventListener("click", (this._onConditionBonus.bind(this)));
		});
	}

	_onConditionBonus(event) {
		event.preventDefault();
		const conditionId = event.currentTarget.parentElement.dataset.mod;
		const target = `system.commonAttackBonuses.${conditionId}`;
		const options = { document: this.document, target: target, label: `${game.i18n.format('DND4E.CommonAttackBonusesConfig', {condition:game.i18n.localize(this.document.system.commonAttackBonuses[conditionId].label)})}` };
		new AttributeBonusDialog(options).render(true);
	}

}
