import { Helper } from "../helper.js"
import DocumentSheet4e from "./DocumentSheet4e.js"

export class AttributeBonusDialog extends DocumentSheet4e {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: `attribute-bonus-${randomID()}`,
			classes: ["dnd4eBeta"],
			template: "systems/dnd4e/templates/apps/attribute-bonuses.html",
			width: 500,
			closeOnSubmit: false,
			submitOnClose: true
		});
	}
	
	get title() {		
		return `${this.object.name} - ${this.options.label}`;
	}
	
	/** @override */
	getData() {
		const system = Helper.byString(this.options.target, this.object);
		return {bonusData: system.bonus, system: system, options: this.options};
	}
	
	async _updateObject(event, formData) {
		const updateData = {};

		let newBonus = [{}];
		let count = 0;
		for(let i = 0; i < Object.entries(formData).length/4; i++) {
			if(formData[`${i}.name`] || formData[`${i}.note`] || formData[`${i}.value`] ) {
				newBonus[count] = {name: formData[`${i}.name`], value: formData[`${i}.value`], active: formData[`${i}.active`], note: formData[`${i}.note`]};
				count++;
			}
		}
		updateData[`${this.options.target}.bonus`] = newBonus;
		if(this.options?.skill) {
			updateData[`${this.options.target}.armourCheck`] = formData["system.armourCheck"];
			this.position.height = Math.max(1, count) * 76 + 119;
		} else if(this.options?.ac) {
			updateData[`${this.options.target}.light`] = formData["system.light"];
			updateData[`${this.options.target}.altability`] = formData["system.altability"];
			this.position.height = Math.max(1, count) * 76 + 124;
		} else if(this.options?.init) {
			updateData[`${this.options.target}.ability`] = formData["system.ability"];
		}
		else if(this.options?.secondWind){
			console.log(formData["custom"])
			updateData[`${this.options.target}.custom`] = formData["system.custom"];
		} else {
			this.position.height = Math.max(1, count) * 76 + 91;
		}

		this.object.update(updateData);
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		if ( this.isEditable ) {
			html.find('.bonus-add').click(this._onBonusAdd.bind(this));
			html.find('.bonus-delete').click(this._onBonusDelete.bind(this));
		}
	}
	
	_onBonusAdd(event) {
		event.preventDefault();
		const bonusData = Helper.byString(this.options.target, this.object).bonus;
		const newBonus =[{}];
		this.position.height += 76;
		return this.object.update({[`${this.options.target}.bonus`]: bonusData.concat(newBonus)});
	}
	
	_onBonusDelete(event) {
		event.preventDefault();
		const div = event.currentTarget.closest(".bonus-part");
		const bonus = duplicate(Helper.byString(this.options.target, this.object).bonus);
		bonus.splice(Number(div.dataset.bonusPart), 1);
		this.position.height -= 76;
		return this.object.update({[`${this.options.target}.bonus`]: bonus});
	}
}