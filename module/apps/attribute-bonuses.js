import { Helper } from "../helper.js"
import DocumentSheet4e from "./DocumentSheet4e.js"

export class AttributeBonusDialog extends DocumentSheet4e {
	
	static DEFAULT_OPTIONS = {
		id: `attribute-bonus-${foundry.utils.randomID()}`,
		classes: ["dnd4e", "standard-form"],
		form: {
			handler: AttributeBonusDialog.#onSubmit,
			closeOnSubmit: false,
			submitOnClose: true
		},
		position: {
			width: 600,
			height: "auto"
		},
		window: {
			contentClasses: ["standard-form"]
		},
		tag: "form"
	}
	
	get title() {		
		return `${this.document.name} - ${this.options.label}`;
	}

	static PARTS = {
		attributeBonus: {
			template: "systems/dnd4e/templates/apps/attribute-bonuses.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}
	
	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const system = Helper.byString(this.options.target, this.document);
		foundry.utils.mergeObject(context, {
			bonusData: system.bonus,
			system: system,
			options: this.options,
			config: CONFIG.DND4E,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.Save" }
			]
		});
		return context;
	}
	
	static async #onSubmit(event, form, formData) {
		const bonus = foundry.utils.expandObject(formData.object)
		const updateData = {};

		let newBonus = [{}];
		let count = 0;
		for(let i = 0; i < Object.entries(bonus).length; i++) {
			if(bonus[i]?.name || bonus[i]?.note || bonus[i]?.value ) {
				newBonus[count] = {name: bonus[i].name, value: bonus[i].value, active: bonus[i].active, note: bonus[i].note};
				count++;
			}
		}
		updateData[`${this.options.target}.bonus`] = newBonus;
		if(this.options?.skill) {
			updateData[`${this.options.target}.armourCheck`] = bonus.system?.armourCheck;
			//this.position.height = Math.max(1, count) * 76 + 119;
		} else if(this.options?.ac) {
			updateData[`${this.options.target}.light`] = bonus.system?.light;
			updateData[`${this.options.target}.altability`] = bonus.system?.altability;
			//this.position.height = Math.max(1, count) * 76 + 124;
		} else if(this.options?.init) {
			updateData[`${this.options.target}.ability`] = bonus.system?.ability;
		}
		else if(this.options?.secondWind){
			console.log(bonus["custom"])
			updateData[`${this.options.target}.custom`] = bonus.system?.custom;
		} else {
			//this.position.height = Math.max(1, count) * 76 + 91;
		}

		this.document.update(updateData);
	}

	/** @override */
	_onRender(context, options) {
		if ( this.isEditable ) {
			this.element.querySelector('.bonus-add').addEventListener("click", (this._onBonusAdd.bind(this)));
			this.element.querySelectorAll('.bonus-delete').forEach((el) => {
				el.addEventListener("click", (this._onBonusDelete.bind(this)))
			});
		}
	}
	
	_onBonusAdd(event) {
		event.preventDefault();
		const bonusData = Helper.byString(this.options.target, this.document).bonus;
		const newBonus =[{}];
		//this.position.height += 76;
		return this.document.update({[`${this.options.target}.bonus`]: bonusData.concat(newBonus)});
	}
	
	_onBonusDelete(event) {
		event.preventDefault();
		const div = event.currentTarget.closest(".bonus-part");
		const bonus = foundry.utils.duplicate(Helper.byString(this.options.target, this.document).bonus);
		bonus.splice(Number(div.dataset.bonusPart), 1);
		//this.position.height -= 76;
		return this.document.update({[`${this.options.target}.bonus`]: bonus});
	}

}