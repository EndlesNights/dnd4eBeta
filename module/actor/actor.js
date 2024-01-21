import { d20Roll, damageRoll } from "../dice.js";
import { DND4EALTUS } from "../config.js";
import { Helper } from "../helper.js"
import AbilityTemplate from "../pixi/ability-template.js";
import { SaveThrowDialog } from "../apps/save-throw.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Actor4e extends Actor {
	constructor(data, context) {
		super(data, context);
		
		//Set default NPC Math Options
		if(data.type==='NPC'){
			if(data?.system?.advancedCals == undefined){
				this.system.advancedCals = game.settings.get("dnd4eAltus", "npcMathOptions");
			}
		}

		if(data.type){
			if(data?.system?.powerGroupTypes == undefined){
				this.system.powerGroupTypes = `usage`;
			}
		}
	}

	/** @override */
	async update(data, options={}) {
		if(!data) { return super.update(data, options); }
		
		//used to call changes to HP scrolling text
		if(data[`system.attributes.hp.value`] != undefined && data[`system.attributes.hp.value`] != this.system.attributes.hp.value){
			options.dhp = data[`system.attributes.hp.value`] - this.system.attributes.hp.value;
			data[`system.details.isBloodied`] = data[`system.attributes.hp.value`] <= this.system.attributes.hp.max/2;
		}

		// Apply changes in Actor size to Token width/height
		const newSize = data["system.details.size"];

		if ( newSize && (options.forceSizeUpdate === true || (newSize !== getProperty(this, "system.details.size")) )) {
			let size = CONFIG.DND4EALTUS.tokenSizes[newSize];
			if ( this.isToken ) this.token.update({height: size, width: size});
			else if ( !data["token.width"] && !hasProperty(data, "token.width") ) {
				data["token.height"] = size;
				data["token.width"] = size;
			}
		}

		if(data[`system.details.level`]){
			if(this.system.details.tier != Math.clamped(Math.floor(( data[`system.details.level`] - 1 ) /10 + 1),1,3)){
				this.system.details.tier = Math.clamped(Math.floor(( data[`system.details.level`] - 1 ) /10 + 1),1,3);
				data[`system.details.tier`] = this.system.details.tier;
			}		
		}

		for (let [id, abl] of Object.entries(this.system.abilities)){
			if(data[`system.abilities.${id}.value`]){
				if(this.system.abilities[id].mod != Math.floor((data[`system.abilities.${id}.value`] - 10) / 2)){
					data[`system.abilities.${id}.mod`] = Math.floor((data[`system.abilities.${id}.value`] - 10) / 2) 
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

	/** Get all ActiveEffects stored in the actor or transferred from items */
	getActiveEffects() {
		return Array.from(this.allApplicableEffects());
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
			console.log(t);
			if ( !t.document.hidden || game.user.isGM ){
			    const pct = Math.clamped(Math.abs(dhp) / this.system.attributes.hp.max, 0, 1);
			    canvas.interface.createScrollingText(t.center, dhp.signedString(), {
				    anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
				    fontSize: 16 + (32 * pct), // Range between [16, 48]
				    fill: CONFIG.DND4EALTUS.tokenHPColors[dhp < 0 ? "damage" : "healing"],
				    stroke: 0x000000,
				    strokeThickness: 4,
				    jitter: 0.25
			    });
			}
		}
	}

	/** @inheritdoc */
	getRollData() {
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

	prepareBaseData(){
		super.prepareBaseData();
		const system = this.system;
		const bonuses = getProperty(system, "bonuses.abilities") || {};

		// Ability modifiers and saves
		// Character All Ability Check" and All Ability Save bonuses added when rolled since not a fixed value.
		const saveBonus = Number.isNumeric(bonuses.save) ? parseInt(bonuses.save) : 0;
		const checkBonus = Number.isNumeric(bonuses.check) ? parseInt(bonuses.check) : 0;

		for (let [id, abl] of Object.entries(system.abilities)) {
			abl.mod = Math.floor((abl.value - 10) / 2);
			abl.modHalf = abl.mod + Math.floor(system.details.level / 2);
			abl.prof = (abl.proficient || 0);
			if(game.settings.get("dnd4eAltus", "halfLevelOptions")) {
				abl.saveBonus = saveBonus;
				abl.checkBonus = checkBonus;
			} else {
				abl.saveBonus = saveBonus + Math.floor(system.details.level / 2);
				abl.checkBonus = checkBonus + Math.floor(system.details.level / 2);
			}
			abl.save = abl.mod + abl.prof + abl.saveBonus;

			abl.label = game.i18n.localize(DND4EALTUS.abilities[id]);
		}

		//AC mod check, check if light armour (or somthing else that add/negates adding mod)
		if((system.defences.ac.light || this.checkLightArmour() ) && system.defences.ac.altability !== "none") {
			system.defences.ac.ability = (system.abilities.dex.value >= system.abilities.int.value) ? "dex" : "int";
			if(system.defences.ac.altability != "")
			{
				// if(data.abilities[data.defences.ac.altability].value > data.abilities[data.defences.ac.ability].value)
				{
					system.defences.ac.ability = system.defences.ac.altability;
				}
			}
		}
		else {
			system.defences.ac.ability = "";
		}
		
		//set mods for defences
		system.defences.fort.ability = (system.abilities.str.value >= system.abilities.con.value) ? "str" : "con";
		system.defences.ref.ability = (system.abilities.dex.value >= system.abilities.int.value) ? "dex" : "int";
		system.defences.wil.ability = (system.abilities.wis.value >= system.abilities.cha.value) ? "wis" : "cha";

	}

	prepareDerivedData() {
		// Get the Actor's data object
		const actorData = this;
		const system = this.system;

		// this.system.halfLevelOptions = game.settings.get("dnd4eAltus", "halfLevelOptions");
		system.halfLevelOptions = game.settings.get("dnd4eAltus", "halfLevelOptions");

		//HP auto calc
		if(system.attributes.hp.autototal)
		{
			system.attributes.hp.max = system.attributes.hp.perlevel * (system.details.level - 1) + system.attributes.hp.starting + system.attributes.hp.misc + system.abilities.con.value;
			system.attributes.hp.max += system.attributes.hp.feat || 0;
			system.attributes.hp.max += system.attributes.hp.item || 0;
			system.attributes.hp.max += system.attributes.hp.power || 0;
			system.attributes.hp.max += system.attributes.hp.race || 0;
			system.attributes.hp.max += system.attributes.hp.untyped || 0;
		}
		
		// Healing Surges
		system.details.surges.max += system.details.surges.feat || 0;
		system.details.surges.max += system.details.surges.item || 0;
		system.details.surges.max += system.details.surges.power || 0;
		system.details.surges.max += system.details.surges.race || 0;
		system.details.surges.max += system.details.surges.untyped || 0;

		//Set Health related values
		if(!(system.details.surgeBon.bonus.length === 1 && jQuery.isEmptyObject(system.details.surgeBon.bonus[0]))) {
			for( const b of system.details.surgeBon.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					system.details.surgeBon.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						system.details.surgeBon.value += parseInt(val);
					}
				}
			}
		}
		system.details.surgeBon.value += system.details.surgeBon.feat || 0;
		system.details.surgeBon.value += system.details.surgeBon.item || 0;
		system.details.surgeBon.value += system.details.surgeBon.power || 0;
		system.details.surgeBon.value += system.details.surgeBon.race || 0;
		system.details.surgeBon.value += system.details.surgeBon.untyped || 0;
		
		if(!(system.details.secondwindbon.bonus.length === 1 && jQuery.isEmptyObject(system.details.secondwindbon.bonus[0]))) {
			for( const b of system.details.secondwindbon.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					system.details.secondwindbon.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						system.details.secondwindbon.value += parseInt(val);
					}
				}
			}
		}
		system.details.secondwindbon.value += system.details.secondwindbon.feat || 0;
		system.details.secondwindbon.value += system.details.secondwindbon.item || 0;
		system.details.secondwindbon.value += system.details.secondwindbon.power || 0;
		system.details.secondwindbon.value += system.details.secondwindbon.race || 0;
		system.details.secondwindbon.value += system.details.secondwindbon.untyped || 0;
		
		system.details.bloodied = Math.floor(system.attributes.hp.max / 2);
		system.details.surgeValue = Math.floor(system.details.bloodied / 2) + system.details.surgeBon.value;
		system.attributes.hp.min = -system.details.bloodied;
		system.details.secondWindValue = system.details.surgeValue + system.details.secondwindbon.value;

		//check if bloodied
		system.details.isBloodied = (system.attributes.hp.value <= system.attributes.hp.max/2);

		if(!(system.details.surgeEnv.bonus.length === 1 && jQuery.isEmptyObject(system.details.surgeEnv.bonus[0]))) {
			for( const b of system.details.surgeEnv.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					system.details.surgeEnv.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						system.details.surgeEnv.value += parseInt(val);
					}
				}
			}
		}
		system.details.surgeEnv.value += system.details.surgeEnv.feat || 0;
		system.details.surgeEnv.value += system.details.surgeEnv.item || 0;
		system.details.surgeEnv.value += system.details.surgeEnv.power || 0;
		system.details.surgeEnv.value += system.details.surgeEnv.race || 0;
		system.details.surgeEnv.value += system.details.surgeEnv.untyped || 0;

		//Death Saving Throw
		if(!(system.details.deathsavebon.bonus.length === 1 && jQuery.isEmptyObject(system.details.deathsavebon.bonus[0]))) {
			for( const b of system.details.deathsavebon.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					system.details.deathsavebon.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						system.details.deathsavebon.value += parseInt(val);
					}
				}
			}
		}
		system.details.deathsavebon.value += system.details.deathsavebon.feat || 0;
		system.details.deathsavebon.value += system.details.deathsavebon.item || 0;
		system.details.deathsavebon.value += system.details.deathsavebon.power || 0;
		system.details.deathsavebon.value += system.details.deathsavebon.race || 0;
		system.details.deathsavebon.value += system.details.deathsavebon.untyped || 0;

		if(!(system.details.saves.bonus.length === 1 && jQuery.isEmptyObject(system.details.saves.bonus[0]))) {
			for( const b of system.details.saves.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					system.details.saves.value += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						system.details.saves.value += parseInt(val);
					}
				}
			}
		}
		system.details.saves.value += system.details.saves.feat || 0;
		system.details.saves.value += system.details.saves.item || 0;
		system.details.saves.value += system.details.saves.power || 0;
		system.details.saves.value += system.details.saves.race || 0;
		system.details.saves.value += system.details.saves.untyped || 0;
		
		//Weight & Encumbrance
		system.encumbrance = this._computeEncumbrance(actorData.system);
			
		// const feats = DND4EALTUS.characterFlags;
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
		system.attributes.temphp.max = system.attributes.hp.max;

		if (system.attributes.temphp.value <= 0 )
			system.attributes.temphp.value = null;

		// Skill modifiers
		//Calc defence stats
		if(this.type === "NPC"){
			this.calcSkillNPC(system);
			this.calcDefenceStatsNPC(system);
		} else {
			this.calcSkillCharacter(system);
			this.calcDefenceStatsCharacter(system);
		}

		//calculate initiative
		let initBonusValue = 0;
		if(!game.settings.get("dnd4eAltus", "halfLevelOptions")){
			initBonusValue += Math.floor(system.details.level / 2);
		}

		if(!(system.attributes.init.bonus.length === 1 && jQuery.isEmptyObject(system.attributes.init.bonus[0]))) {
			for( const b of system.attributes.init.bonus) {
				if(b.active  && Helper._isNumber(b.value)) {
					initBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						initBonusValue += parseInt(val);
					}
				}
			}
		}
		//used for effects
		initBonusValue += system.attributes.init.bonusValue || 0;

		if(this.type === "NPC" && !system.advancedCals){
			system.attributes.init.value = (system.attributes.init.ability ? system.abilities[system.attributes.init.ability].mod : 0) + (system.attributes.init.base || 0) + initBonusValue;
		} else {
			system.attributes.init.value = system.attributes.init.ability ? system.abilities[system.attributes.init.ability].mod + initBonusValue : initBonusValue;
		}
		system.attributes.init.value += system.attributes.init.feat|| 0;
		system.attributes.init.value += system.attributes.init.item|| 0;
		system.attributes.init.value += system.attributes.init.power || 0;
		system.attributes.init.value += system.attributes.init.race || 0;
		system.attributes.init.value += system.attributes.init.untyped || 0;

		if(system.attributes.init.value > 999)
			system.attributes.init.value = 999;
		
		//calc movespeed
		let baseMoveBonusValue = system.movement.base.bonusValue || 0;
		
		if(!(system.movement.base.bonus.length === 1 && jQuery.isEmptyObject(system.movement.base.bonus[0]))) {
			for( const b of system.movement.base.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					baseMoveBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						baseMoveBonusValue += parseInt(val);
					}
				}
			}
		}
		for ( let i of this.items) {
			if(i.type !="equipment" || !i.system.equipped || !i.system.armour.movePen) { continue; };
			const absMovePen = Math.abs(i.system.armour.movePenValue)
			system.movement.base.armour -= absMovePen;
		}
		system.movement.base.bonusValue = baseMoveBonusValue;
		
		let walkBonusValue = system.movement.walk.bonusValue || 0;
		if(!(system.movement.walk.bonus.length === 1 && jQuery.isEmptyObject(system.movement.walk.bonus[0]))) {
			for( const b of system.movement.walk.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					walkBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						walkBonusValue += parseInt(val);
					}
				}
			}
		}
		system.movement.walk.bonusValue = walkBonusValue;	

		let chargeBonusValue = system.movement.charge.bonusValue || 0;
		if(!(system.movement.charge.bonus.length === 1 && jQuery.isEmptyObject(system.movement.charge.bonus[0]))) {
			for( const b of system.movement.charge.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					chargeBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						chargeBonusValue += parseInt(val);
					}
				}
			}
		}
		system.movement.charge.bonusValue = chargeBonusValue;	
		
		let runBonusValue = system.movement.run.bonusValue || 0;
		if(!(system.movement.run.bonus.length === 1 && jQuery.isEmptyObject(system.movement.run.bonus[0]))) {
			for( const b of system.movement.run.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					runBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						runBonusValue += parseInt(val);
					}
				}
			}
		}
		system.movement.run.bonusValue = runBonusValue;
	
		let climbBonusValue = system.movement.climb.bonusValue || 0;
		if(!(system.movement.climb.bonus.length === 1 && jQuery.isEmptyObject(system.movement.climb.bonus[0]))) {
			for( const b of system.movement.climb.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					climbBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						climbBonusValue += parseInt(val);
					}
				}
			}
		}
		system.movement.climb.bonusValue = climbBonusValue;	

		let shiftBonusValue = system.movement.shift.bonusValue || 0;
		if(!(system.movement.shift.bonus.length === 1 && jQuery.isEmptyObject(system.movement.shift.bonus[0]))) {
			for( const b of system.movement.shift.bonus) {
				if(b.active && Helper._isNumber(b.value)) {
					shiftBonusValue += parseInt(b.value);
				}
				else if(b.active){
					let val = Helper.replaceData(b.value,system)
					if(Helper._isNumber(val)){
						shiftBonusValue += parseInt(val);
					}
				}
			}
		}
		system.movement.shift.bonusValue = shiftBonusValue;	

		system.movement.base.value = system.movement.base.base +  baseMoveBonusValue + system.movement.base.temp;
		system.movement.base.value += system.movement.base.feat || 0;
		system.movement.base.value += system.movement.base.item || 0;
		system.movement.base.value += system.movement.base.power || 0;
		system.movement.base.value += system.movement.base.race || 0;
		system.movement.base.value += system.movement.base.untyped || 0;
		
		let walkForm = eval(Helper.replaceData(system.movement.walk.formula.replace(/@base/g,system.movement.base.value).replace(/@armour/g,system.movement.base.armour), system).replace(/[^-()\d/*+. ]/g, ''));
		system.movement.walk.value += walkForm + walkBonusValue + system.movement.base.temp;
		system.movement.walk.value += system.movement.walk.feat || 0;
		system.movement.walk.value += system.movement.walk.item || 0;
		system.movement.walk.value += system.movement.walk.power || 0;
		system.movement.walk.value += system.movement.walk.race || 0;
		system.movement.walk.value += system.movement.walk.untyped || 0;
		
		if (system.movement.walk.value < 0)
			system.movement.walk.value = 0;
		
		let runForm = eval(Helper.replaceData(system.movement.run.formula.replace(/@base/g,system.movement.base.value).replace(/@armour/g,system.movement.base.armour), system).replace(/[^-()\d/*+. ]/g, ''));
		system.movement.run.value = runForm + runBonusValue + system.movement.run.temp;
		system.movement.run.value += system.movement.run.feat || 0;
		system.movement.run.value += system.movement.run.item || 0;
		system.movement.run.value += system.movement.run.power || 0;
		system.movement.run.value += system.movement.run.race || 0;
		system.movement.run.value += system.movement.run.untyped || 0;
		
		if (system.movement.run.value < 0)
			system.movement.run.value = 0;

		let chargeForm = eval(Helper.replaceData(system.movement.charge.formula.replace(/@base/g,system.movement.base.value).replace(/@armour/g,system.movement.base.armour), system).replace(/[^-()\d/*+. ]/g, ''));
		system.movement.charge.value = chargeForm + chargeBonusValue + system.movement.charge.temp;
		system.movement.charge.value += system.movement.charge.feat || 0;
		system.movement.charge.value += system.movement.charge.item || 0;
		system.movement.charge.value += system.movement.charge.power || 0;
		system.movement.charge.value += system.movement.charge.race || 0;
		system.movement.charge.value += system.movement.charge.untyped || 0;
		
		if (system.movement.charge.value < 0)
			system.movement.charge.value = 0;

		let climbForm = eval(Helper.replaceData(system.movement.climb.formula.replace(/@base/g,system.movement.base.value).replace(/@armour/g,system.movement.base.armour), system).replace(/[^-()\d/*+. ]/g, ''));
		system.movement.climb.value = climbForm + climbBonusValue + system.movement.climb.temp;
		system.movement.climb.value += system.movement.climb.feat || 0;
		system.movement.climb.value += system.movement.climb.item || 0;
		system.movement.climb.value += system.movement.climb.power || 0;
		system.movement.climb.value += system.movement.climb.race || 0;
		system.movement.climb.value += system.movement.climb.untyped || 0;
		
		if (system.movement.climb.value < 0)
			system.movement.climb.value = 0;
		
		let shiftForm = eval(Helper.replaceData(system.movement.shift.formula.replace(/@base/g,system.movement.base.value).replace(/@armour/g,system.movement.base.armour),system).replace(/[^-()\d/*+. ]/g, ''));
		system.movement.shift.value = shiftForm + shiftBonusValue + system.movement.shift.temp;;
		system.movement.shift.value += system.movement.shift.feat || 0;
		system.movement.shift.value += system.movement.shift.item || 0;
		system.movement.shift.value += system.movement.shift.power || 0;
		system.movement.shift.value += system.movement.shift.race || 0;
		system.movement.shift.value += system.movement.shift.untyped || 0;

		if (system.movement.shift.value < 0)
			system.movement.shift.value = 0;
			
		//Passive Skills
		for (let [id, pas] of Object.entries(system.passive)) {
			let passiveBonusValue = 0;
			if(!(pas.bonus.length === 1 && jQuery.isEmptyObject(pas.bonus[0]))) {
				for( const b of pas.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						passiveBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,system)
						if(Helper._isNumber(val)){
							passiveBonusValue += parseInt(val);
						}
					}
				}
			}
			pas.bonusValue = passiveBonusValue;
			pas.value = 10 + system.skills[pas.skill].total + passiveBonusValue;
		}

		//Attack and damage modifiers
		for (let [id, mod] of Object.entries(system.modifiers)) {
			let modifierBonusValue = 0;
			if(!(mod.bonus.length === 1 && jQuery.isEmptyObject(mod.bonus[0]))) {
				for( const b of mod.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						modifierBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,system)
						if(Helper._isNumber(val)){
							modifierBonusValue += parseInt(val);
						}
					}
				}
			}

			mod.bonusValue = modifierBonusValue;
			mod.value += mod.class + mod.feat + mod.item + mod.power + (mod.untyped) + mod.race + modifierBonusValue + (mod.armourPen || 0);
			mod.label = game.i18n.localize(DND4EALTUS.modifiers[id]);
		}
		
		//Resistances & Weaknesses
		for (let [id, res] of Object.entries(system.resistances)) {

			let resBonusValue = 0;
			if(!(res.bonus.length === 1 && jQuery.isEmptyObject(res.bonus[0]))) {
				for( const b of res.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						resBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,system)
						if(Helper._isNumber(val)){
							resBonusValue += parseInt(val);
						}
					}
				}
			}
			for ( let i of this.items) {
				if(i.type !="equipment" || !i.system.equipped || i.system.armour.damageRes.parts.filter(p => p[1] === id).length === 0) { continue; };
				res.armour += i.system.armour.damageRes.parts.filter(p => p[1] === id)[0][0];
				break;
			}
			res.resBonusValue = resBonusValue;
			res.value += res.armour + resBonusValue;

			res.value += res.feat || 0;
			res.value += res.item || 0;
			res.value += res.power || 0;
			res.value += res.race || 0;
			res.value += res.untyped || 0;

			res.label = game.i18n.localize(DND4EALTUS.damageTypes[id]); //.localize("");
		}
		
		//Magic Items
		system.magicItemUse.perDay = Math.clamped(Math.floor(( system.details.level - 1 ) /10 + 1),1,3) + system.magicItemUse.bonusValue + system.magicItemUse.milestone;
	}


	/**
	 * Augment the basic actor data with additional dynamic data.
	 */
	prepareData() {
		super.prepareData(); // calls, in order: data reset (clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData()

		this.defaultSecondWindEffect();
	}


	/* -------------------------------------------- */

	/**
	 * Initializes the default ActiveEffect for SecondWind on a character.
	 */
	defaultSecondWindEffect(){
		if(this.system.details.secondwindEffect && Object.keys(this.system.details.secondwindEffect).length){
			return;
		}
		const secondwindEffect = {
			name: game.i18n.localize("DND4EALTUS.SecondWind"),
			icon: "icons/magic/life/heart-glowing-red.webp",
			origin: this.uuid,
			disabled:false,
			description: game.i18n.localize("DND4EALTUS.SecondWindEffect"),
			changes: [
				{key: "system.defences.ac.value", mode: 2, value: 2},
				{key: "system.defences.fort.value", mode: 2, value: 2},
				{key: "system.defences.ref.value", mode: 2, value: 2},
				{key: "system.defences.wil.value", mode: 2, value: 2},
			],
			flags:{dnd4eAltus:{effectData:{durationType:"startOfUserTurn"}}}
		};

		this.system.details.secondwindEffect = secondwindEffect;
	}

	/* -------------------------------------------- */

	calcDefenceStatsCharacter(data) {		
		for (let [id, def] of Object.entries(data.defences)) {
			
			def.label = game.i18n.localize(DND4EALTUS.def[id]);
			def.title = game.i18n.localize(DND4EALTUS.defensives[id]);
						
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
				if(i.type !="equipment" || !i.system.equipped ) { continue; };
				if(i.system.armour.type === "arms" && ["light", "heavy"].includes(i.system.armour.subType)){
					if(!i.system.proficient) {continue;} //if not proficient with a shield you do not gain any of its benefits
				}
				else if(i.system.armour.type === "armour" && id === "ref"){
					if(!i.system.proficient) { //if not proficient with armour you have -2 to Ref def and -2 to attack rolls
						def.armour -= 2;
						this.system.modifiers.attack.armourPen =-2;
					}
				}
				def.armour += i.system.armour[id];
			}

			let modBonus =  def.ability != "" ? data.abilities[def.ability].mod : 0;

			def.value += modBonus + def.armour + def.class + def.enhance + def.temp + defBonusValue;
			def.value += def.feat|| 0;
			def.value += def.item|| 0;
			def.value += def.power || 0;
			def.value += def.race || 0;
			def.value += def.untyped || 0;

			if(!game.settings.get("dnd4eAltus", "halfLevelOptions")) {
				def.value += Math.floor(data.details.level / 2);
			}
		}
	}

	calcDefenceStatsNPC(data) {
		for (let [id, def] of Object.entries(data.defences)) {
			
			def.label = game.i18n.localize(DND4EALTUS.def[id]);
			def.title = game.i18n.localize(DND4EALTUS.defensives[id]);
						
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
				if(i.type !="equipment" || !i.system.equipped ) { continue; };
				if(i.system.armour.type === "arms" && ["light", "heavy"].includes(i.system.armour.subType)){
					if(!i.system.proficient) {continue;} //if not proficient with a shield you do not gain any of its benefits
				}
				else if(i.system.armour.type === "armour" && id === "ref"){
					if(!i.system.proficient) { //if not proficient with armour you have -2 to Ref def and -2 to attack rolls
						def.armour -= 2;
						this.system.modifiers.attack.armourPen =-2;
					}
				}
				def.armour += i.system.armour[id];
			}
			if(def.base == undefined){
				def.base = 10;
				this.update({[`system.defences[${def}].base`]: 10 });
			}
			if(data.advancedCals){
				let modBonus =  def.ability != "" ? data.abilities[def.ability].mod : 0;

				def.value = def.base + modBonus + def.armour + def.class + def.enhance + def.temp + defBonusValue;
				if(!game.settings.get("dnd4eAltus", "halfLevelOptions")) {
					def.value += Math.floor(data.details.level / 2);
				}
				
			} else {
				def.value = def.base;		
			}

			def.value += def.feat|| 0;
			def.value += def.item|| 0;
			def.value += def.power || 0;
			def.value += def.race || 0;
			def.value += def.untyped || 0;
		}
	}

	calcSkillCharacter(system){
		for (const [id, skl] of Object.entries(system.skills)) {
			skl.value = parseFloat(skl.value || 0);

			let sklBonusValue = 0;
			let sklArmourPenalty = 0;

			if(!(skl.bonus.length === 1 && jQuery.isEmptyObject(skl.bonus[0]))) {
				for( const b of skl.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						sklBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,system)
						if(Helper._isNumber(val)){
							sklBonusValue += parseInt(val);
						}
					}
				}
			}
			if (skl.armourCheck) {
				//Get Skill Check Penalty stats from armour
				for ( let i of this.items) {
					if(i.type !="equipment" || !i.system.equipped || !i.system.armour.skillCheck) { continue; };
					sklArmourPenalty += Math.abs(i.system.armour.skillCheckValue);
				}
			}
			skl.armourPen = sklArmourPenalty;
			skl.sklBonusValue = sklBonusValue + sklArmourPenalty;

			if(skl.base == undefined){
				skl.base = 0;
				// this.update({[`system.skills[${skl}].base`]: 0 });
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

			let trainingBonus = 0;
			let featBonus = 0;
			let itemBonus = 0;
			let powerBonus = 0;
			let raceBonus = 0;
			switch (skl.training){
				case 8:
					trainingBonus = system.skillTraining.expertise.value + system.skillTraining.expertise.untyped;
					featBonus = Math.max(system.skillTraining.expertise.feat, skl.feat);
					itemBonus = Math.max(system.skillTraining.expertise.item, skl.item);
					powerBonus = Math.max(system.skillTraining.expertise.power, skl.power);
					raceBonus = Math.max(system.skillTraining.expertise.race, skl.race);
					break;
				case 5:
					trainingBonus = system.skillTraining.trained.value + system.skillTraining.trained.untyped;
					featBonus = Math.max(system.skillTraining.trained.feat, skl.feat);
					itemBonus = Math.max(system.skillTraining.trained.item, skl.item);
					powerBonus = Math.max(system.skillTraining.trained.power, skl.power);
					raceBonus = Math.max(system.skillTraining.trained.race, skl.race);
					break;
				case 0:
					trainingBonus = system.skillTraining.untrained.value + system.skillTraining.untrained.untyped;
					featBonus = Math.max(system.skillTraining.untrained.feat, skl.feat);
					itemBonus = Math.max(system.skillTraining.untrained.item, skl.item);
					powerBonus = Math.max(system.skillTraining.untrained.power, skl.power);
					raceBonus = Math.max(system.skillTraining.untrained.race, skl.race);
			}

			// Compute modifier
			skl.mod = system.abilities[skl.ability].mod;

			skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty;
			skl.total += featBonus || 0;
			skl.total += itemBonus || 0;
			skl.total += powerBonus || 0;
			skl.total += raceBonus || 0;
			skl.total += skl.untyped || 0;
			skl.total += trainingBonus;

			if(!game.settings.get("dnd4eAltus", "halfLevelOptions")) {
				skl.total += Math.floor(system.details.level / 2);
			}
		
			skl.label = skl.label? skl.label : game.i18n.localize(DND4EALTUS.skills[id]);
		}
	}

	calcSkillNPC(system){
		for (let [id, skl] of Object.entries(system.skills)) {
			skl.value = parseFloat(skl.value || 0);

			let sklBonusValue = 0;
			let sklArmourPenalty = 0;
			if(!(skl.bonus.length === 1 && jQuery.isEmptyObject(skl.bonus[0]))) {
				for( const b of skl.bonus) {
					if(b.active && Helper._isNumber(b.value)) {
						sklBonusValue += parseInt(b.value);
					}
					else if(b.active){
						let val = Helper.replaceData(b.value,system)
						if(Helper._isNumber(val)){
							sklBonusValue += parseInt(val);
						}
					}
				}
			}
			if (skl.armourCheck) {
				//Get Skill Check Penalty stats from armour
				for ( let i of this.items) {
					if(i.type !="equipment" || !i.system.equipped || !i.system.armour.skillCheck) { continue; };
					sklArmourPenalty += i.system.armour.skillCheckValue;
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
			skl.mod = system.abilities[skl.ability].mod;
			if(system.advancedCals){
				
				let trainingBonus = 0;
				let featBonus = 0;
				let itemBonus = 0;
				let powerBonus = 0;
				let raceBonus = 0;
				switch (skl.training){
					case 8:
						trainingBonus = system.skillTraining.expertise.value + system.skillTraining.expertise.untyped;
						featBonus = Math.max(system.skillTraining.expertise.feat, skl.feat);
						itemBonus = Math.max(system.skillTraining.expertise.item, skl.item);
						powerBonus = Math.max(system.skillTraining.expertise.power, skl.power);
						raceBonus = Math.max(system.skillTraining.expertise.race, skl.race);
						break;
					case 5:
						trainingBonus = system.skillTraining.trained.value + system.skillTraining.trained.untyped;
						featBonus = Math.max(system.skillTraining.trained.feat, skl.feat);
						itemBonus = Math.max(system.skillTraining.trained.item, skl.item);
						powerBonus = Math.max(system.skillTraining.trained.power, skl.power);
						raceBonus = Math.max(system.skillTraining.trained.race, skl.race);
						break;
					case 0:
						trainingBonus = system.skillTraining.untrained.value + system.skillTraining.untrained.untyped;
						featBonus = Math.max(system.skillTraining.untrained.feat, skl.feat);
						itemBonus = Math.max(system.skillTraining.untrained.item, skl.item);
						powerBonus = Math.max(system.skillTraining.untrained.power, skl.power);
						raceBonus = Math.max(system.skillTraining.untrained.race, skl.race);
				}

				skl.total = skl.value + skl.base + skl.mod + sklBonusValue + skl.effectBonus - sklArmourPenalty;
				skl.total += featBonus || 0;
				skl.total += itemBonus || 0;
				skl.total += powerBonus || 0;
				skl.total += raceBonus || 0;
				skl.total += skl.untyped || 0;
				skl.total += trainingBonus;
	
				if(!game.settings.get("dnd4eAltus", "halfLevelOptions")) {
					skl.total += Math.floor(system.details.level / 2);
				}

			} else {
				skl.total = skl.base;
			}

			skl.label = skl.label? skl.label : game.i18n.localize(DND4EALTUS.skills[id]);
		}
	}

	checkLightArmour(){
		for ( let i of this.items) {
			if(i.type !="equipment" || !i.system.equipped ) { 
				continue;
			}
			if(i.system.armour.type === "armour" && i.system.armour.subType === "heavy"){
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
			const hp = getProperty(this.system, attribute);
			const delta = isDelta ? (-1 * value) : (hp.value + hp.temp) - value;
			return this.applyDamage(delta);
		}
		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	}
	setConditions(newValue) {
		
		let newTemp = this.system.attributes.temphp.value;
		if(newValue < this.system.attributes.hp.value) {
			let damage = this.system.attributes.hp.value - newValue;
			
			if(this.system.attributes.temphp.value > 0) {
				newTemp -= damage;
				if(newTemp < 0) {
					newValue = this.system.attributes.hp.value + newTemp;
					newTemp = null;
				}
				else {
					newValue = this.system.attributes.hp.value;
				}
				
				this.update({[`system.attributes.temphp.value`]:newTemp});
			}
		}
		
		if(newValue > this.system.attributes.hp.max) newValue =  this.system.attributes.hp.max;
		else if(newValue < this.system.attributes.hp.min) newValue =  this.system.attributes.hp.min;
		
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
		const skl = this.system.skills[skillId];
		const bonuses = getProperty(this.system, "bonuses.abilities") || {};

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

		let flavText = this.system.skills[skillId].chat.replace("@name", this.name);
		flavText = flavText.replace("@label", this.system.skills[skillId].label);
		
		// Reliable Talent applies to any skill check we have full or better proficiency in
		//const reliableTalent = (skl.value >= 1 && this.getFlag("dnd4eAltus", "reliableTalent"));
		// Roll and return
		
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND4EALTUS.SkillPromptTitle", {skill: CONFIG.DND4EALTUS.skills[skillId]}),
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
		const label = abilityId; //CONFIG.DND4EALTUS.abilities[abilityId];
		const abl = this.system.abilities[abilityId];

		// Construct parts
		const parts = game.settings.get("dnd4eAltus", "halfLevelOptions") ? ["@mod"] : ["@mod", "@halfLevel"];
		const data = game.settings.get("dnd4eAltus", "halfLevelOptions") ? {mod: abl.mod} : {mod: abl.mod, halfLevel: Math.floor(this.system.details.level / 2)};

		// Add feat-related proficiency bonuses
		// const feats = this.data.flags.dnd4eAltus || {};
		// if ( feats.remarkableAthlete && DND4EALTUS.characterFlags.remarkableAthlete.abilities.includes(abilityId) ) {
			// parts.push("@proficiency");
			// data.proficiency = Math.ceil(0.5 * this.system.attributes.prof);
		// }
		// else if ( feats.jackOfAllTrades ) {
			// parts.push("@proficiency");
			// data.proficiency = Math.floor(0.5 * this.system.attributes.prof);
		// }

		// Add global actor bonus
		const bonuses = getProperty(this.system, "bonuses.abilities") || {};
		if ( bonuses.check ) {
			parts.push("@checkBonus");
			data.checkBonus = bonuses.check;
		}
		
		let flavText = this.system.abilities[abilityId].chat.replace("@name", this.name);
		flavText = flavText.replace("@label", this.system.abilities[abilityId].label);
		
		// Roll and return
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND4EALTUS.AbilityPromptTitle", {ability: CONFIG.DND4EALTUS.abilities[label]}),
			speaker: ChatMessage.getSpeaker({actor: this}),
			flavor: flavText,
			// flavor: "Flowery Text Here. MORE AND MORE AND \r\n MORE S MORE " + game.i18n.format("DND4EALTUS.AbilityPromptTitle", {ability: CONFIG.DND4EALTUS.abilities[label]}),
			// halflingLucky: feats.halflingLucky
		}));
	}
	
	rollDef(defId, options={}) {
		const label = defId;
		const def = this.system.defences[defId];

		// Construct parts
		const parts = ["@mod"];
		const data = {mod: def.value - 10};
		
		// Add global actor bonus
		const bonuses = getProperty(this.system, "bonuses.defences") || {};
		if ( bonuses.check ) {
			parts.push("@checkBonus");
			data.checkBonus = bonuses.check;
		}
		
		let flavText = this.system.defences[defId].chat.replace("@name", this.name);
		flavText = flavText.replace("@label", this.system.defences[defId].label);
		flavText = flavText.replace("@title", this.system.defences[defId].title);
		
		// Roll and return
		return d20Roll(mergeObject(options, {
			parts: parts,
			data: data,
			title: game.i18n.format("DND4EALTUS.DefencePromptTitle", {defences: CONFIG.DND4EALTUS.defensives[label]}),
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
					toCreate.push({tokenId: t.id, sceneId: t.scene.id, actorId: this.id, hidden: t.hidden});
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
		
		const isReroll = !!(game.combat.combatants.get(combatants[0]).initiative || game.combat.combatants.get(combatants[0]).initiative == 0)

		const parts = ['@init'];
		let init = this.system.attributes.init.value;
		const tiebreaker = game.settings.get("dnd4eAltus", "initiativeDexTiebreaker");
		if ( tiebreaker ) init += this.system.attributes.init.value / 100;
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

	async rollSave(event, options){
		//let message = `${game.i18n.localize("DND4EALTUS.RollSave")} ${options.dc || 10}`;
		
		let message =  `(${game.i18n.localize("DND4EALTUS.AbbreviationDC")} ${options.dc || 10})`;
		if(options.effectSave){
			message = `${game.i18n.localize("DND4EALTUS.SaveVs")} <strong>${this.effects.get(options.effectId).name}</strong> ${message}`;
		}else{
			message = `${game.i18n.localize("DND4EALTUS.RollSave")} ${message}`;
		}
		
		const parts = [this.system.details.saves.value];
		if (options.save) {
			parts.push(options.save)
		}

		const rollConfig = mergeObject({
			parts,
			actor: this,
			data: {},
			title: "",
			flavor: message,
			speaker: ChatMessage.getSpeaker({actor: this}),
			messageData: {"flags.dnd4eAltus.roll": {type: "attack", itemId: this.id }},
			fastForward: true,
			rollMode: options.rollMode
		});
		rollConfig.event = event;
		rollConfig.critical = options.dc - this.system.details.saves.value - options.save || 10;
		rollConfig.fumble = options.dc -1 - this.system.details.saves.value - options.save || 9;
		
		const saveDC = options.dc || 10;
		const r = await d20Roll(rollConfig);

		/* Changed the roll comparison to DC from rollConfig.critical, to fix discrepancy 
		between success/fail and effect removal when the actor has a save bonus  */
		if(options.effectSave && r.total >= saveDC){
			await this.effects.get(options.effectId).delete();
		}
	}

	async rollDeathSave(event, options){
		const updateData = {};
		
		let message = game.i18n.localize("DND4EALTUS.RollDeathSave");
		const parts = [this.system.details.deathsavebon.value]
		if (options.save) {
			parts.push(options.save)
		}
		const rollConfig = mergeObject({
			parts,
			actor: this,
			data: {},
			title: "",
			flavor: message,
			speaker: ChatMessage.getSpeaker({actor: this}),
			messageData: {"flags.dnd4eAltus.roll": {type: "save", itemId: this.id }},
			fastForward: true,
			rollMode: options.rollMode
		});
		rollConfig.event = event;
		rollConfig.critical = this.system.details.deathsaveCrit || 20;
		rollConfig.fumble = 9 - options.save - this.system.details.deathsavebon.value;
		const roll = await d20Roll(rollConfig);
		
		if(roll.total < 10)
		{
			updateData[`system.details.deathsavefail`] = this.system.details.deathsavefail + 1;
		}
		if( roll.total < 10 && this.system.details.deathsavefail + 1 >= this.system.details.deathsaves)
		{
			await ChatMessage.create({
				user: game.user.id,
				speaker: ChatMessage.getSpeaker(),
				content:this.name + game.i18n.localize("DND4EALTUS.DeathSaveFailure")
			});
		}
		else if(roll.total >= rollConfig.critical) {
			await ChatMessage.create({
				user: game.user.id,
				speaker: ChatMessage.getSpeaker(),
				content:this.name + game.i18n.localize("DND4EALTUS.DeathSaveCriticalSuccess")
			});
		}
		console.log(roll.total)
		console.log(rollConfig.critical)
		await this.update(updateData);
	}

	async shortRest(event, options){
		const updateData = {};
		updateData[`system.attributes.hp.value`] = this.system.attributes.hp.value;
		
		if(options.surge > 0)
		{
			if(options.surge > this.system.details.surges.value)
			options.surge = this.system.details.surges.value;
			
			let r = new Roll("0");
			let healamount = 0;
			for(let i = 0; i < options.surge; i++){
				
				if(options.bonus != "" ){
					r = new Roll(options.bonus);
					try{
						await r.roll({async : true});

					}catch (error){
						ui.notifications.error(game.i18n.localize("DND4EALTUS.InvalidHealingBonus"));
						r = new Roll("0");
						await r.roll({async : true});
					}
				}
				healamount += this.system.details.surgeValue + (r.total || 0);
				console.log(`surgeValue:${this.system.details.surgeValue}`)
				console.log(`total:${r.total}`)
				console.log(`healamount:${healamount}`)
			}

			if (healamount){
			    updateData[`system.attributes.hp.value`] = Math.min(
				    (Math.max(0, this.system.attributes.hp.value) + healamount),
			    	this.system.attributes.hp.max
			    );
			}
		
			if(this.system.details.surges.value > 0)
				updateData[`system.details.surges.value`] = this.system.details.surges.value - options.surge;
			
		}
		
		if(!this.system.attributes.hp.temprest)
			updateData[`system.attributes.temphp.value`] = "";
		
		updateData[`system.details.secondwind`] = false;
		updateData[`system.actionpoints.encounteruse`] = false;
		updateData[`system.magicItemUse.encounteruse`] = false;
		
		Helper.rechargeItems(this, ["enc", "round"]);
		Helper.endEffects(this, ["endOfTargetTurn", "endOfUserTurn","startOfTargetTurn","startOfUserTurn","endOfEncounter"]);
		
		if(this.type === "Player Character"){
			console.log(updateData[`system.attributes.hp.value`])
			console.log(this.system.attributes.hp.value)
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this, alias: this.name},
				content: options.surge >= 1 ? `${this.name} ${game.i18n.localize('DND4EALTUS.ShortRestChat')}, ${game.i18n.localize('DND4EALTUS.Spending')} ${options.surge} ${game.i18n.localize('DND4EALTUS.SurgesSpendRegain')} ${(updateData[`system.attributes.hp.value`] - Math.max(0, this.system.attributes.hp.value))} ${game.i18n.localize('DND4EALTUS.HPShort')}.`
					: `${this.name} ${game.i18n.localize('DND4EALTUS.ShortRestChat')}`
				
			});				
		}

		for (let r of Object.entries(this.system.resources)) {
			if(r[1].sr && r[1].max) {
				updateData[`system.resources.${r[0]}.value`] = r[1].max;
			}
		}


		if(!game.settings.get("dnd4eAltus", "deathSaveRest")){
			updateData[`system.details.deathsavefail`] = 0;
		}

		// console.log(updateData[`system.attributes.hp.value`]);
		// console.log(this.system.attributes.hp.value);

		await this.update(updateData);
	}

	// also known as the Extended Rest
	async longRest(event, options){
		const updateData = {};
		
		// Check if the Extended Rest is in a "Hospitable Environment" or an area of "Environmental Danger"
		if(options.envi == "false")
		{
			if(this.system.details.surgeEnv.value > this.system.details.surges.max)
			{
				updateData[`system.details.surges.value`] = 0;
				updateData[`system.attributes.hp.value`] = this.system.attributes.hp.max + (this.system.details.surges.max - this.system.details.surgeEnv.value) *  Math.floor(this.system.details.bloodied / 2);
			}
			else{
				updateData[`system.details.surges.value`] = this.system.details.surges.max - this.system.details.surgeEnv.value;
				updateData[`system.attributes.hp.value`] = this.system.attributes.hp.max;
			}

			if (game.settings.get("dnd4eAltus", "deathSaveRest") <= 1){
				updateData[`system.details.deathsavefail`] = 0;
			}
		}
		else
		{
			updateData[`system.details.surges.value`] = this.system.details.surges.max;
			updateData[`system.attributes.hp.value`] = this.system.attributes.hp.max;
			
			updateData[`system.details.surgeEnv.value`] = 0;
			updateData[`system.details.surgeEnv.bonus`] = [{}];

			if(game.settings.get("dnd4eAltus", "deathSaveRest") <= 2){
				updateData[`system.details.deathsavefail`] = 0;
			}
		}

		updateData[`system.attributes.temphp.value`] = "";
		updateData[`system.actionpoints.value`] = 1;
		updateData[`system.magicItemUse.milestone`] = 0;
		updateData[`system.magicItemUse.dailyuse`] = this.system.magicItemUse.perDay;
		
		updateData[`system.details.secondwind`] = false;
		updateData[`system.actionpoints.encounteruse`] = false;
		updateData[`system.magicItemUse.encounteruse`] = false;
		
		Helper.rechargeItems(this, ["enc", "day", "round"]);
		Helper.endEffects(this, ["endOfTargetTurn", "endOfUserTurn","startOfTargetTurn","startOfUserTurn","endOfEncounter", "endOfDay"]);


		if(this.type === "Player Character"){
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this, alias: this.system.name},
				// flavor: restFlavor,
				content: `${this.name} ${game.i18n.localize('DND4EALTUS.LongRestResult')}.`
			});
		}
		
		for (let r of Object.entries(this.system.resources)) {
			if((r[1].sr || r[1].lr) && r[1].max) {
				updateData[`system.resources.${r[0]}.value`] = r[1].max;
			}
		}

		await this.update(updateData);
	}

	/* -------------------------------------------- */

	/**
	 * Appying Second Wind effect to actor.
	 * @param {MouseEvent} event	The originating click event
	 * @param {object} options		Options which can hold addtional bonuses
	 */
	async secondWind(event, options){
		let r = await Helper.rollWithErrorHandling(options.bonus, { errorMessageKey: "DND4EALTUS.InvalidHealingBonus"})

		const updateData = {};
		if(this.system.attributes.hp.value <= 0) {
			updateData[`system.attributes.hp.value`] = Math.min(
				(this.system.details.secondWindValue + (r.total || 0)),
				this.system.attributes.hp.max
			);
		} else {
			updateData[`system.attributes.hp.value`] = Math.min(
				(this.system.attributes.hp.value + this.system.details.secondWindValue + (r.total || 0)),
				this.system.attributes.hp.max
			);
		}

		updateData[`system.details.secondwind`] = true;
		
		if(this.system.details.surges.value > 0){
			updateData[`system.details.surges.value`] = this.system.details.surges.value - 1;
		}

		let extra = "";
		if (this.system.details.secondwindbon.custom) {
			extra = this.system.details.secondwindbon.custom;
			extra = extra.replace(/;/g,'</li><li>');
			extra = "<li>" + extra + "</li>";
		}

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this, alias: this.name},
			// flavor: restFlavor,
			content: `${this.name} ${game.i18n.localize("DND4EALTUS.SecondWindChat")} ${(updateData[`system.attributes.hp.value`] - Math.max(0, this.system.attributes.hp.value))} ${game.i18n.localize("DND4EALTUS.HPShort")} ${game.i18n.localize("DND4EALTUS.SecondWindChatEffect")}
				<ul>
					<li>${game.i18n.localize("DND4EALTUS.SecondWindEffect")}</li>
					${extra}
				</ul>`,
				// content: this.system.name + " uses Second Wind, healing for " + (updateData[`system.attributes.hp.value`] - this.system.attributes.hp.value) + " HP, and gaining a +2 to all defences until the stars of their next turn."
			//game.i18n.format("DND4EALTUS.ShortRestResult", {name: this.name, dice: -dhd, health: dhp})
		});		
	
		this.applySecondWindEffect();
		await this.update(updateData);
	}

	/* -------------------------------------------- */

	/**
	 * Creats a new emebeded effect based on data stored in this.system.details.secondwindEffect.
	 */
	async applySecondWindEffect(){
		if(this.system.details.secondwindEffect){
			await this.createEmbeddedDocuments("ActiveEffect", [this.system.details.secondwindEffect]);
		}
	}

	async actionPoint(event, options){

		let extra = "";
		if (this.system.actionpoints.custom !== "") {
			extra = this.system.actionpoints.custom;
			extra = extra.replace(/\n/g,'</li><li>');
			extra = "<li>" + extra + "</li>";
		}

		if(this.system.actionpoints.value >= 1) {
			ChatMessage.create({
				user: game.user.id,
				speaker: {actor: this, alias: this.name},
				// flavor: restFlavor,
				content: `${this.name} ${game.i18n.localize("DND4EALTUS.ActionPointUseChat")}:
				<ul>
					<li>${game.i18n.localize("DND4EALTUS.ActionPointEffect")}</li>
					${extra}
				</ul>`
			});

			const updateData = {};
			updateData[`system.actionpoints.value`] = this.system.actionpoints.value -1;
			updateData[`system.actionpoints.encounteruse`] = true;

			await this.update(updateData);
		}
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
					// if ( t === "weapon" ) initial["system.proficient"] = true;
					if ( ["weapon", "equipment"].includes(t) ) initial["system.equipped"] = true;
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
	* @param {} options   Options for using the power
	*/
	
	async usePower(item, {configureDialog=true, fastForward=false}={}) {
		//if not a valid type of item to use
		console.log("UsePower")
		if ( item.type !=="power" ) throw new Error("Wrong Item type");
		const itemData = item.system;
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
			if ( uses <= 0 ) ui.notifications.warn(game.i18n.format("DND4EALTUS.ItemNoUses", {name: item.name}));
			
			await item.update({"system.uses.value": Math.max(parseInt(item.system.uses.value || 0) - 1, 0)})
			// item.update({"system.uses.value": Math.max(parseInt(item.system.uses.value || 0) - 1, 0)})
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
		if ( game.settings.get("dnd4eAltus", "currencyWeight") ) {
			for (let [e, v] of Object.entries(actorData.currency)) {
				weight += (e == "ad" ? v/500 : v/50);
			}
		}
		// console.log(game.settings.get("dnd4eAltus", "currencyWeight"))
		//Weight Ritual Components
		for (let [e, v] of Object.entries(actorData.ritualcomp)) {
			// weight += v/100 * 2.205;
			weight += v * 0.000002;
		}
		//4e 1gp or residuum weights 0.000002
		
		const physicalItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
		weight += this.items.reduce((weight, i) => {
			if ( !physicalItems.includes(i.type) ) return weight;
				const q = i.system.quantity || 0;
				const w = i.system.weight || 0;
				return weight + (q * w);
			}, 0);
	  

		//round to nearest 100th.
		weight = Math.round(weight * 1000) / 1000;

		const max = eval(Helper.replaceData(actorData.encumbrance.formulaNorm, actorData).toString().replace(/[^-()\d/*+. ]/g, ''));
		const maxHeavy = eval(Helper.replaceData(actorData.encumbrance.formulaHeavy, actorData).toString().replace(/[^-()\d/*+. ]/g, ''));
		const maxMax = eval(Helper.replaceData(actorData.encumbrance.formulaMax, actorData).toString().replace(/[^-()\d/*+. ]/g, ''));

		//set ppc Percentage Base Carry-Capasity
		const pbc = Math.clamped(weight / max * 100, 0, 99.7);
		//set ppc Percentage Encumbranced Capasity
		const pec =	Math.clamped(weight / (max ) * 100 - 100, 1, 99.7);
		const encumBar = weight > max ? "#b72b2b" : "#6c8aa5";

		return {
			value: weight,
			max,
			maxHeavy,
			maxMax,
			formulaNorm: actorData.encumbrance.formulaNorm,
			formulaHeavy: actorData.encumbrance.formulaHeavy,
			formulaMax: actorData.encumbrance.formulaMax,
			pbc,
			pec,
			encumBar,
			encumbered: weight > max
		};
	}

	async calcDamage(damage, multiplier=1, surges=0){
	//This now calls calcDamageInner() to get the value, so we can do the damage calculation without also applying the damage, if needs be.
		const totalDamage = await this.calcDamageInner(damage, multiplier,surges);
		this.applyDamage(totalDamage, multiplier, surges);
	}
	
	async calcDamageInner(damage, multiplier=1, surges=0){
	//Provides the actual damage value to calcDamage(), but does not itself apply damage. Call this directly if you need to get the correct value without dealing the damage.
		if(game.settings.get("dnd4eAltus", "damageCalcRules") === "errata"){
			return this.calcDamageErrata(damage, multiplier,surges);
		}
		else {
			return this.calcDamagePHB(damage, multiplier, surges);
		}
	}

	async calcDamageErrata(damage, multiplier, surges){
		let totalDamage = 0;

		console.log(damage)
		for(let d of damage){
			console.log(d);
			//get all the damageTypes in this term
			let damageTypesArray = d[1].replace(/ /g,'').split(',');

			const actorRes = this.system.resistances;
			
			let resAll = actorRes['damage'].value;
			let isDamageImmune = actorRes['damage'].immune;
			
			/* Special logic for ongoing damage.
				Compare our "ongoing" res/immunity to our "all" res/immunity and use the best/highest value */
			if ( damageTypesArray.includes("ongoing") ){
				if (actorRes['ongoing'].immune) isDamageImmune = actorRes['ongoing'].immune;

				resAll = Helper.sumExtremes([resAll,actorRes['ongoing'].value] || 0);
			}
			
			let isImmuneAll = true; //starts as true, but as soon as one false it can not be changed back to true
			let lowestRes = Infinity; // will attempt to replace this with the lowest resistance / highest vunrability

			for(let dt of damageTypesArray){
				const type = dt && actorRes[dt] ? dt : 'damage';
				//Skip if we're immune, or if the current type is ongoing (that's handled in a special way later)
				if( dt == "ongoing" || actorRes[type]?.immune ) continue;
				
				//Adjust specific resistance with "resist all" value, according to combining resistance/vulnerability rules
				const currentRes = Helper.sumExtremes([resAll,actorRes[type]?.value || 0]);
	
				if(currentRes !== 0 ){ //if has resistances or vulnerability
					isImmuneAll=false;
					//console.log(`Modifier found: ${type}  ${actorRes[type].value}`);
					if(currentRes < lowestRes){
						lowestRes = currentRes;
					}
				} else {
					if(!isDamageImmune) {
						isImmuneAll=false;
						if(resAll){ //"Resist all" will stand in for any other damage that does not have a value
							if(resAll < lowestRes){
								lowestRes = resAll || 0;
							}
						}
						else if(currentRes < lowestRes){
							lowestRes = currentRes || 0;
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

		//console.log(`TotalDamage: ${totalDamage}, Multiplier: ${multiplier}`)
		return totalDamage;
	}

	async calcDamagePHB(damage, multiplier, surges){
		let damageDealt = {};
		let totalDamage = 0;
		const actorRes = this.system.resistances;
		console.log(damage);

		for(let d of damage){
			// Check if "ongoing" is in our types array, and if so remove it before dividing up the damage.
			const isOngoing = d[1].includes("ongoing");
			if(isOngoing) d[1] = d[1].replaceAll(/(,| )*ongoing(,| )*/g,"");
			
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

			let resAll = actorRes['damage'].value;
			let isDamageImmune = actorRes['damage'].immune;
			
			/* Special logic for ongoing damage.
			Compare our "ongoing" res/immunity to our "all" res/immunity and use the best/highest value */
			if ( isOngoing ){
				if (actorRes['ongoing'].immune) isDamageImmune = actorRes['ongoing'].immune;

				resAll = Helper.sumExtremes([resAll,actorRes['ongoing']?.value] || 0);
			}

			//If we have immune all, skip the resistance comparisons
			if ( !isDamageImmune) {
				for(const d in damageDealt){
					const damagetype = actorRes[d] ? d : 'damage';
					if(actorRes[damagetype].immune) continue; //No damage to immune types
					//if(isDamageImmune && !actorRes[damagetype].value) continue;
					let res = Helper.sumExtremes([resAll,actorRes[damagetype]?.value || 0]);

					/*Should be unnecessary when adjusting resistances in the previous step
					if(!res && resAll){
						res = resAll;
					}*/
					
					totalDamage += Math.max(0, damageDealt[d]-res);
				}
			}
		}
		console.log(damageDealt);
		console.log(`Total Damage: ${totalDamage}`)
		return totalDamage;
	}

	async applyDamage(amount=0, multiplier=1, surges={}) {
		amount = Math.floor(parseInt(amount) * multiplier);
		
		// Healing Surge related checks
		if(surges.surgeAmount){
			if(this.system.details.surges.value < surges.surgeAmount){ //check to see if enough surges left to use tihs source
				ui.notifications.error(game.i18n.localize("DND4EALTUS.HealingSurgeWarning"));
				return;
			}
			else if(this.system.attributes.hp.value >= this.system.attributes.hp.max){
				ui.notifications.error(game.i18n.localize("DND4EALTUS.HealingOverWarning"));
				return;
			}
			amount+= this.system.details.surgeValue*surges.surgeAmount*multiplier
		}
		if(surges.surgeValueAmount){
			amount+= this.system.details.surgeValue*surges.surgeValueAmount*multiplier
		}
		
		const healFromZero = true; // If true, healing HP starts from zero (the usual for 4e). On false, it follows normal arithmetic
		const hp = this.system.attributes.hp;

		// Deduct damage from temp HP first
		const tmp = parseInt(this.system.attributes.temphp.value) || 0;
		const dt = amount > 0 ? Math.min(tmp, amount) : 0;
		// Remaining goes to health
		//const tmpMax = parseInt(hp.tempmax) || 0;
		amount = amount - dt;
		var newHp = hp.value;
		if (amount > 0) // Damage
			{
			newHp = Math.clamped(hp.value - amount, (-1)*this.system.details.bloodied, hp.max);
			}
		else if (amount < 0) // Healing
			{
			if (healFromZero == true && hp.value < 0)
				{
				newHp = 0;
				}
			newHp = Math.clamped(newHp - amount, (-1)*this.system.details.bloodied, hp.max);
			}
	
		// Update the Actor
		const updates = {
			"system.attributes.temphp.value": tmp - dt,
			"system.attributes.hp.value": newHp
		};
	
		//spend healing surges
		if(multiplier < 0  && surges.surgeAmount){
			updates["system.details.surges.value"] =  this.system.details.surges.value - surges.surgeAmount;
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

	async applyTempHpChange(amount=0) {
		if (!this.canUserModify(game.user, "update")) {
			return
		}

		const hp = this.system.attributes.hp;
		console.log(hp)

		// calculate existing temp hp
		const tmp = parseInt(this.system.attributes.temphp.value) || 0;

		if (amount >= 0) {
			// temp HP doesn't stack, so only update if we have a higher value
			if (amount > tmp) {
				const updates = {
					"system.attributes.temphp.value": amount,
				};
				return this.update(updates);
			}
		}
		else {
			// amount is negative, so subtract from temp HP, but floor at 0
			let newTempHP = tmp + amount
			newTempHP = Math.max(0, newTempHP)
			const updates = {
				"system.attributes.temphp.value.value": newTempHP,
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
			this.prototypeToken.updateSource({vision: true, actorLink: true, disposition: 1});
		}
	}

	async newActiveEffect(effectData){
		console.log(effectData)
		return this.createEmbeddedDocuments("ActiveEffect", [{
			name: effectData.name,
			description: effectData.description,
			icon:effectData.icon,
			origin: effectData.origin,
			sourceName: effectData.sourceName,
			statuses: Array.from(effectData.statuses),
			// duration: effectData.duration, //Not too sure why this fails, but it does
			duration: {rounds: effectData.rounds, startRound: effectData.startRound},
			tint: effectData.tint,
			flags: effectData.flags,
			changes: effectData.changes
		}]);
	}

	async newActiveEffectSocket(effectData){
		const data = {
			name: effectData.name,
			description: effectData.description,
			icon:effectData.icon,
			origin: effectData.origin,
			sourceName: effectData.sourceName,
			statuses: Array.from(effectData.statuses),
			duration: {rounds: effectData.rounds, startRound: effectData.startRound},
			tint: effectData.tint,
			flags: effectData.flags,
			changes: effectData.changes
		}

		return this.createEmbeddedDocuments("ActiveEffect", [data]);
	}

	async deleteActiveEffectSocket(toDelete){
		return this.deleteEmbeddedDocuments("ActiveEffect", toDelete);
	}

	async promptEoTSavesSocket(){
		//console.log('socket reached');
		const saveReminders = game.settings.get("dnd4eAltus","saveReminders");
		if(!saveReminders) return;
		
		let toSave = [];
		for (const e of this.effects){
			if(e.flags.dnd4eAltus?.effectData?.durationType === "saveEnd"){
				toSave.push(e.id);
			}
		}
		
		if(toSave.length){
			const isFF = Helper.isRollFastForwarded(event);
			for (let i of toSave){
				if(isFF) {
					let save = await this.rollSave(event, {effectSave:true, effectId:i});
				} else {
					let save = await new SaveThrowDialog(this, {effectSave:true,effectId:i}).render(true);
				}
			}
		}

	}

	async autoDoTsSocket(tokenId){
		//console.log(tokenId);
		const autoDoTs = game.settings.get("dnd4eAltus","autoDoTs");
		if(autoDoTs != "none"){
			let applicableDoTs = {};
			
			for(const e of this.effects){
				if(e.flags.dnd4eAltus?.dots.length && e.disabled === false){
					for (let dot of e.flags.dnd4eAltus.dots){
						
						// Combine the types array into a usable string
						const types = (dot.typesArray.includes("healing") ? "healing" : dot.typesArray.join(','));
						
						/* Use logic pinched from ActiveEffect4e.safeEvalEffectValue() to 
						evaluate variables in "amount" string */
						const stringDiceFormat = /\d+d\d+/;
						let parsedAmount = dot.amount;

						if (!parsedAmount.match(stringDiceFormat))
						  parsedAmount = Roll.replaceFormulaData(game.helper.commonReplace(parsedAmount, this), this.getRollData());
						try {
						  parsedAmount = Roll.safeEval(parsedAmount).toString();
						} catch (e) { /* noop */ }
						/* End pinched */
						
						// Only keep the highest DoT of each unique type—
						// you can only be so much on fire.
						if (parsedAmount - applicableDoTs[types]?.amount <= 0){
							continue;
						} else {
							applicableDoTs[types] = { 
								type: ( types == "healing" ? types : types + ',ongoing'), 
								amount:parsedAmount, 
								effectId:e.id, 
								effectName: e.name 
							};
						}
					}
				}
			}
			
			applicableDoTs = Array.from(Object.values(applicableDoTs || {}));
			
			if(applicableDoTs.length){
				for(const dot of applicableDoTs){
					const dmgTaken = ( dot.type == "healing" ? Math.min(dot.amount, this.system.attributes.hp.max - this.system.attributes.hp.value) : await this.calcDamageInner([[dot.amount,dot.type]]));
					console.log(this.calcDamageInner([[dot.amount,dot.type]]));
					let dmgImpact = "neutral";
					
					let chatRecipients = [Helper.firstOwner(this)];
					switch (game.settings.get("dnd4eAltus","autoDoTsPublic")){
						case 'all':
							chatRecipients = null;
							break;
						case 'none':
							if(chatRecipients[0] != game.user){
								chatRecipients.push(game.user);
							}
							break;
						case 'pcs':
							if(this.type == "Player Character"){
								chatRecipients = null;
							}
							break;
					}
					
					if(dot.type == "healing"){
						dmgImpact="healing";
					}else if(dmgTaken == 0){
						dmgImpact = "resistant-full";
					}else if (dot.amount - dmgTaken > 0){
						dmgImpact = "resistant";
					}else if (dot.amount - dmgTaken < 0){
						dmgImpact = "vulnerable";
					}
					
					const chatData = {
						dot: dot,
						autoDoTs: autoDoTs,
						dmgTaken: dmgTaken,
						dmgDiff: Math.max(dot.amount,dmgTaken) - Math.min(dot.amount,dmgTaken),
						typesFormatted: dot.type.replaceAll(/,*ongoing,*/g,"").replaceAll(',',' and '),
						actorName: this.isToken ? this.token.name : this.name,
						dmgImpact: dmgImpact,
						targetToken: tokenId
					}
					
					const html = await renderTemplate(
						'systems/dnd4eAltus/templates/chat/ongoing-damage.html',chatData 
					);
										
					await ChatMessage.create({
						user: Helper.firstOwner(this),
						speaker: {actor: this, alias: this.isToken ? this.token.name : this.name},
						content: html,
						flavor: `${game.i18n.localize ("DND4EALTUS.OngoingDamage")}: ${dot.effectName}`,
						whisper: chatRecipients,
						//rollMode: "gmroll",
						rolls: [{
							formula: `(${dot.amount})[${dot.type}]`,
							terms: [{
								class: "NumericTerm",
								options: {
									flavor: dot.type
								},
								evaluated: true,
								number: dot.amount
							}],
							total: dot.amount,
							evaluated: true
						}]
					});						
					
					if (autoDoTs == "apply"){
						if (dot.type == "healing"){
							await this.applyDamage(dmgTaken*-1);
						}else{
							await this.applyDamage(dmgTaken);
						}
					}
				}
			}
		}
	}

}
