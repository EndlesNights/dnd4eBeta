import { Helper } from "../helper.js"

export default class CustomSkillConfig extends FormApplication {
	static get defaultOptions(){
		return mergeObject(super.defaultOptions, {
			title: `CONFIG.CustomSkillConfigTitle`,
			id: `CONFIG.CustomSkillConfig`,
			template: "systems/dnd4e/templates/apps/custom-skill-config.html",
			width: 835,
			height: 'auto',
			closeOnSubmit: true,
			classes: ['custom-skill-config'],
			resizable: true,
			scrollY: ['.u-section'],
		});
	}

	async getData(options) {
		const customSkills = game.settings.get("dnd4e", "custom-skills");
		return {customSkills};
	}

	async _updateObject(event, formData) {

		if(!Object.keys(formData).length) {
			this.updateActorsSkills([]);
			return game.settings.set("dnd4e", "custom-skills", {});
		}

		const coreData = game.dnd4eBeta.config.coreSkills

		if(!Array.isArray(formData[Object.keys(formData)[0]])){

			formData = [formData].filter(newObj => {
				if (coreData[newObj.id]) {
					console.log(`Aborted Custom Skill creation of <strong>"${newObj.label}"</strong>, for matching id of <strong>"${newObj.id}"</strong> with core skill <strong>"${game.dnd4eBeta.config.skills[newObj.id]}"</strong>.`);
					ui.notifications.warn(`Aborted Custom Skill creation of <strong>"${newObj.label}"</strong>, for matching id of <strong>"${newObj.id}"</strong> with core skill <strong>"${game.dnd4eBeta.config.skills[newObj.id]}"</strong>.`);
					return false;
				}
				return true;
			});

			this.updateActorsSkills(formData);
			return game.settings.set("dnd4e", "custom-skills", formData);
		}
		// let newSKills
		let transposedArray = Object.keys(formData[Object.keys(formData)[0]]).map(index => {
			const newObj = {};
			for (const key in formData) {
				newObj[key] = formData[key][index];
			}
			return newObj;
		});

		transposedArray = transposedArray.filter(newObj => {
			if (coreData[newObj.id]) {
				console.log(`Aborted Custom Skill creation of <strong>"${newObj.label}"</strong>, for matching id of <strong>"${newObj.id}"</strong> with core skill <strong>"${game.dnd4eBeta.config.skills[newObj.id]}"</strong>.`);
				ui.notifications.warn(`Aborted Custom Skill creation of <strong>"${newObj.label}"</strong>, for matching id of <strong>"${newObj.id}"</strong> with core skill <strong>"${game.dnd4eBeta.config.skills[newObj.id]}"</strong>.`);
				return false;
			}
			return true;
		});

		this.updateActorsSkills(transposedArray);
		return game.settings.set("dnd4e", "custom-skills", transposedArray);
	}

	updateActorsSkills(newDataArray){
		const oldData = game.settings.get("dnd4e", "custom-skills");

		if(newDataArray.length){
			// Check against coreData and remove matching IDs from newData
			const coreData = game.dnd4eBeta.config.coreSkills
			newDataArray = newDataArray.filter(newObj => {
				if (coreData[newObj.id]) {
					console.log(`Aborted Custom Skill creation of <strong>"${newObj.label}"</strong>, for matching id of <strong>"${newObj.id}"</strong> with core skill <strong>"${game.dnd4eBeta.config.skills[newObj.id]}"</strong>.`);
					ui.notifications.warn(`Aborted Custom Skill creation of <strong>"${newObj.label}"</strong>, for matching id of <strong>"${newObj.id}"</strong> with core skill <strong>"${game.dnd4eBeta.config.skills[newObj.id]}"</strong>.`);
					return false;
				}
				return true;
			});
		}

		if(newDataArray.length == 0){
			for(const skillData of oldData){
				this.removeCustomSkill(skillData);
			}
			return game.settings.set("dnd4e", "custom-skills", []);
		}

		const additions = [];
		const subtractions = [];

		function areObjectsEqual(obj1, obj2) {
			// You can implement your own comparison logic here
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		}

		// Compare new data with old data for additions
		if(oldData.length && newDataArray.length){
			newDataArray.forEach(newObj => {
				const foundInOld = oldData.some(oldObj => areObjectsEqual(newObj, oldObj));
				if (!foundInOld) {
					additions.push(newObj);
				}
			});
		} else {
			additions.push(...newDataArray);
		}

		// Compare old data with new data for subtractions
		if(oldData.length){
			oldData.forEach(oldObj => {
				const foundInNew = newDataArray.some(newObj => areObjectsEqual(oldObj, newObj));
				if (!foundInNew) {
					subtractions.push(oldObj);
				}
			});
		}

		//remove old from character sheets
		for(const skillData of subtractions){
			this.removeCustomSkill(skillData);
		}

		//add new to character sheets
		for(const skillData of additions){
			this.addCustomSkill(skillData);
		}

		return game.settings.set("dnd4e", "custom-skills", newDataArray);
	}

	async addCustomSkill(skillData){

		game.dnd4eBeta.config.skills[skillData.id] = skillData.label;
		for(const actor of game.actors){
			const updateData = {};
			updateData[`system.skills.${skillData.id}.value`] = 0;
			updateData[`system.skills.${skillData.id}.base`] = 0;
			updateData[`system.skills.${skillData.id}.bonus`] = [{}];
			updateData[`system.skills.${skillData.id}.ability`] = skillData.ability;
			updateData[`system.skills.${skillData.id}.armourCheck`] = skillData.armourCheck;
			updateData[`system.skills.${skillData.id}.chat`] = "@name uses @label.";
			
			await actor.update(updateData); 
		}
	}

	async removeCustomSkill(skillData){

		delete game.dnd4eBeta.config.skills[skillData.id];
		for(const actor of game.actors){

			const updateData = {}
			updateData[`system.skills.-=${skillData.id}`] = null;
			await actor.update(updateData); 
		}
	}


	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		//handle the "Add New Skill +" button
		$(this.element).on("click", "[custom-skill-create]", (ev) => {
			let ID = $(this.element).find(".custom-skill-line").length;

			let dialogContent = {};
			dialogContent.content = `<div class="form-group"></div>`;
			dialogContent.data = {id:"someID"}
			let hdbsTemplate = Handlebars.compile(dialogContent.content);

			renderTemplate("systems/dnd4e/templates/apps/custom-skill-partial.html", {
				id: ID,
				onResult: [],
				triggerTypeList: this.triggerTypeList,
				possibleResultList: [],
				options: hdbsTemplate(dialogContent.data)
			}).then((html) => {
				$(this.element).find("#custom-skill-list").append(html);
				this.setPosition();
			});
		});

		//delete custom skill line
		$(this.element).on("click", "[custom-skill-delete]", (ev) =>{
			$(ev.target).parents(".custom-skill-line").remove();
			$(this.element).find(".custom-skill-line").each(function (index) {
				$(this).find("input, select").each(function () {
					let name = $(this).attr("name");
					$(this).attr("name", name.replace(/(\w+\[)(\d+)(\]\[\w+\])/, "$1" + index + "$3"));
				});
			});
			this.setPosition();
		});


		//handle the "Cancel" button
		$(this.element).on("click", "[data-cancel]", (ev) => {
			this.close();
		});

		//handle the "Cancel" button
		$(this.element).on("click", "[data-save]", (ev) => {
			$(".custom-skill-line").find("input").prop("disabled", false);
			$(".custom-skill-line").find("select").prop("disabled", false);
		});
	}
}