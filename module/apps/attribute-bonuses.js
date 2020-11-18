export class AttributeBonusDialog extends BaseEntitySheet {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4ealtus", "actor-rest"],
			template: "systems/dnd4ealtus/templates/apps/attribute-bonuses.html",
			width: 500,
			closeOnSubmit: false,
			submitOnClose: true
		});
	}
	/* -------------------------------------------- */
	/**
	* Refrence a nested object by string.
	* s is the string that holds the targeted nested adress
	* o is the root objet, defaulting to this.object.data
	*/
	byString(s, o=this.object.data) {
		s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		s = s.replace(/^\./, '');           // strip a leading dot
		var a = s.split('.');
		for (var i = 0, n = a.length; i < n; ++i) {
			var k = a[i];
			if (k in o) {
				o = o[k];
			} else {
				return;
			}
		}
		return o;
	}	
	
	get title() {		
		return `${this.object.name} - ${this.options.label}`;
		// return `${this.object.name} - ${this.byString(this.options.target + ".label")} ${this.options.label}`;
	}
	
	/** @override */
	getData() {
		return {data: this.byString(this.options.target).bonus}
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
		updateData[`${this.options.target}.bonus`] = newBonus;
		this.object.update(updateData);
		this.position.height = Math.max(1, count) * 76 + 98;
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
		const bonusData = this.byString(this.options.target).bonus;
		const newBonus =[{}];
		this.position.height += 76;
		return this.object.update({[`${this.options.target}.bonus`]: bonusData.concat(newBonus)});
	}
	
	_onBonusDelete(event) {
		event.preventDefault();
		const div = event.currentTarget.closest(".bonus-part");
		const bonus = duplicate(this.byString(this.options.target).bonus);
		bonus.splice(Number(div.dataset.bonusPart), 1);
		this.position.height -= 76;
		return this.object.update({[`${this.options.target}.bonus`]: bonus});
	}
}