import { d20Roll, damageRoll } from "./dice.js";
import { DND4EALTUS } from "./config.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SimpleActor extends Actor {

  /** @override */
  getRollData() {
    const data = super.getRollData();
    const shorthand = game.settings.get("dnd4eAltus", "macroShorthand");

    // Re-map all attributes onto the base roll data
    if ( !!shorthand ) {
      for ( let [k, v] of Object.entries(data.attributes) ) {
        if ( !(k in data) ) data[k] = v.value;
      }
      delete data.attributes;
    }

    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({strict: true});
      let itemData = duplicate(i.data);
      if ( !!shorthand ) {
        for ( let [k, v] of Object.entries(itemData.attributes) ) {
          if ( !(k in itemData) ) itemData[k] = v.value;
        }
        delete itemData["attributes"];
      }
      obj[key] = itemData;
      return obj;
    }, {});
    return data;
  }
  
	/**
		* Augment the basic actor data with additional dynamic data.
		*/
	prepareData() {
		super.prepareData();
		
		
		// Get the Actor's data object
		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags.dnd4eAltus || {};
		const bonuses = getProperty(data, "bonuses.abilities") || {};

		// Prepare Character data
		if ( actorData.type === "character" ) this._prepareCharacterData(actorData);
		else if ( actorData.type === "npc" ) this._prepareNPCData(actorData);

		let originalSaves = null;
		let originalSkills = null;

		// If we are a polymorphed actor, retrieve the skills and saves data from
		// the original actor for later merging.
		if (this.isPolymorphed) {
			const transformOptions = this.getFlag('dnd4eAltus', 'transformOptions');
			const original = game.actors?.get(this.getFlag('dnd4eAltus', 'originalActor'));

			if (original) {
				if (transformOptions.mergeSaves) {
					originalSaves = original.data.data.abilities;
				}

				if (transformOptions.mergeSkills) {
					originalSkills = original.data.data.skills;
				}
			}
		}		
		
		//HP auto calc
		if(data.health.autototal)
		{
			data.health.max = data.health.perlevel * (data.details.level - 1) + data.health.starting + data.health.feat + data.health.misc + data.abilities.con.value;
		}
		
		// Ability modifiers and saves
		// Character All Ability Check" and All Ability Save bonuses added when rolled since not a fixed value.		
		const saveBonus = Number.isNumeric(bonuses.save) ? parseInt(bonuses.save) : 0;
		const checkBonus = Number.isNumeric(bonuses.check) ? parseInt(bonuses.check) : 0;
		
		for (let [id, abl] of Object.entries(data.abilities)) {

			abl.mod = Math.floor((abl.value - 10) / 2);
			abl.prof = (abl.proficient || 0) * data.attributes.prof;
			abl.saveBonus = saveBonus;
			abl.checkBonus = checkBonus;
			abl.save = abl.mod + abl.prof + abl.saveBonus;
			
			abl.label = game.i18n.localize(DND4EALTUS.abilities[id]); //.localize("");
			
			// If we merged saves when transforming, take the highest bonus here.
			if (originalSaves && abl.proficient) {
				abl.save = Math.max(abl.save, originalSaves[id].save);
			}
		}
		
		//Set Health related values
		data.details.bloodied = Math.floor(data.health.max / 2);
		data.details.surgeValue = Math.floor(data.details.bloodied / 2) + data.details.surgeBon;
		data.health.min = -data.details.bloodied;
		
		//set Second Wind Value.
		data.details.secondWindValue = data.details.surgeValue + data.details.secondwindbon;
		
		// const feats = DND4E.characterFlags;
		// const athlete = flags.remarkableAthlete;
		// const joat = flags.jackOfAllTrades;
		// const observant = flags.observantFeat;
		// const skillBonus = Number.isNumeric(bonuses.skill) ? parseInt(bonuses.skill) :  0;	

		// Skill modifiers
		for (let [id, skl] of Object.entries(data.skills)) {

			skl.value = parseFloat(skl.value || 0);
			
			// Compute modifier
			skl.bonus = 0;// checkBonus + skillBonus;
			skl.mod = data.abilities[skl.ability].mod;
			skl.prof = 0;//round(multi * data.attributes.prof);
			skl.total = skl.value + skl.mod + skl.prof + skl.bonus + skl.expt + skl.armor + skl.misc;		

			skl.label = game.i18n.localize(DND4EALTUS.skills[id]);

			// skl.ability = data.actor.data.abilities[skl.ability].label.substring(0, 3);
			// skl.icon = this._getProficiencyIcon(skl.value);
			// skl.hover = CONFIG.DND4E.proficiencyLevels[skl.value];
			// skl.label = CONFIG.DND4E.skills[id];
		}
		
		
		//AC mod check, check if heavy armour (or somthing else that negates adding mod)
		if(!data.defences.ac.heavy)
		{
			data.defences.ac.ability = (data.abilities.dex.value >= data.abilities.int.value) ? "dex" : "int";
			if(data.defences.ac.altability != "")
			{
				// if(data.abilities[data.defences.ac.altability].value > data.abilities[data.defences.ac.ability].value)
				{
					data.defences.ac.ability = data.defences.ac.altability;
				}
			}
		}
		else
		{
			data.defences.ac.ability = "";
		}
		
		//set mods for defences
		data.defences.fort.ability = (data.abilities.str.value >= data.abilities.con.value) ? "str" : "con";
		data.defences.ref.ability = (data.abilities.dex.value >= data.abilities.int.value) ? "dex" : "int";
		data.defences.wil.ability = (data.abilities.wis.value >= data.abilities.cha.value) ? "wis" : "char";

		//Calc defence stats
		for (let [id, def] of Object.entries(data.defences)){
			def.label = game.i18n.localize(DND4EALTUS.def[id]);
			def.title = game.i18n.localize(DND4EALTUS.defensives[id]);
			
			let modBonus =  def.ability != "" ? data.abilities[def.ability].mod : 0;
			def.value = 10 + modBonus + def.armor + def.class + def.feat + def.enhance + def.misc + def.temp;			
		}
		
		//calc init
		data.init.value = (data.abilities[data.init.ability].mod + data.init.bonus);
		if(data.init.value > 999)
			data.init.value = 999;
		
		//calc movespeed
		data.movement.basic.value = + data.movement.basic.base + data.movement.basic.armor + data.movement.basic.misc + data.movement.basic.temp;
		
		if (data.movement.basic.value < 0)
			data.movement.basic.value = 0;
		
		data.movement.charge.value = data.movement.basic.value + data.movement.charge.armor + data.movement.charge.misc + data.movement.charge.temp;
		
		if (data.movement.charge.value < 0)
			data.movement.charge.value = 0;
		
		data.movement.run.value = data.movement.basic.value + 2 + data.movement.run.armor + data.movement.run.misc + data.movement.run.temp;
		
		if (data.movement.run.value < 0)
			data.movement.run.value = 0;
		
		//Resistences & Weaknesses
		for (let [id, pas] of Object.entries(data.passive)) {
			pas.value = 10 + data.skills[pas.skill].total + pas.bonus;
		}
		
		for (let [id, res] of Object.entries(data.resistences)) {

			// abl.mod = Math.floor((abl.value - 10) / 2);
			// abl.prof = (abl.proficient || 0) * data.attributes.prof;
			// abl.saveBonus = saveBonus;
			// abl.checkBonus = checkBonus;
			// abl.save = abl.mod + abl.prof + abl.saveBonus;
			res.value = res.enchant + res.race + res.misc;
			res.label = game.i18n.localize(DND4EALTUS.damageTypes[id]); //.localize("");
			
			// If we merged saves when transforming, take the highest bonus here.
			// if (originalSaves && abl.proficient) {
				// abl.save = Math.max(abl.save, originalSaves[id].save);
			// }
		}
	}  


  /**
   * Handle how changes to a Token attribute bar are applied to the Actor.
   * This allows for game systems to override this behavior and deploy special logic.
   * @param {string} attribute    The attribute path
   * @param {number} value        The target attribute value
   * @param {boolean} isDelta     Whether the number represents a relative change (true) or an absolute change (false)
   * @param {boolean} isBar       Whether the new value is part of an attribute bar, or just a direct value
   * @return {Promise}
   */
	async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
		const current = getProperty(this.data.data, attribute);
		if ( isBar ) {
			if (isDelta) value = Math.clamped(current.min, Number(current.value) + value, current.max);
				if(attribute === 'health')
				{
					let newHealth = this.setConditions(value);				
					this.update({[`data.details.temp`]: newHealth[1] });
					this.update({[`data.health.value`]: newHealth[0] });
				}


		}
	}	
	setConditions(newValue) {
		
		let newTemp = this.data.data.details.temp;

		if(newValue < this.data.data.health.value)
		{
			let damage = this.data.data.health.value - newValue;
			
			if(this.data.data.details.temp > 0)
			{
				newTemp -= damage;
				if(newTemp < 0)
				{
					newValue = this.data.data.health.value + newTemp;
					newTemp = 0;
				}
				else
				{
					newValue = this.data.data.health.value;
				}
				console.log(newTemp);
				this.update({[`data.details.temp`]:newTemp});
			}
		}
		else if(newValue > this.data.data.health.value)
		{
		
		}
		
		if(newValue > this.data.data.health.max) newValue =  this.data.data.health.max;
		else if(newValue < this.data.data.health.min) newValue =  this.data.data.health.min;
		
		return [newValue,newTemp];
	}  
  
  /**
   * Roll a Skill Check
   * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
   * @param {string} skillId      The skill id (e.g. "ins")
   * @param {Object} options      Options which configure how the skill check is rolled
   * @return {Promise.<Roll>}   A Promise which resolves to the created Roll instance
   */
	rollSkill(skillId, options={}) {
		const skl = this.data.data.skills[skillId];
		const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};

		// Compose roll parts and data
		const parts = ["@mod"];
		const data = {mod: skl.total};

		// Ability test bonus
		if ( bonuses.check ) {
			data["checkBonus"] = bonuses.check;
			parts.push("@checkBonus");
		}

		// Skill check bonus
		if ( bonuses.skill ) {
			data["skillBonus"] = bonuses.skill;
			parts.push("@skillBonus");
		}

		// Reliable Talent applies to any skill check we have full or better proficiency in
		//const reliableTalent = (skl.value >= 1 && this.getFlag("dnd5e", "reliableTalent"));

		// Roll and return
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			//title: game.i18n.format("DND4EALTUS.SkillPromptTitle", {skill: CONFIG.DND5E.skills[skillId]}),
			title: "Test Name",
			speaker: ChatMessage.getSpeaker({actor: this}),
			//halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
			//reliableTalent: reliableTalent
		}));
	}	
  
  
  /**
   * Roll a Ability Check
   * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
   * @param {String} abilityId    The ability ID (e.g. "str")
   * @param {Object} options      Options which configure how ability tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
	rollAbility(abilityId, options={}) {
		const label = abilityId; //CONFIG.DND5E.abilities[abilityId];
		const abl = this.data.data.abilities[abilityId];

		// Construct parts
		const parts = ["@mod"];
		const data = {mod: abl.mod};

		// Add feat-related proficiency bonuses
		const feats = this.data.flags.dnd5e || {};
		if ( feats.remarkableAthlete && DND5E.characterFlags.remarkableAthlete.abilities.includes(abilityId) ) {
			parts.push("@proficiency");
			data.proficiency = Math.ceil(0.5 * this.data.data.attributes.prof);
		}
		else if ( feats.jackOfAllTrades ) {
			parts.push("@proficiency");
			data.proficiency = Math.floor(0.5 * this.data.data.attributes.prof);
		}

		// Add global actor bonus
		const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};
		if ( bonuses.check ) {
			parts.push("@checkBonus");
			data.checkBonus = bonuses.check;
		}

		// Roll and return
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND5E.AbilityPromptTitle", {ability: label}),
			speaker: ChatMessage.getSpeaker({actor: this}),
			halflingLucky: feats.halflingLucky
		}));
	}
}
