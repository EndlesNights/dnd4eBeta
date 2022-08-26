import { d20Roll } from "../dice.js";
import { DND4EBETA } from "../config.js";
import { Helper } from "../helper.js"
import AbilityTemplate from "../pixi/ability-template.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Actor4e extends Actor {
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

	/** @override */
	async update(data, options={}) {
		
		//used to call changes to HP scrolling text
		if(data[`data.attributes.hp.value`]){
			options.dhp = data[`data.attributes.hp.value`] - this.data.data.attributes.hp.value;
		}

		if(!data) { return super.update(data, options); }
		// Apply changes in Actor size to Token width/height
		const newSize = data["data.details.size"];
		if ( newSize && (options.forceSizeUpdate === true || (newSize !== getProperty(this.data, "data.details.size")) )) {
			let size = CONFIG.DND4EBETA.tokenSizes[newSize];
			if ( this.isToken ) this.token.update({height: size, width: size});
			else if ( !data["token.width"] && !hasProperty(data, "token.width") ) {
				data["token.height"] = size;
				data["token.width"] = size;
			}
		}

		if(data[`data.details.level`]){
			if(this.data.data.details.tier != Math.clamped(Math.floor(( data[`data.details.level`] - 1 ) /10 + 1),1,3)){
				this.data.data.details.tier = Math.clamped(Math.floor(( data[`data.details.level`] - 1 ) /10 + 1),1,3);
				data[`data.details.tier`] = this.data.data.details.tier;
			}		
		}
		for (let [id, abl] of Object.entries(this.data.data.abilities)){
			if(data[`data.abilities.${id}.value`]){
				if(this.data.data.abilities[id].mod != Math.floor((data[`data.abilities.${id}.value`] - 10) / 2)){
					data[`data.abilities.${id}.mod`] = Math.floor((data[`data.abilities.${id}.value`] - 10) / 2) 
					console.log(id)
				}
			}
		}
		return super.update(data, options);
	}

	/** @inheritdoc */
	_onUpdate(data, options, userId) {
		super._onUpdate(data, options, userId);
		this._displayScrollingDamage(options.dhp);
	}


	/* --------------------------------------------- */

	/** @override */
	applyActiveEffects() {
		// The Active Effects do not have access to their parent at preparation time so we wait until this stage to
		// determine whether they are suppressed or not.
		this.effects.forEach(e => e.determineSuppression());
		return super.applyActiveEffects();
	}

	/* -------------------------------------------- */

	/**
	 * Display changes to health as scrolling combat text.
	 * Adapt the font size relative to the Actor's HP total to emphasize more significant blows.
	 * @param {number} dhp      The change in hit points that was applied
	 * @private
	 */
	_displayScrollingDamage(dhp) {
		if ( !dhp ) return;
		dhp = Number(dhp);
		const tokens = this.isToken ? [this.token?.object] : this.getActiveTokens(true);
		for ( let t of tokens ) {
			if ( !t?.hud?.createScrollingText ) continue;  // This is undefined prior to v9-p2
			const pct = Math.clamped(Math.abs(dhp) / this.data.data.attributes.hp.max, 0, 1);
			t.hud.createScrollingText(dhp.signedString(), {
				anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
				fontSize: 16 + (32 * pct), // Range between [16, 48]
				fill: CONFIG.DND4EBETA.tokenHPColors[dhp < 0 ? "damage" : "healing"],
				stroke: 0x000000,
				strokeThickness: 4,
				jitter: 0.25
			});
		}
	}

	/** @inheritdoc */
	getRollData() {
		this.prepareDerivedData();
		const data = super.getRollData();
		data["strMod"] = data.abilities["str"].mod
		data["conMod"] = data.abilities["con"].mod
		data["dexMod"] = data.abilities["dex"].mod
		data["intMod"] = data.abilities["int"].mod
		data["wisMod"] = data.abilities["wis"].mod
		data["chaMod"] = data.abilities["cha"].mod

		data["lvhalf"] = Math.floor(data.details.level/2)
		data["lv"] = data.details.level
		data["tier"] = data.details.tier

		data["heroic"] = data.details.level < 11 ? 1 : 0
		data["paragon"] = data.details.level >= 11 && data.details.level < 21 ? 1 : 0
		data["epic"] = data.details.level >= 21 ? 1 : 0

		data["heroicOrParagon"] = data.details.level < 21 ? 1 : 0
		data["paragonOrEpic"] = data.details.level >= 11 ? 1 : 0
		return data;
	}

	/**
	 * Currently this only does attributes, but can increase it in future if there are more things we want in effects
	 */
	prepareDerivedData() {
		const actorData = this.data;
		const data = actorData.data;
		const bonuses = getProperty(data, "bonuses.abilities") || {};

		this.data.data.halfLevelOptions = game.settings.get("dnd4e", "halfLevelOptions");

		// Ability modifiers and saves
		// Character All Ability Check" and All Ability Save bonuses added when rolled since not a fixed value.
		const saveBonus = Number.isNumeric(bonuses.save) ? parseInt(bonuses.save) : 0;
		const checkBonus = Number.isNumeric(bonuses.check) ? parseInt(bonuses.check) : 0;

		for (let [id, abl] of Object.entries(data.abilities)) {
			abl.mod = Math.floor((abl.value - 10) / 2);
			abl.modHalf = abl.mod + Math.floor(data.details.level / 2);
			abl.prof = (abl.proficient || 0);
			if(game.settings.get("dnd4e", "halfLevelOptions")) {
				abl.saveBonus = saveBonus;
				abl.checkBonus = checkBonus;
			} else {
				abl.saveBonus = saveBonus + Math.floor(data.details.level / 2);
				abl.checkBonus = checkBonus + Math.floor(data.details.level / 2);
			}
			abl.save = abl.mod + abl.prof + abl.saveBonus;

			abl.label = game.i18n.localize(DND4EBETA.abilities[id]);
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

		this.prepareDerivedData();
		
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
		
		//Weight & Encumbrance
		data.encumbrance = this._computeEncumbrance(actorData);
			
		// const feats = DND4E.characterFlags;
		// const athlete = flags.remarkableAthlete;
		// const joat = flags.jackOfAllTrades;
		// const observant = flags.observantFeat;
		// const skillBonus = Number.isNumeric(bonuses.skill) ? parseInt(bonuses.skill) :  0;	
	
		// Should I just write some proper migration code? Naaaaaa
		// if(data.attributes.hp.temphp){
		// 	if(!data.attributes.temphp){
		// 		data.attributes.temphp = {
		// 			value:data.attributes.hp.temphp,
		// 			max: data.attributes.hp.max
		// 		}
		// 	}
		// }
		data.attributes.temphp.max = data.attributes.hp.max;

		if (data.attributes.temphp.value <= 0 )
			data.attributes.temphp.value = null;

		//AC mod check, check if light armour (or somthing else that add/negates adding mod)
		if((data.defences.ac.light || this.checkLightArmour() ) && data.defences.ac.altability !== "none") {
			data.defences.ac.ability = (data.abilities.dex.value >= data.abilities.int.value) ? "dex" : "int";
			if(data.defences.ac.altability != "")
			{
				// if(data.abilities[data.defences.ac.altability].value > data.abilities[data.defences.ac.ability].value)
				{
					data.defences.ac.ability = data.defences.ac.altability;
				}
			}
		}
		else {
			data.defences.ac.ability = "";
		}
		
		//set mods for defences
		data.defences.fort.ability = (data.abilities.str.value >= data.abilities.con.value) ? "str" : "con";
		data.defences.ref.ability = (data.abilities.dex.value >= data.abilities.int.value) ? "dex" : "int";
		data.defences.wil.ability = (data.abilities.wis.value >= data.abilities.cha.value) ? "wis" : "cha";

		// Skill modifiers
		//Calc defence stats
		if(this.data.type === "NPC"){
			this.calcSkillNPC(data);
			this.calcDefenceStatsNPC(data);
		} else {
			this.calcSkillCharacter(data);
			this.calcDefenceStatsCharacter(data);
		}

		//calc init
		let initBonusValue = 0;
		if(!game.settings.get("dnd4e", "halfLevelOptions")){
			initBonusValue += Math.floor(data.details.level / 2);
		}

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
		if(this.data.type === "NPC" && !data.advancedCals){
			data.attributes.init.value = (data.attributes.init.ability ? data.abilities[data.attributes.init.ability].mod : 0) + (data.attributes.init.base || 0) + initBonusValue;
		} else {
			data.attributes.init.value = data.attributes.init.ability ? data.abilities[data.attributes.init.ability].mod + initBonusValue : initBonusValue;
		}
		
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
			const absMovePen = Math.abs(i.data.data.armour.movePenValue)
			data.movement.base.armour -= absMovePen;
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

		data.movement.base.value += data.movement.base.base +  baseMoveBonusValue + data.movement.base.temp;
		
		let walkForm = eval(Helper.replaceData(data.movement.walk.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.walk.value += walkForm + walkBonusValue + data.movement.base.temp;
		
		if (data.movement.walk.value < 0)
			data.movement.walk.value = 0;
		
		let runForm = eval(Helper.replaceData(data.movement.run.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.run.value += runForm + runBonusValue + data.movement.run.temp;
		
		if (data.movement.run.value < 0)
			data.movement.run.value = 0;

		let chargeForm = eval(Helper.replaceData(data.movement.charge.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.charge.value += chargeForm + chargeBonusValue + data.movement.charge.temp;
		
		if (data.movement.charge.value < 0)
			data.movement.charge.value = 0;

		let climbeForm = eval(Helper.replaceData(data.movement.climb.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour), data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.climb.value += climbeForm;
		
		if (data.movement.climb.value < 0)
			data.movement.climb.value = 0;
		
		let shiftForm = eval(Helper.replaceData(data.movement.shift.formula.replace(/@base/g,data.movement.base.base).replace(/@armour/g,data.movement.base.armour),data).replace(/[^-()\d/*+. ]/g, ''));
		data.movement.shift.value += shiftForm;
		
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

		//Attack and damage modifiers
		for (let [id, mod] of Object.entries(data.modifiers)) {
			let modifierBonusValue = 0;
			if(!(mod.bonus.length === 1 && jQuery.isEmptyObject(mod.bonus[0]))) {
				for( const b of mod.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						modifierBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,data)
						if(Helper._isNumber(val)){
							modifierBonusValue += parseInt(val);
						}
					}
				}
			}

			mod.bonusValue = modifierBonusValue;
			mod.value += mod.class + mod.feat + mod.item + mod.power + mod.race + modifierBonusValue + (mod.armourPen || 0);
			mod.label = game.i18n.localize(DND4EBETA.modifiers[id]);
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
			res.value += res.armour + resBonusValue;
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
				if(i.data.data.armour.type === "arms" && ["light", "heavy"].includes(i.data.data.armour.subType)){
					if(!i.data.data.proficient) {continue;} //if not proficient with a shield you do not gain any of its benefits
				}
				else if(i.data.data.armour.type === "armour" && id === "ref"){
					if(!i.data.data.proficient) { //if not proficient with armour you have -2 to Ref def and -2 to attack rolls
						def.armour -= 2;
						this.data.data.modifiers.attack.armourPen =-2;
					}
				}
				def.armour += i.data.data.armour[id];
			}
			// if(def.base == undefined){
			// 	def.base = 10;
			// 	this.update({[`data.defences[${def}].base`]: 10 });
			// }
			let modBonus =  def.ability != "" ? data.abilities[def.ability].mod : 0;
			if(game.settings.get("dnd4e", "halfLevelOptions")) {
				def.value += modBonus + def.armour + def.class + def.feat + def.enhance + def.temp + defBonusValue;
			} else {
				def.value += modBonus + def.armour + def.class + def.feat + def.enhance + def.temp + defBonusValue + Math.floor(data.details.level / 2);			
			}
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
				if(i.data.data.armour.type === "arms" && ["light", "heavy"].includes(i.data.data.armour.subType)){
					if(!i.data.data.proficient) {continue;} //if not proficient with a shield you do not gain any of its benefits
				}
				else if(i.data.data.armour.type === "armour" && id === "ref"){
					if(!i.data.data.proficient) { //if not proficient with armour you have -2 to Ref def and -2 to attack rolls
						def.armour -= 2;
						this.data.data.modifiers.attack.armourPen =-2;
					}
				}
				def.armour += i.data.data.armour[id];
			}
			if(def.base == undefined){
				def.base = 10;
				this.update({[`data.defences[${def}].base`]: 10 });
			}
			if(data.advancedCals){
				if(game.settings.get("dnd4e", "halfLevelOptions")) {
					def.value = def.base + def.armour + def.class + def.feat + def.enhance + def.temp + defBonusValue;
				} else {
					def.value = def.base + def.armour + def.class + def.feat + def.enhance + def.temp + defBonusValue + Math.floor(data.details.level / 2);
				}
				
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
					sklArmourPenalty += Math.abs(i.data.data.armour.skillCheckValue);
				}
			}
			skl.armourPen = sklArmourPenalty;
			skl.sklBonusValue = sklBonusValue + sklArmourPenalty;

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
			if(game.settings.get("dnd4e", "halfLevelOptions")) {
				skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty;
			} else {
				skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty + Math.floor(data.details.level / 2);
			}
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
			skl.sklBonusValue = sklBonusValue + sklArmourPenalty;

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
				if(game.settings.get("dnd4e", "halfLevelOptions")) {
					skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty;
				} else {
					skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty + Math.floor(data.details.level / 2);
				}
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
		if(attribute === 'attributes.hp' && isDelta) {
			const hp = getProperty(this.data.data, attribute);
			const delta = isDelta ? (-1 * value) : (hp.value + hp.temp) - value;
			return this.applyDamage(delta);
		}
		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	}
	setConditions(newValue) {
		
		let newTemp = this.data.data.attributes.temphp.value;
		if(newValue < this.data.data.attributes.hp.value) {
			let damage = this.data.data.attributes.hp.value - newValue;
			
			if(this.data.data.attributes.temphp.value > 0) {
				newTemp -= damage;
				if(newTemp < 0) {
					newValue = this.data.data.attributes.hp.value + newTemp;
					newTemp = null;
				}
				else {
					newValue = this.data.data.attributes.hp.value;
				}
				
				this.update({[`data.attributes.temphp.value`]:newTemp});
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
		const parts = game.settings.get("dnd4e", "halfLevelOptions") ? ["@mod"] : ["@mod", "@halfLevel"];
		const data = game.settings.get("dnd4e", "halfLevelOptions") ? {mod: abl.mod} : {mod: abl.mod, halfLevel: Math.floor(this.data.data.details.level / 2)};

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
			speaker: ChatMessage.getSpeaker({actor: this}),
			flavor: flavText,
		}));		
	}

	async rollInitiative({createCombatants=false, rerollInitiative=false, initiativeOptions={}, event={}}={}, options={}) {
		// Obtain (or create) a combat encounter
		let combat = game.combat;
		if ( !combat ) {
			if ( game.user.isGM && canvas.scene ) {
				const cls = getDocumentClass("Combat")
				combat = await cls.create({scene: canvas.scene.id, active: true});
			}
			else {
				ui.notifications.warn("COMBAT.NoneActive", {localize: true});
				return null;
			}
		}

		// Create new combatants
		if ( createCombatants ) {
			const tokens = this.getActiveTokens();
			const toCreate = [];
			if ( tokens.length ) {
				for ( let t of tokens ) {
					if ( t.inCombat ) continue;
					toCreate.push({tokenId: t.id, sceneId: t.scene.id, actorId: this.id, hidden: t.data.hidden});
				}
			} else toCreate.push({actorId: this.id, hidden: false})
			await combat.createEmbeddedDocuments("Combatant", toCreate);
		}

		// Roll initiative for combatants
		const combatants = combat.combatants.reduce((arr, c) => {
			if ( c.actor.id !== this.id ) return arr;
			if( this.isToken && c.token.id !== this.token.id) return arr;
			arr.push(c.id);
			return arr;
		}, []);
		
		const isReroll = !!(game.combat.combatants.get(combatants[0]).data.initiative || game.combat.combatants.get(combatants[0]).data.initiative == 0)

		const parts = ['@init'];
		let init = this.data.data.attributes.init.value;
		const tiebreaker = game.settings.get("dnd4e", "initiativeDexTiebreaker");
		if ( tiebreaker ) init += this.data.data.attributes.init.value / 100;
		const data = {init: init};

		const initRoll = await  d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			event,
			title: `Init Roll`,
			speaker: ChatMessage.getSpeaker({actor: this}),
			flavor: isReroll? `${this.name} re-rolls Initiative!` : `${this.name} rolls for Initiative!`,
		}));

		if(combatants[0])
		game.combat.combatants.get(combatants[0]).update({initiative:initRoll.total});
		return combat;
	}

	async createOwnedItem(itemData, options) {
		console.warn("You are referencing Actor4E#createOwnedItem which is deprecated in favor of Item.create or Actor#createEmbeddedDocuments.  This method exists to aid transition compatibility");
		return this.createEmbeddedDocuments("Item", [itemData], options);
	}

	/** @override */
	async createEmbeddedDocuments(embeddedName, data=[], context={}) {
		if (embeddedName === "Item") {
			if ( !this.isPC ) {
				data.forEach(datum => {
					let t = datum.type;
					let initial = {};
					if ( t === "weapon" ) initial["data.proficient"] = true;
					if ( ["weapon", "equipment"].includes(t) ) initial["data.equipped"] = true;
					if ( t === "spell" ) initial["data.prepared"] = true;
					mergeObject(datum, initial);
				})
			}
		}
		return super.createEmbeddedDocuments(embeddedName, data, context);
	}


	/* -------------------------------------------- */

	/**
	* Use a Power, consume that abilities use, and resources
	* @param {Item4e} item   The power being used by the actor
	* @param {Event} event   The originating user interaction which triggered the cast
	*/
	
	async usePower(item, {configureDialog=true, fastForward=false}={}) {
		//if not a valid type of item to use
		console.log("UsePower")
		if ( item.data.type !=="power" ) throw new Error("Wrong Item type");
		const itemData = item.data.data;
		//configure Powers data
		const limitedUses = !!itemData.uses.per;
		let consumeUse = false;
		let placeTemplate = false;
		
		if( (configureDialog||fastForward) && limitedUses) {
			consumeUse = true;
			placeTemplate = true;
		}
		// Update Item data
		if ( limitedUses && consumeUse ) {
			const uses = parseInt(itemData.uses.value || 0);
			if ( uses <= 0 ) ui.notifications.warn(game.i18n.format("DND4EBETA.ItemNoUses", {name: item.name}));
			
			await item.update({"data.uses.value": Math.max(parseInt(item.data.data.uses.value || 0) - 1, 0)})
			// item.update({"data.uses.value": Math.max(parseInt(item.data.data.uses.value || 0) - 1, 0)})
		}

		if(fastForward){

			await item.roll();

			if(item.hasAreaTarget){
				const template = AbilityTemplate.fromItem(item);
				if ( template ) template.drawPreview(event);
			}

			if(item.hasAttack){
				await item.rollAttack({fastForward:true});
			}
			if(item.hasDamage){
				await item.rollDamage({fastForward:true});
			}
			if(item.hasHealing){
				await item.rollHealing({fastForward:true});
			}
			return
		}
			
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

	async calcDamage(damage, multiplier=1, surges=0){
		if(game.settings.get("dnd4e", "damageCalcRules") === "errata"){
			this.calcDamageErrata(damage, multiplier,surges);
		}
		else {
			this.calcDamagePHB(damage, multiplier, surges);
		}
	}

	async calcDamageErrata(damage, multiplier, surges){
		let totalDamage = 0;

		console.log(damage)
		for(let d of damage){
			//get all the damageTypes in this term
			let damageTypesArray = d[1].replace(/ /g,'').split(',');

			const actorRes = this.data.data.resistances;
			const isUntypedDamageImmune = actorRes['damage'].immune;
			let isImmuneAll = true; //starts as true, but as soon as one false it can not be changed back to true
			let lowestRes = Infinity; // will attemtpe to replace this with the lowest resistance / highest vunrability

			for(let dt of damageTypesArray){
				const type = dt && actorRes[dt] ? dt : 'damage';
				if(actorRes[type].immune){
					continue;
				}
	
				if(actorRes[type].value !== 0 ){ //if has resistances or vulnerability
					isImmuneAll=false;
					if(actorRes[type].value < lowestRes){
						lowestRes = actorRes[type].value;
					}
				} else {
					if(!isUntypedDamageImmune) {
						isImmuneAll=false;
						if(actorRes['damage'].value){ //"damage" will stand in for any other damage that does not have a value
							if(actorRes['damage'].value < lowestRes){
								lowestRes = actorRes['damage'].value || 0;
							}
						}
						else if(actorRes[type].value < lowestRes){
							lowestRes = actorRes[type].value || 0;
						}
					}
				}
			}

			if(!isImmuneAll) {
				totalDamage += Math.max(0, d[0] - lowestRes);
				console.log(`DamagePart:${d[0]}, DamageTypes: ${damageTypesArray.join(',')}\nImmuneto All? ${isImmuneAll}\nLowest Res: ${lowestRes}`);
			} else{
				console.log(`DamagePart:${d[0]}, DamageTypes: ${damageTypesArray.join(',')}\nImmuneto All? ${isImmuneAll}`);
			}
			// console.log(`Lowest Res: ${lowestRes}`)
		}

		console.log(`TotalDamage: ${totalDamage}, Multiplier: ${multiplier}`)
		this.applyDamage(totalDamage, multiplier);
	}

	async calcDamagePHB(damage, multiplier, surges){
		let damageDealt = {};
		let totalDamage = 0;
		const actorRes = this.data.data.resistances;

		for(let d of damage){
			let damageTypesArray = d[1].replace(/ /g,'').split(',');

			let i = 0;
			for(let dt of damageTypesArray){
				if(damageDealt[dt] === undefined){
					damageDealt[dt] = 0|d[0]/damageTypesArray.length+(i<d[0]%damageTypesArray.length);
				} else{
					damageDealt[dt] += 0|d[0]/damageTypesArray.length+(i<d[0]%damageTypesArray.length);
				}
				i++;
			}
		}

		for(const d in damageDealt){
			const damagetype = actorRes[d] ? d : 'damage';
			if(actorRes[damagetype].immune) continue; //No damage to immune types
			if(actorRes[`damage`].immune && !actorRes[damagetype].value) continue;

			let res = actorRes[damagetype].value || 0;
			if(!res && actorRes[`damage`].value){
				res = actorRes[`damage`].value;
			}
			totalDamage += Math.max(0, damageDealt[damagetype]-res);
		}
		console.log(damageDealt);
		console.log(`Total Damage: ${totalDamage}`)
		this.applyDamage(totalDamage, multiplier);
	}

	async applyDamage(amount=0, multiplier=1, surges={}) {
		amount = Math.floor(parseInt(amount) * multiplier);
		
		// Healing Surge related checks
		if(surges.surgeAmount){
			if(this.data.data.details.surges.value < surges.surgeAmount){ //check to see if enough surges left to use tihs source
				ui.notifications.error(game.i18n.localize("DND4EBETA.HealingSurgeWarning"));
				return;
			}
			else if(this.data.data.attributes.hp.value >= this.data.data.attributes.hp.max){
				ui.notifications.error(game.i18n.localize("DND4EBETA.HealingOverWarning"));
				return;
			}
			amount+= this.data.data.details.surgeValue*surges.surgeAmount*multiplier
		}
		if(surges.surgeValueAmount){
			amount+= this.data.data.details.surgeValue*surges.surgeValueAmount*multiplier
		}
		
		const healFromZero = true; // If true, healing HP starts from zero (the usual for 4e). On false, it follows normal arithmetic
		const hp = this.data.data.attributes.hp;

		// Deduct damage from temp HP first
		const tmp = parseInt(this.data.data.attributes.temphp.value) || 0;
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
			"data.attributes.temphp.value": tmp - dt,
			"data.attributes.hp.value": newHp
		};
	
		//spend healing surges
		if(multiplier < 0  && surges.surgeAmount){
			updates["data.details.surges.value"] =  this.data.data.details.surges.value - surges.surgeAmount;
		}

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

	async applyTempHpChange(amount=0)
	{
		if (!this.canUserModify(game.user, "update")) {
			return
		}

		const hp = this.data.data.attributes.hp;
		console.log(hp)

		// calculate existing temp hp
		const tmp = parseInt(this.data.data.attributes.temphp.value) || 0;

		if (amount >= 0) {
			// temp HP doesn't stack, so only update if we have a higher value
			if (amount > tmp) {
				const updates = {
					"data.attributes.temphp.value": amount,
				};
				return this.update(updates);
			}
		}
		else {
			// amount is negative, so subtract from temp HP, but floor at 0
			let newTempHP = tmp + amount
			newTempHP = Math.max(0, newTempHP)
			const updates = {
				"data.attributes.temphp.value.value": newTempHP,
			};
			return this.update(updates);
		}

		return this
	}

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		const sourceId = this.getFlag("core", "sourceId");
		if ( sourceId?.startsWith("Compendium.") ) return;

		// Player character configuration
		if ( this.type === "Player Character" ) {
			this.data.token.update({vision: true, actorLink: true, disposition: 1});
		}
	}

	async newActiveEffect(effectData){
		this.createEmbeddedDocuments("ActiveEffect", [{
			label: effectData.label,
			icon:effectData.icon,
			origin: effectData.origin,
			sourceName: effectData.sourceName,
			// duration: effectData.duration, //Not too sure why this fails, but it does
			duration: {rounds: effectData.rounds, startRound: effectData.startRound},
			tint: effectData.tint,
			flags: effectData.flags,
			changes: effectData.changes
		}]);
	}

	async newActiveEffectSocket(effectData){
		const uuid = effectData.changesID.split('.')
		let changes
		if(uuid[0] === "Actor"){
			changes = game.actors.get(uuid[1]).data.items.get(uuid[3]).data.effects.get(uuid[5]).data.changes;
		}
		else if(uuid[0] === "Scene"){
			changes = game.scenes.get(uuid[1]).tokens.get(uuid[3]).actor.items.get(uuid[5]).data.effects.get(uuid[7]).data.changes;
		}

		const data = {
			label: effectData.label,
			icon:effectData.icon,
			origin: effectData.origin,
			sourceName: effectData.sourceName,
			duration: {rounds: effectData.rounds, startRound: effectData.startRound},
			tint: effectData.tint,
			flags: effectData.flags,
			changes: changes
		}

		this.createEmbeddedDocuments("ActiveEffect", [data]);
	}
}
