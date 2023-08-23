import { Helper } from "../helper.js"

export default class CustomSkillConfig extends FormApplication {
    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            title: `CONFIG.CustomSkillConfigTitle`,
            id: `CONFIG.CustomSkillConfig`,
            template: "systems/dnd4e/templates/apps/custom-skill-config.html",
            width: 700,
            height: 'auto',
            closeOnSubmit: true,
            classes: ['custom-skill-config'],
            submitOnClose: true,
            resizable: true,
            scrollY: ['.u-section'],
        });
    }

    async getData(options) {
        return game.settings.get("dnd4e", "custom-skills");;
    }

    async _updateObject(event, formData) {
        console.log(formData)
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
		console.log(this)
		console.log(this.object)
        event.preventDefault();
		// const bonusData = Helper.byString(this.options.target, this.object).bonus;
		const bonusData = [];
		const newBonus =[{}];
		this.position.height += 76;
        
        return 
		// return this.object.update({[`${this.options.target}.bonus`]: bonusData.concat(newBonus)});
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