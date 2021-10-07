import { d20Roll, damageRoll } from "../dice.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import AbilityTemplate from "../pixi/ability-template.js"
import { DND4EBETA } from "../config.js";
import { Helper } from "../helper.js"

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Actor4e extends Actor {

	/** @inheritdoc */
	getRollData() {
		const data = super.getRollData();
		return data;
	}
//   getRollData() {
//     const data = super.getRollData();
//     const shorthand = game.settings.get("dnd4e", "macroShorthand");

	// Re-map all attributes onto the base roll data
	// if ( !!shorthand ) {
	//   for ( let [k, v] of Object.entries(data.attributes) ) {
	//     if ( !(k in data) ) data[k] = v.value;
	//   }
	//   delete data.attributes;
	// }

	// Map all items data using their slugified names
	// data.items = this.data.items.reduce((obj, i) => {
	  // let key = i.name.slugify({strict: true});
	  // let itemData = duplicate(i.data);
	  // if ( !!shorthand ) {
		  // console.log( Object);
		  // console.log( itemData);
		  
		// for ( let [k, v] of Object.entries(itemData.attributes) ) {
		  // if ( !(k in itemData) ) itemData[k] = v.value;
		// }
		// delete itemData["attributes"];
	  // }
	  // obj[key] = itemData;
	  // return obj;
	// }, {});
	
//     return data;
//   }

	constructor(data, context) {
		super(data, context);
		
		//Set default NPC Math Options
		if(data.type==='NPC'){
			if(data?.data?.advancedCals == undefined){
				this.data.data.advancedCals = game.settings.get("dnd4e", "npcMathOptions");

			}
		}

		if(data.type){
			if(data?.data?.powerGroupTypes == undefined){
				this.data.data.powerGroupTypes = `usage`;
			}
		}

	}

	/**
		* Augment the basic actor data with additional dynamic data.
		*/
	prepareData() {
		super.prepareData();
		// Get the Actor's data object
		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags.dnd4eBeta || {};
		const bonuses = getProperty(data, "bonuses.abilities") || {};

		// Prepare Character data
		if ( actorData.type === "character" ) this._prepareCharacterData(actorData);
		else if ( actorData.type === "npc" ) this._prepareNPCData(actorData);

		let originalSaves = null;
		let originalSkills = null;

		// If we are a polymorphed actor, retrieve the skills and saves data from
		// the original actor for later merging.
		if (this.isPolymorphed) {
			const transformOptions = this.getFlag('dnd4eBeta', 'transformOptions');
			const original = game.actors?.get(this.getFlag('dnd4eBeta', 'originalActor'));

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
			abl.modHalf = abl.mod + Math.floor(data.details.level / 2);
			abl.prof = (abl.proficient || 0);
			abl.saveBonus = saveBonus + Math.floor(data.details.level / 2);
			abl.checkBonus = checkBonus + Math.floor(data.details.level / 2);
			abl.save = abl.mod + abl.prof + abl.saveBonus;
			
			abl.label = game.i18n.localize(DND4EBETA.abilities[id]); //.localize("");
			
			// If we merged saves when transforming, take the highest bonus here.
			if (originalSaves && abl.proficient) {
				abl.save = Math.max(abl.save, originalSaves[id].save);
			}
		}
		
		//HP auto calc
		if(data.attributes.hp.autototal)
		{
			data.attributes.hp.max = data.attributes.hp.perlevel * (data.details.level - 1) + data.attributes.hp.starting + data.attributes.hp.feat + data.attributes.hp.misc + data.abilities.con.value;
		}
		
		//Set Health related values
		if(!(data.details.surgeBon.bonus.length === 1 && jQuery.isEmptyObject(data.details.surgeBon.bonus[0]))) {
			for( const b of data.details.surgeBon.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					data.details.surgeBon.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						data.details.surgeBon.value += parseInt(val);
					}
				}
			}
		}
		
		if(!(data.details.secondwindbon.bonus.length === 1 && jQuery.isEmptyObject(data.details.secondwindbon.bonus[0]))) {
			for( const b of data.details.secondwindbon.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					data.details.secondwindbon.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						data.details.secondwindbon.value += parseInt(val);
					}
				}
			}
		}
		
		data.details.bloodied = Math.floor(data.attributes.hp.max / 2);
		data.details.surgeValue = Math.floor(data.details.bloodied / 2) + data.details.surgeBon.value;
		data.attributes.hp.min = -data.details.bloodied;
		data.details.secondWindValue = data.details.surgeValue + data.details.secondwindbon.value;

		//check if bloodied
		data.details.isBloodied = (data.attributes.hp.value <= data.attributes.hp.max/2);

		if(!(data.details.surgeEnv.bonus.length === 1 && jQuery.isEmptyObject(data.details.surgeEnv.bonus[0]))) {
			for( const b of data.details.surgeEnv.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					data.details.surgeEnv.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						data.details.surgeEnv.value += parseInt(val);
					}
				}
			}
		}

		if(!(data.details.deathsavebon.bonus.length === 1 && jQuery.isEmptyObject(data.details.deathsavebon.bonus[0]))) {
			for( const b of data.details.deathsavebon.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					data.details.deathsavebon.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						data.details.deathsavebon.value += parseInt(val);
					}
				}
			}
		}

		if(!(data.details.saves.bonus.length === 1 && jQuery.isEmptyObject(data.details.saves.bonus[0]))) {
			for( const b of data.details.saves.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					data.details.saves.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						data.details.saves.value += parseInt(val);
					}
				}
			}
		}
		
		data.details.tier = Math.clamped(Math.floor(( data.details.level - 1 ) /10 + 1),1,3);
		//Weight & Encumbrance
		data.encumbrance = this._computeEncumbrance(actorData);
			
		// const feats = DND4E.characterFlags;
		// const athlete = flags.remarkableAthlete;
		// const joat = flags.jackOfAllTrades;
		// const observant = flags.observantFeat;
		// const skillBonus = Number.isNumeric(bonuses.skill) ? parseInt(bonuses.skill) :  0;	
	
		if (data.attributes.hp.temphp <= 0 )
			data.attributes.hp.temphp = null;

		//AC mod check, check if light armour (or somthing else that add/negates adding mod)
		if((data.defences.ac.light || this.checkLightArmour() ) && data.defences.ac.altability !== "none")
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
		data.defences.wil.ability = (data.abilities.wis.value >= data.abilities.cha.value) ? "wis" : "cha";

		// Skill modifiers
		//Calc defence stats
		if (this.data.type === "NPC") {
			this.calcSkillNPC(data);
			this.calcDefenceStatsNPC(data);
		} else {
			this.calcSkillCharacter(data);
			this.calcDefenceStatsCharacter(data);
		}

		//calc init
		let initBonusValue = 0 + Math.floor(data.details.level / 2);
		if(!(data.attributes.init.bonus.length === 1 && jQuery.isEmptyObject(data.attributes.init.bonus[0]))) {
			for( const b of data.attributes.init.bonus) {
				if(b.active  && Helper._isNumber(b.value)) {
					initBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						initBonusValue += parseInt(val);
					}
				}
			}
		}
		data.attributes.init.bonusValue = initBonusValue;
		data.attributes.init.value = (data.abilities[data.attributes.init.ability].mod + initBonusValue);
		if(data.attributes.init.value > 999)
			data.attributes.init.value = 999;
		
		//calc movespeed
		let baseMoveBonusValue = 0;
		if(!(data.movement.base.bonus.length === 1 && jQuery.isEmptyObject(data.movement.base.bonus[0]))) {
			for( const b of data.movement.base.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					baseMoveBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						baseMoveBonusValue += parseInt(val);
					}
				}
			}
		}
		for ( let i of this.items) {
			if(i.data.type !="equipment" || !i.data.data.equipped || !i.data.data.armour.movePen) { continue; };
			data.movement.base.armour -= i.data.data.armour.movePenValue;
		}
		data.movement.base.bonusValue = baseMoveBonusValue;

		
		let walkBonusValue = 0;
		if(!(data.movement.walk.bonus.length === 1 && jQuery.isEmptyObject(data.movement.walk.bonus[0]))) {
			for( const b of data.movement.walk.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					walkBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						walkBonusValue += parseInt(val);
					}
				}
			}
		}
		data.movement.walk.bonusValue = walkBonusValue;	

		let chargeBonusValue = 0;
		if(!(data.movement.charge.bonus.length === 1 && jQuery.isEmptyObject(data.movement.charge.bonus[0]))) {
			for( const b of data.movement.charge.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					chargeBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						chargeBonusValue += parseInt(val);
					}
				}
			}
		}
		data.movement.charge.bonusValue = chargeBonusValue;	
		
		let runBonusValue = 0;
		if(!(data.movement.run.bonus.length === 1 && jQuery.isEmptyObject(data.movement.run.bonus[0]))) {
			for( const b of data.movement.run.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					runBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						runBonusValue += parseInt(val);
					}
				}
			}
		}
		data.movement.run.bonusValue = runBonusValue;
	
		let climbBonusValue = 0;
		if(!(data.movement.climb.bonus.length === 1 && jQuery.isEmptyObject(data.movement.climb.bonus[0]))) {
			for( const b of data.movement.climb.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					climbBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						climbBonusValue += parseInt(val);
					}
				}
			}
		}
		data.movement.climb.bonusValue = climbBonusValue;	

		let shiftBonusValue = 0;
		if(!(data.movement.shift.bonus.length === 1 && jQuery.isEmptyObject(data.movement.shift.bonus[0]))) {
			for( const b of data.movement.shift.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					shiftBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,data)
					if(Helper._isNumber(val)){
						shiftBonusValue += parseInt(val);
					}
				}
			}
		}
		data.movement.shift.bonusValue = shiftBonusValue;	

		data.movement.base.value = data.movement.base.base +  baseMoveBonusValue + data.movement.base.temp;
		
		let walkForm = eval(Helper.replaceData(data.movement.walk.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.walk.value = walkForm + walkBonusValue + data.movement.base.temp;
		
		if (data.movement.walk.value < 0)
			data.movement.walk.value = 0;
		
		let runForm = eval(Helper.replaceData(data.movement.run.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.run.value = runForm + runBonusValue + data.movement.run.temp;
		
		if (data.movement.run.value < 0)
			data.movement.run.value = 0;

		let chargeForm = eval(Helper.replaceData(data.movement.charge.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.charge.value = chargeForm + chargeBonusValue + data.movement.charge.temp;
		
		if (data.movement.charge.value < 0)
			data.movement.charge.value = 0;

		let climbeForm = eval(Helper.replaceData(data.movement.climb.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.climb.value = climbeForm;
		
		if (data.movement.climb.value < 0)
			data.movement.climb.value = 0;
		
		let shiftForm = eval(Helper.replaceData(data.movement.shift.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour),data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.shift.value = shiftForm;
		
		if (data.movement.shift.value < 0)
			data.movement.shift.value = 0;
			
		//Passive Skills
		for (let [id, pas] of Object.entries(data.passive)) {
			let passiveBonusValue = 0;
			if(!(pas.bonus.length === 1 && jQuery.isEmptyObject(pas.bonus[0]))) {
				for( const b of pas.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						passiveBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							passiveBonusValue += parseInt(val);
						}
					}
				}
			}
			pas.bonusValue = passiveBonusValue;
			pas.value = 10 + data.skills[pas.skill].total + passiveBonusValue;
		}
		
		//Resistances & Weaknesses
		for (let [id, res] of Object.entries(data.resistances)) {

			let resBonusValue = 0;
			if(!(res.bonus.length === 1 && jQuery.isEmptyObject(res.bonus[0]))) {
				for( const b of res.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						resBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							resBonusValue += parseInt(val);
						}
					}
				}
			}
			for ( let i of this.items) {
				if(i.data.type !="equipment" || !i.data.data.equipped || i.data.data.armour.damageRes.parts.filter(p => p[1] === id).length === 0) { continue; };
				res.armour += i.data.data.armour.damageRes.parts.filter(p => p[1] === id)[0][0];
				break;
			}
			res.resBonusValue = resBonusValue;
			res.value = res.armour + resBonusValue;
			res.label = game.i18n.localize(DND4EBETA.damageTypes[id]); //.localize("");
		}
		
		//Magic Items
		data.magicItemUse.perDay = Math.clamped(Math.floor(( data.details.level - 1 ) /10 + 1),1,3) + data.magicItemUse.bonusValue + data.magicItemUse.milestone;

	}

	calcDefenceStatsCharacter(data) {		
		for (let [id, def] of Object.entries(data.defences)) {
			
			def.label = game.i18n.localize(DND4EBETA.def[id]);
			def.title = game.i18n.localize(DND4EBETA.defensives[id]);
						
			let defBonusValue = 0;
			if(!(def.bonus.length === 1 && jQuery.isEmptyObject(def.bonus[0]))) {
				for( const b of def.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						defBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							defBonusValue += parseInt(val);
						}
					}
				}
			}
			def.bonusValue = defBonusValue;
			
			//Get Deff stats from items
			for ( let i of this.items) {
				if(i.data.type !="equipment" || !i.data.data.equipped ) { continue; };
				def.armour += i.data.data.armour[id];
			}
			if(def.base == undefined){
				def.base = 10;
				this.update({[`data.defences[${def}].base`]: 10 });
			}
			let modBonus =  def.ability != "" ? data.abilities[def.ability].mod : 0;
			def.value = def.base + modBonus + def.armour + def.class + def.feat + def.enhance + def.temp + defBonusValue + Math.floor(data.details.level / 2);			
		}
	}

	calcDefenceStatsNPC(data) {
		for (let [id, def] of Object.entries(data.defences)) {
			
			def.label = game.i18n.localize(DND4EBETA.def[id]);
			def.title = game.i18n.localize(DND4EBETA.defensives[id]);
						
			let defBonusValue = 0;
			if(!(def.bonus.length === 1 && jQuery.isEmptyObject(def.bonus[0]))) {
				for( const b of def.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						defBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							defBonusValue += parseInt(val);
						}
					}
				}
			}
			def.bonusValue = defBonusValue;
			
			//Get Deff stats from items
			for ( let i of this.items) {
				if(i.data.type !="equipment" || !i.data.data.equipped ) { continue; };
				def.armour += i.data.data.armour[id];
			}
			if(def.base == undefined){
				def.base = 10;
				this.update({[`data.defences[${def}].base`]: 10 });
			}
			if(data.advancedCals){
				def.value = def.base + def.armour + def.class + def.feat + def.enhance + def.temp + defBonusValue + Math.floor(data.details.level / 2);
			} else {
				def.value = def.base;		
			}
		}
	}

	calcSkillCharacter(data){
		for (let [id, skl] of Object.entries(data.skills)) {
			skl.value = parseFloat(skl.value || 0);

			let sklBonusValue = 0;
			let sklArmourPenalty = 0;

			if(!(skl.bonus.length === 1 && jQuery.isEmptyObject(skl.bonus[0]))) {
				for( const b of skl.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						sklBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							sklBonusValue += parseInt(val);
						}
					}
				}
			}
			if (skl.armourCheck) {
				//Get Skill Check Penalty stats from armour
				for ( let i of this.items) {
					if(i.data.type !="equipment" || !i.data.data.equipped || !i.data.data.armour.skillCheck) { continue; };
					sklArmourPenalty += i.data.data.armour.skillCheckValue;
				}
			}
			skl.armourPen = sklArmourPenalty;
			skl.sklBonusValue = sklBonusValue - sklArmourPenalty;

			if(skl.base == undefined){
				skl.base = 0;
				// this.update({[`data.skills[${skl}].base`]: 0 });
			}

			if(skl.effectBonus == undefined){
				skl.effectBonus = 0;
			} else {
				if(!isNaN(parseFloat(skl.effectBonus)) && isFinite(skl.effectBonus)){
					skl.effectBonus = parseFloat(skl.effectBonus);
				} else {
					skl.effectBonus = 0;
				}
			}

			// Compute modifier
			skl.mod = data.abilities[skl.ability].mod;			
			skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty + Math.floor(data.details.level / 2);
			skl.label = game.i18n.localize(DND4EBETA.skills[id]);

		}
	}

	calcSkillNPC(data){
		for (let [id, skl] of Object.entries(data.skills)) {
			skl.value = parseFloat(skl.value || 0);

			let sklBonusValue = 0;
			let sklArmourPenalty = 0;
			if(!(skl.bonus.length === 1 && jQuery.isEmptyObject(skl.bonus[0]))) {
				for( const b of skl.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						sklBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							sklBonusValue += parseInt(val);
						}
					}
				}
			}
			if (skl.armourCheck) {
				//Get Skill Check Penalty stats from armour
				for ( let i of this.items) {
					if(i.data.type !="equipment" || !i.data.data.equipped || !i.data.data.armour.skillCheck) { continue; };
					sklArmourPenalty += i.data.data.armour.skillCheckValue;
				}
			}
			skl.armourPen = sklArmourPenalty;
			skl.sklBonusValue = sklBonusValue - sklArmourPenalty;

			if(skl.base == undefined){
				skl.base = 0;
			}

			if(skl.effectBonus == undefined){
				skl.effectBonus = 0;
			} else {
				if(!isNaN(parseFloat(skl.effectBonus)) && isFinite(skl.effectBonus)){
					skl.effectBonus = parseFloat(skl.effectBonus);
				} else {
					skl.effectBonus = 0;
				}
			}

			// Compute modifier
			skl.mod = data.abilities[skl.ability].mod;
			if(data.advancedCals){
				skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty + Math.floor(data.details.level / 2);
			} else {
				skl.total = skl.base;
			}

			skl.label = game.i18n.localize(DND4EBETA.skills[id]);
		}
	}

	checkLightArmour(){
		for ( let i of this.items) {
			if(i.data.type !="equipment" || !i.data.data.equipped ) { 
				continue;
			}
			if(i.data.data.armour.type === "armour" && i.data.data.armour.subType === "heavy"){
				return false;
			}
		}
		return true;
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
		if (!isNaN(value) && isBar ) {
			const current = getProperty(this.data.data, attribute);
			if (isDelta) value = Math.clamped(current.min, Number(current.value) + value, current.max);
			
			if(attribute === 'attributes.hp')
			{
				let newHealth = this.setConditions(value);			
				this.update({[`data.attributes.hp.temphp`]: newHealth[1] });
				this.update({[`data.attributes.hp.value`]: newHealth[0] });
			}
		}
	}
	setConditions(newValue) {
		
		let newTemp = this.data.data.attributes.hp.temphp;
		if(newValue < this.data.data.attributes.hp.value) {
			let damage = this.data.data.attributes.hp.value - newValue;
			
			if(this.data.data.attributes.hp.temphp > 0) {
				newTemp -= damage;
				if(newTemp < 0) {
					newValue = this.data.data.attributes.hp.value + newTemp;
					newTemp = null;
				}
				else {
					newValue = this.data.data.attributes.hp.value;
				}
				
				this.update({[`data.attributes.hp.temphp`]:newTemp});
			}
		}
		
		if(newValue > this.data.data.attributes.hp.max) newValue =  this.data.data.attributes.hp.max;
		else if(newValue < this.data.data.attributes.hp.min) newValue =  this.data.data.attributes.hp.min;
		
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

		let flavText = this.data.data.skills[skillId].chat.replace("@name", this.data.name);
		flavText = flavText.replace("@label", this.data.data.skills[skillId].label);
		
		// Reliable Talent applies to any skill check we have full or better proficiency in
		//const reliableTalent = (skl.value >= 1 && this.getFlag("dnd4e", "reliableTalent"));
		// Roll and return
		
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND4EBETA.SkillPromptTitle", {skill: CONFIG.DND4EBETA.skills[skillId]}),
			speaker: ChatMessage.getSpeaker({actor: this}),
			flavor: flavText,
			//halflingLucky: this.getFlag("dnd4e", "halflingLucky"),
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
		const label = abilityId; //CONFIG.DND4EBETA.abilities[abilityId];
		const abl = this.data.data.abilities[abilityId];

		// Construct parts
		const parts = ["@mod", "@halfLevel"];
		const data = {mod: abl.mod, halfLevel: Math.floor(this.data.data.details.level / 2)};

		// Add feat-related proficiency bonuses
		// const feats = this.data.flags.dnd4eBeta || {};
		// if ( feats.remarkableAthlete && DND4EBETA.characterFlags.remarkableAthlete.abilities.includes(abilityId) ) {
			// parts.push("@proficiency");
			// data.proficiency = Math.ceil(0.5 * this.data.data.attributes.prof);
		// }
		// else if ( feats.jackOfAllTrades ) {
			// parts.push("@proficiency");
			// data.proficiency = Math.floor(0.5 * this.data.data.attributes.prof);
		// }

		// Add global actor bonus
		const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};
		if ( bonuses.check ) {
			parts.push("@checkBonus");
			data.checkBonus = bonuses.check;
		}
		
		let flavText = this.data.data.abilities[abilityId].chat.replace("@name", this.data.name);
		flavText = flavText.replace("@label", this.data.data.abilities[abilityId].label);
		
		// Roll and return
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND4EBETA.AbilityPromptTitle", {ability: CONFIG.DND4EBETA.abilities[label]}),
			speaker: ChatMessage.getSpeaker({actor: this}),
			flavor: flavText,
			// flavor: "Flowery Text Here. MORE AND MORE AND \r\n MORE S MORE " + game.i18n.format("DND4EBETA.AbilityPromptTitle", {ability: CONFIG.DND4EBETA.abilities[label]}),
			// halflingLucky: feats.halflingLucky
		}));
	}
	
	rollDef(defId, options={}) {
		const label = defId;
		const def = this.data.data.defences[defId];

		// Construct parts
		const parts = ["@mod"];
		const data = {mod: def.value - 10};
		
		// Add global actor bonus
		const bonuses = getProperty(this.data.data, "bonuses.defences") || {};
		if ( bonuses.check ) {
			parts.push("@checkBonus");
			data.checkBonus = bonuses.check;
		}
		
		let flavText = this.data.data.defences[defId].chat.replace("@name", this.data.name);
		flavText = flavText.replace("@label", this.data.data.defences[defId].label);
		flavText = flavText.replace("@title", this.data.data.defences[defId].title);
		
		// Roll and return
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND4EBETA.DefencePromptTitle", {defences: CONFIG.DND4EBETA.defensives[label]}),
			// title: "TITLE",
			speaker: ChatMessage.getSpeaker({actor: this}),
			flavor: flavText,
		}));		
	}
	
  /** @override */
  async createOwnedItem(itemData, options) {

	// Assume NPCs are always proficient with weapons and always have spells prepared
	if ( !this.isPC ) {
	  let t = itemData.type;
	  let initial = {};
	  if ( t === "weapon" ) initial["data.proficient"] = true;
	  if ( ["weapon", "equipment"].includes(t) ) initial["data.equipped"] = true;
	  if ( t === "spell" ) initial["data.prepared"] = true;
	  mergeObject(itemData, initial);
	}
	
	return super.createOwnedItem(itemData, options);
  }

	/* -------------------------------------------- */

	/**
	* Use a Power, consume that abilities use, and resources
	* @param {Item4e} item   The power being used by the actor
	* @param {Event} event   The originating user interaction which triggered the cast
	*/
	async usePower(item, {configureDialog=true}={}) {
		//if not a valid type of item to use
		if ( item.data.type !=="power" ) throw new Error("Wrong Item type");
		const itemData = item.data.data;
		//configure Powers data
		const limitedUses = !!itemData.uses.per;
		let consumeUse = false;
		let placeTemplate = false;
		
		if( configureDialog && limitedUses) {
			// const usage = await AbilityUseDialog.create(item);
			// if ( usage === null ) return;
			
			// consumeUse = Boolean(usage.get("consumeUse"));
			consumeUse = true;
			// placeTemplate = Boolean(usage.get("placeTemplate"));
			placeTemplate = true;
		}
		// Update Item data
		if ( limitedUses && consumeUse ) {
			const uses = parseInt(itemData.uses.value || 0);
			if ( uses <= 0 ) ui.notifications.warn(game.i18n.format("DND4EBETA.ItemNoUses", {name: item.name}));
			
			await item.update({"data.uses.value": Math.max(parseInt(item.data.data.uses.value || 0) - 1, 0)})
			// item.update({"data.uses.value": Math.max(parseInt(item.data.data.uses.value || 0) - 1, 0)})
		}
		
		// Initiate ability template placement workflow if selected
		// if ( placeTemplate && item.hasAreaTarget ) {
			// const template = AbilityTemplate.fromItem(item);
			// if ( template ) template.drawPreview();
			// if ( this.sheet.rendered ) this.sheet.minimize();
		// }		
		// Invoke the Item roll
		return item.roll();
	}
	
	_computeEncumbrance(actorData) {
		let weight = 0;
		
		//Weight Currency
		if ( game.settings.get("dnd4e", "currencyWeight") ) {
			for (let [e, v] of Object.entries(actorData.data.currency)) {
				weight += (e == "ad" ? v/500 : v/50);
			}
		}
		// console.log(game.settings.get("dnd4e", "currencyWeight"))
		//Weight Ritual Components
		for (let [e, v] of Object.entries(actorData.data.ritualcomp)) {
			// weight += v/100 * 2.205;
			weight += v * 0.000002;
		}
		//4e 1gp or residuum weights 0.000002
		
		const physicalItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
		weight += actorData.items.reduce((weight, i) => {
			if ( !physicalItems.includes(i.type) ) return weight;
				const q = i.data.data.quantity || 0;
				const w = i.data.data.weight || 0;
				return weight + (q * w);
			}, 0);
	  

		//round to nearest 100th.
		weight = Math.round(weight * 1000) / 1000;

		// const max = actorData.data.abilities.str.value * 10;

		const max = eval(Helper.replaceData(actorData.data.encumbrance.formulaNorm, actorData.data).toString().replace(/[^-()\d/*+. ]/g, ''));
		const maxHeavy = eval(Helper.replaceData(actorData.data.encumbrance.formulaHeavy, actorData.data).toString().replace(/[^-()\d/*+. ]/g, ''));
		const maxMax = eval(Helper.replaceData(actorData.data.encumbrance.formulaMax, actorData.data).toString().replace(/[^-()\d/*+. ]/g, ''));

		//set ppc Percentage Base Carry-Capasity
		const pbc = Math.clamped(weight / max * 100, 0, 99.7);
		//set ppc Percentage Encumbranced Capasity
		const pec =	Math.clamped(weight / (max ) * 100 - 100, 1, 99.7);
		const encumBar = weight > max ? "#b72b2b" : "#6c8aa5";
		const actdatadat = actorData.data;

		return {
			value: weight,
			max,
			maxHeavy,
			maxMax,
			formulaNorm: actorData.data.encumbrance.formulaNorm,
			formulaHeavy: actorData.data.encumbrance.formulaHeavy,
			formulaMax: actorData.data.encumbrance.formulaMax,
			pbc,
			pec,
			encumBar,
			encumbered: weight > max
		};
	}

	async calcDamage(damage, multiplier=1){
		let totalDamage = 0;
		if(Object.keys(damage).length >= 1){
			const res = this.data.data.resistances;

			let damageResAll = res['damage'].value;
			let divider = Object.keys(damage).length;

			for(let d in damage){
				
				let type = d && res[d] ?  d : 'damage';
				let damageBase = damage[d];
				let damageRes = res[type].value || 0;

				let resPart = Math.ceil(damageResAll/divider)
				damageResAll -= resPart;
				divider--;

				if((resPart > damageRes && damageRes >= 0) || (resPart < damageRes && damageRes <= 0) ){
					damageRes = resPart;
				}
				else if( (resPart >= 0 && damageRes <= 0) || (resPart <= 0 && damageRes >= 0)){
					damageRes += resPart;
				}

				// console.log(`${type}: ${damage[type]}`);

				if(d == 'heal'){
					totalDamage -= Math.max(0, damageBase);
				}
				else if(!res[type].immune && !res['damage'].immune){
					totalDamage += Math.max(0, damageBase - damageRes);
					console.log(`DamageType:${type}, Damage:${Math.max(0, damageBase - damageRes)}`)
				}
			}
			console.log(`Total Damage: ${totalDamage * multiplier}`)
			this.applyDamage(totalDamage, multiplier);
		}
	}

	async applyDamage(amount=0, multiplier=1) 
	{
		amount = Math.floor(parseInt(amount) * multiplier);
		const healFromZero = true; // If true, healing HP starts from zero (the usual for 4e). On false, it follows normal arithmetic
		const hp = this.data.data.attributes.hp;
		console.log(hp)

		// Deduct damage from temp HP first
		const tmp = parseInt(hp.temphp) || 0;
		const dt = amount > 0 ? Math.min(tmp, amount) : 0;
		// Remaining goes to health
		//const tmpMax = parseInt(hp.tempmax) || 0;
		amount = amount - dt;
		var newHp = hp.value;
		if (amount > 0) // Damage
			{
			newHp = Math.clamped(hp.value - amount, (-1)*this.data.data.details.bloodied, hp.max);
			}
		else if (amount < 0) // Healing
			{
			if (healFromZero == true && hp.value < 0)
				{
				newHp = 0;
				}
			newHp = Math.clamped(newHp - amount, (-1)*this.data.data.details.bloodied, hp.max);
			}
	
		// Update the Actor
		const updates = {
		  "data.attributes.hp.temphp": tmp - dt,
		  "data.attributes.hp.value": newHp
		};
	
		// Delegate damage application to a hook
		// TODO replace this in the future with a better modifyTokenAttribute function in the core
		const allowed = Hooks.call("modifyTokenAttribute", {
		  attribute: "attributes.hp",
		  value: amount,
		  isDelta: false,
		  isBar: true
		}, updates);
		return allowed !== false ? this.update(updates) : this;
	}
}
