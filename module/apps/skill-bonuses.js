export class SkillBonusDialog extends BaseEntitySheet {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4ealtus", "actor-rest"],
			template: "systems/dnd4ealtus/templates/apps/skill-bonuses.html",
			width: 500,
			closeOnSubmit: true
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
		for(let i = 0; i < Object.entries(formData).length/4; i++)
		{
			newBonus[i] = {name: formData[`${i}.name`], value: formData[`${i}.value`], active: formData[`${i}.active`], note: formData[`${i}.note`]};
		}
		
		updateData[`data.skills.${this.options.name}.bonus`] = newBonus;
		this.object.update(updateData);		
				
	}
}