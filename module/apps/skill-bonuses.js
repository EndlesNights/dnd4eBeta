export class SkillBonusDialog extends BaseEntitySheet {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4ealtus", "actor-rest"],
			template: "systems/dnd4ealtus/templates/apps/skill-bonuses.html",
			width: 500,
			closeOnSubmit: false,
			submitOnClose: true
		});
	}
	
	get title() {
		return `${this.object.name} - ${this.object.data.data.skills[this.options.name].label} Skill Bonues`;
	}
	
	/** @override */
	getData() {
		return {data: this.object.data.data.skills[this.options.name].bonus}
		// return {data: this.object.data.data}
	}
	
	async _updateObject(event, formData) {	
		const updateData = {};

		let newBonus = [{}];
		let count = 0;
		for(let i = 0; i < Object.entries(formData).length/4; i++)
		{
			if(formData[`${i}.name`] || formData[`${i}.note`] || formData[`${i}.value`] ) {
				newBonus[count] = {name: formData[`${i}.name`], value: formData[`${i}.value`], active: formData[`${i}.active`], note: formData[`${i}.note`]};
				count++;
			}
		}
		updateData[`data.skills.${this.options.name}.bonus`] = newBonus;
		this.object.update(updateData);
		this.position.height = count * 76 + 97;
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
		const bonusData = this.object.data.data.skills[this.options.name].bonus;
		const newBonus =[{}];
		this.position.height += 76;
		return this.object.update({[`data.skills.${this.options.name}.bonus`]: bonusData.concat(newBonus)});
	}
	
	_onBonusDelete(event) {
		event.preventDefault();
		const div = event.currentTarget.closest(".bonus-part");
		const bonus = duplicate(this.object.data.data.skills[this.options.name].bonus);
		bonus.splice(Number(div.dataset.bonusPart), 1);
		this.position.height -= 76;
		return this.object.update({[`data.skills.${this.options.name}.bonus`]: bonus});
	}
}