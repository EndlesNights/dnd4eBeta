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
		
		data.health.bloodied = Math.floor(data.health.max / 2);
		data.health.surgeValue = Math.floor(data.health.bloodied / 2) + data.health.surgeBon;
		
		// Skill modifiers
		// const feats = DND4E.characterFlags;
		// const athlete = flags.remarkableAthlete;
		// const joat = flags.jackOfAllTrades;
		// const observant = flags.observantFeat;
		// const skillBonus = Number.isNumeric(bonuses.skill) ? parseInt(bonuses.skill) :  0;		
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
