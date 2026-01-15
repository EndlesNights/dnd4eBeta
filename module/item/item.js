import {d20Roll, damageRoll, getAttackRollBonus} from "../dice.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import {MeasuredTemplate4e} from "../canvas/ability-template.js";
import { Helper } from "../helper.js"
import { DND4E } from "../config.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class Item4e extends Item {

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);

		if ( foundry.utils.hasProperty(changed, "system.container") ) {
			options.formerContainer = (await this.container)?.uuid;
		}

		// Check for implement weapon type and set weapon implement property to true
		if (this.type === "weapon" && changed.system?.weaponType === "implement"){
			foundry.utils.setProperty(changed, "system.properties.imp", true);
		}

		if (this.system.type === "consumable") {
			const system = this.system
			// does it have an old damage expression
			if (system.damage.parts?.length > 0) {
				console.log("DnD4e: Updating an obsolete consumable that somehow still had a parts roll")
				// ok so need to fix it
				if (system.damage.parts.map(d => d[1]).includes("healing") && !changed.system.hit?.healFormula) {
					foundry.utils.setProperty(changed, "system.hit.healFormula", system.damage.parts[0][0])
					foundry.utils.setProperty(changed, "system.hit.isHealing", true)
				}
				foundry.utils.setProperty(changed, "system.damage.parts", [])
				// non healing damage expressions didn't work anyway
			}
			if (system.oldConsumableNeedsUpdate === true) {
				console.log("DnD4e: Updating an obsolete consumable")
				foundry.utils.setProperty(changed, "system.damage.parts", [])
				foundry.utils.setProperty(changed, "system.hit.healFormula", system.hit.healFormula)
				foundry.utils.setProperty(changed, "system.hit.isHealing", system.hit.isHealing)
				delete system.oldConsumableNeedsUpdate
			}
		}

		if (this.system.type === "ritual") {
			const system = this.system
			if (system.oldRitualNeedsUpdating === true) {
				console.log("DnD4e: Updating an obsolete ritual")
				foundry.utils.setProperty(changed, "system.formula", "@attribute")
				delete system.oldRitualNeedsUpdating
			}
		}
	}

	get preparedMaxUses() {
		const system = this.system;
		if (!system.uses?.max) return null;
		let max = system.uses.max;
	
		// If this is an owned item and the max is not numeric, we need to calculate it
		if (this.isOwned && !Number.isNumeric(max)) {
		  if (this.actor.system === undefined) return null;
		  try {
			max = Helper.commonReplace(max, this.actor);
			max = Roll.replaceFormulaData(max, this.actor.getRollData(), {missing: 0, warn: true});
			max = Roll.safeEval(max);
		  } catch(e) {
			console.error("Problem preparing Max uses for", this.name, e);
			return null;
		  }
		}
		return Math.round(Number(max));
	}	
	  

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		
		this._onCreationName(data);

		if ( !this.isEmbedded) return;
		const isNPC = this.parent.type === "NPC";
		let updates;
		switch (data.type) {
			case "equipment":
				updates = this._onCreateOwnedEquipment(data, isNPC);
				break;
			case "weapon":
				updates = this._onCreateOwnedWeapon(data, isNPC);
				break;
		}
		if ( updates ){
			console.log(updates)
			return this.updateSource(updates);
		} 
	}

	/* -------------------------------------------- */

	static migrateData(data) {
		super.migrateData(data);
		this.#migrateOldFeatures(data);
		return data;
	}

	/* -------------------------------------------- */

	/**
	 * Migrate source data from old feat-types to feature type
	 * @param {object} data	The source data from which to migrate, mutated here
	 */
	static #migrateOldFeatures(data) {
		const sourceType = data.type;
		if(!(['classFeats','feat','raceFeats','pathFeats','destinyFeats'].includes(sourceType))) return;
		foundry.utils.setProperty(data, "flags.dnd4e.migrateType", true);
		data.type = "feature";
		data.system ??= {};
		switch(sourceType){
			case "classFeats":
				data.system.featureType = "class";
				delete data.system.class;
				delete data.system.hitFistLevel;
				delete data.system.surgePerDay;
				delete data.system.skills;
				delete data.system.def;
				delete data.system.proficiencies;
				break;
			case "feat":
				data.system.featureType = "feat";
				delete data.system.recharge;
				break;
			case "raceFeats":
				data.system.featureType = "race";
				break;
			case "pathFeats":
				data.system.featureType = "path";
				break;
			case "destinyFeats":
				data.system.featureType = "destiny";
				break;
			default:
				data.system.featureType = "other";
		}
		
		data.system.level ??= "";
		data.system.requirements ??= "";
		data.system.featureSource = "";
		data.system.featureGroup = "";
		data.system.auraSize = "";
		data.system.effectType = {};
		data.system.damageType = {};
		data.system.keywordsCustom = "";
		
		// Remove obsolete properties
		delete data.system.activation;
		delete data.system.duration;
		delete data.system.target;
		delete data.system.range;
		delete data.system.uses;
		delete data.system.consume;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for setting up name of Items.
	 *
	 * @param {object} data       Data for the newly created item.
	 */ 
	_onCreationName(data){
		if(data.system) return;

		const labeltype = game.i18n.localize("DOCUMENT.Item");
		const defaultLable = game.i18n.format("DOCUMENT.New", {type: labeltype});
		const regexPattern = `${defaultLable} \\(\\d+\\)`;
		const regex = new RegExp(regexPattern, 'g');

		if(data.name !== defaultLable && !regex.test(data.name)) return;

		const updates = {};
		let count = 0;
		this.collection.forEach((item) =>{
			if(item.type == this.type) count ++;
		})
		
		let newName = game.i18n.format("DND4E.ItemNew", {type: data.type.capitalize()})
		if(count) newName += ` (${count + 1})`;
		updates["name"] = newName;
		this.updateSource(updates);
		
	}

	/**
	 * Determine default artwork based on the provided item data.
	 * @param {ItemData} itemData  The source item data.
	 * @returns {{img: string}}    Candidate item image.
	 */
	/** @inheritdoc */
	static getDefaultArtwork(itemData) {
		return {img: CONFIG.DND4E.defaultArtwork.Item[itemData.type]} ?? super.getDefaultArtwork(itemData);
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned equipment type Items.
	 *
	 * @param {object} data       Data for the newly created item.
	 * @param {boolean} isNPC     Is this actor an NPC?
	 * @returns {object}          Updates to apply to the item data.
	 * @private
	 */
	_onCreateOwnedEquipment(data, isNPC) {
		if ( isNPC ) {
			const updates = {};
			if ( !foundry.utils.hasProperty(data, "system.equipped") ) updates["system.equipped"] = true;
			if ( !foundry.utils.hasProperty(data, "system.proficient") ) updates["system.proficient"] = true;
			return updates;
		}

		const updates = {};
		const actorProfs = this.parent.system.details.armourProf;
		updates["system.proficient"] = false;

		if(data.system.armour?.type === "armour" ){
			if(actorProfs.value.has(data.system.armourBaseType)){
				updates["system.proficient"] = actorProfs.value.has(data.system.armourBaseType);
			}
			else if(data.system.armourBaseType === "custom"){
				updates["system.proficient"] = actorProfs.custom.split(";").includes(data.system.armourBaseTypeCustom);
			}
			else if(data.system.armourBaseType === "cloth"){
				updates["system.proficient"] = true; //everyone is proficient with cloth.
			}
		}

		if(data.system.armour?.type === "arms" && CONFIG.DND4E.shield[data.system.armour.subType]){
			if(actorProfs.value.has(data.system.shieldBaseType)){
				updates["system.proficient"] = actorProfs.value.has(data.system.shieldBaseType);
			}
			else if(data.system.shieldBaseType === "custom"){
				updates["system.proficient"] = actorProfs.custom.split(";").includes(data.system.shieldBaseTypeCustom);
			}
		}

		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned weapon type Items.
	 * @param {object} data       Data for the newly created item.
	 * @param {boolean} isNPC     Is this actor an NPC?
	 * @returns {object}          Updates to apply to the item data.
	 * @private
	 */

	_onCreateOwnedWeapon(data, isNPC) {
		if ( isNPC ) {
			const updates = {};
			if ( !foundry.utils.hasProperty(data, "system.equipped") ) updates["system.equipped"] = true;
			if ( !foundry.utils.hasProperty(data, "system.proficient") ) updates["system.proficient"] = true;
			return updates;
		}
		if(data.system?.proficient === undefined ) return {};

		const updates = {};
		const actorProfs = this.parent.system.details.weaponProf;
		updates["system.proficient"] = false;

		if(actorProfs.value.has(data.system.weaponType)){
			updates["system.proficient"] = actorProfs.value.has(data.system.weaponType);
		}
		else if(data.system.weaponBaseType === "custom"){
			updates["system.proficient"] = actorProfs.custom.split(";").includes(data.system.weaponBaseTypeCustom);
		} else {
			updates["system.proficient"] = actorProfs.value.has(data.system.weaponBaseType);
		}
		return updates;
	}

	/* -------------------------------------------- */
	/*  Item Properties                             */
	/* -------------------------------------------- */

	/**
	 * Determine which ability score modifier is used by this item
	 * @type {string|null}
	 */
	get abilityMod() {
		const itemData = this.system;
		if (!("ability" in itemData)) return null;

		// Case 1 - defined directly by the item
		if (itemData.ability) return itemData.ability;

		// Case 2 - inferred from a parent actor
		else if (this.actor) {
			const actorData = this.actor.system;

			// Weapons
			if (this.type === "weapon") {
				const wt = itemData.weaponType;

				// Melee weapons - Str or Dex if Finesse (PHB pg. 147)
				if ( ["simpleM", "martialM"].includes(wt) ) {
					if (itemData.properties.fin === true) {   // Finesse weapons
						return (actorData.abilities["dex"].mod >= actorData.abilities["str"].mod) ? "dex" : "str";
					}
					return "str";
				}

				// Ranged weapons - Dex (PH p.194)
				else if ( ["simpleR", "martialR"].includes(wt) ) return "dex";
			}
			
			// Spells - Use Actor spellcasting modifier
			// else if (this.type === "spell") return actorData.attributes.spellcasting || "int";

			// Tools - default to Intelligence
			// else if (this.type === "tool") return "int";

			return "str";
		}

		// Case 3 - unknown
		return null
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement an attack roll as part of its usage
	 * @type {boolean}
	 */
	get hasAttack() {
		return this.system.attack?.isAttack;
		// return ["mwak", "rwak", "msak", "rsak"].includes(this.system.actionType);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a damage roll as part of its usage
	 * @type {boolean}
	 */
	get hasDamage() {
		if(!this.type === "power") return false; //curently only powers will deal damage or make attacks
		return this.system.hit?.isDamage;
		return !!this.system.hit?.formula || !!(this.system.damage && this.system.damage.parts.length);
	}

	/* -------------------------------------------- */
	/**
	 * Does the Item implement a heal roll as part of its usage
	 * @type {boolean}
	 */
	 get hasHealing() {
		if(this.type === "power" || this.type === "consumable"){
			return this.system.hit?.isHealing;
		}
		return false; //curently only powers will deal damage or make attacks
		
	 }	
	/* -------------------------------------------- */

	/**
	 * Does the Item have an effect line as part of its usage
	 * @type {boolean}
	 */
	get hasEffect() {
		if(!this.type === "power") return false; //curently only powers have effects
		return !!this.system.effect?.detail;
	}
	
	/* -------------------------------------------- */

	/**
	 * Does the Item implement a versatile damage roll as part of its usage
	 * @type {boolean}
	 */
	get isVersatile() {
		return false;
		return !!(this.hasDamage && this.system.damage.versatile);
	}

	/* -------------------------------------------- */

	/**
	 * Does the item provide an amount of healing instead of conventional damage?
	 * @return {boolean}
	 */
	get isHealing() {
		return (this.system.actionType === "heal") && this.system.damage.parts.length;
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a saving throw as part of its usage
	 * @type {boolean}
	 */
	get hasSave() {
		return !!(this.system.save && this.system.save.ability);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have a target
	 * @type {boolean}
	 */
	get hasTarget() {
		return target && !["none",""].includes(this.system.target);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have an area of effect target
	 * @type {boolean}
	 */
	get hasAreaTarget() {
		return ["closeBurst", "closeBlast", "rangeBurst", "rangeBlast", "wall"].includes(this.system.rangeType);
	}

  /* -------------------------------------------- */

	/**
	 * Should this item's active effects be suppressed.
	 * @type {boolean}
	 */
	get areEffectsSuppressed() {
		if(this.type === "power") return true;
		return false;
		const requireEquipped = (this.type !== "consumable") || ["trinket"].includes(
			this.system.consumableType);
		if ( requireEquipped && (this.system.equipped === false) ) return true;

		return this.system.attunement === CONFIG.DND4E.attunementTypes.REQUIRED;
	}	

	/* -------------------------------------------- */

	/**
	 * A flag for whether this Item is limited in it's ability to be used by charges or by recharge.
	 * @type {boolean}
	 */
	get hasLimitedUses() {
		let chg = this.system.recharge || {};
		let uses = this.system.uses || {};
		return !!chg.value || (!!uses.per && (this.preparedMaxUses > 0));
	}
	
	/* --------------------------------------------- */
	/**
	 * Returns an object with official and custom keywords
	 * @type {string}
	 */
	get keywords(){
		//Not all items can have keywords		
		try{
			if(!this.system.hasOwnProperty('damageType') && !this.system.hasOwnProperty('effectType') && !this.system?.keywordsCustom ) return {'system':{},'custom':{},'string':''};
			
			const keysRef = {...CONFIG.DND4E.damageTypes,...CONFIG.DND4E.effectTypes,...CONFIG.DND4E.powerSource};
			//This will need a revisit when we make keywords customisable, as duplicate property names can cause false negatives. For now, it's just bloody poison causing trouble again.
			const autoKeys = {...this.system?.damageType,...this.system?.effectType};
			if (this.system?.effectType?.poison || this.system?.damageType?.poison) autoKeys.poison = true;
			
			const systemKeywords = Object.keys(keysRef).filter(k => autoKeys[k]) || [];
			if(this.system?.powersource) systemKeywords.push(this.system.powersource);
			if(this.system?.secondPowersource) systemKeywords.push(this.system.secondPowersource);
			const customString = this.system.keywordsCustom || '';
			const customKeywords = customString? customString.split(';') : [];
			
			let keywordLabels = [];
			if(systemKeywords) systemKeywords.forEach((e) => keywordLabels.push(keysRef[e]));
			keywordLabels = [...keywordLabels, ...customKeywords];
			let keywordString = keywordLabels.join(', ');
			
			return {'system': systemKeywords,'custom': customKeywords,'string': keywordString};
		}catch(e){
			console.error('System or item error: Failed to gather keywords correctly.');return {'system':{},'custom':{},'string':''};		
		}
	}

	/* -------------------------------------------- */
	/*	Data Preparation							*/
	/* -------------------------------------------- */

	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	/** @inheritdoc */
	prepareData() {
		super.prepareData();
		// Get the Item's data
		const itemData = this;
		const system = itemData.system;
		const C = CONFIG.DND4E;
		const labels = {};
		// Feature Items
		if ( itemData.type === "feature" ) {
			try{
				if( system?.auraSize != "" && system?.auraSize >= 0 ){
					labels.auraSize = `${game.i18n.localize('DND4E.Aura')} ${system.auraSize}`;
				}
				if(system.featureType === 'feat'){
					let tierName;
					if(system.level > 20) {
						tierName = game.i18n.localize('DND4E.Tier.Epic');
					} else if(system.level > 10) {
						tierName = game.i18n.localize('DND4E.Tier.Paragon');
					} else {
						tierName = game.i18n.localize('DND4E.Tier.Heroic');
					}
					labels.tier = game.i18n.format('DND4E.Tier.TierName', {tier: tierName});
				}
				if(system?.featureSource){
					labels.featureSource = `${system.featureSource} ${game.i18n.localize('DND4E.Feature.Feature')}`;
				}
				if(system?.featureGroup){
					labels.featureSet = `${system.featureGroup}`;
				};
				if(system?.requirements){
					labels.PreReqs = `<strong>${game.i18n.localize('DND4E.Prerequisite')}:</strong> ${system.requirements}`;
				}			
			}catch(e){
				console.error(`Item labels failed for feature: ${itemData.name}. Item data has been dumped to debug. ${e}`);
				console.debug(itemData);
			}
		}
		
		// Equipment Items
		else if ( itemData.type === "equipment" ) {
			try{
			
				if (system?.armour?.enhance){
					let enhString = `${game.i18n.localize("DND4E.Enhancement")} +${system.armour.enhance}`;
					//The strings below begin with a non-breaking space character. Don't delete it unless you want to break the text wrapping!
					if(system.armour.type === "armour"){
						enhString += ` ${game.i18n.localize("DND4E.DefAC")}`;
					} else {
						enhString += ` ${game.i18n.localize("DND4E.DefFort")}/${game.i18n.localize("DND4E.DefRef")}/${game.i18n.localize("DND4E.DefWil")}`;
					}
					labels.enh = enhString;
				}
				
				if(system.armour.type == 'armour'){
					labels.armour = system.armour.ac ? `${system.armour.ac} ${game.i18n.localize("DND4E.AC")}` : "";
					labels.fort = system.armour.fort ? `${system.armour.fort} ${game.i18n.localize("DND4E.FORT")}` : "";
					labels.ref = system.armour.ref ? `${system.armour.ref} ${game.i18n.localize("DND4E.REF")}` : "";
					labels.wil = system.armour.wil ? `${system.armour.wil} ${game.i18n.localize("DND4E.WIL")}` : "";
					labels.move = system.armour.movePen ? `${game.i18n.localize('DND4E.Speed')} ${system.armour.movePenValue}` : "";
					labels.check = system.armour.skillCheck ? `${game.i18n.localize('DND4E.SkillACPAbbr')} ${system.armour.skillCheckValue}` : "";
					labels.type = system.armour.subType != "" ? CONFIG.DND4E.equipmentTypesArmour[system.armour.subType].label : "";
				}else{
					labels.type = ["","other"].includes(system.armour.type) ? game.i18n.localize('DND4E.EquipmentWondrousItem') :CONFIG.DND4E.equipmentTypes[system.armour.type].label ;
				}
				
			}catch(e){
				console.error(`Item labels failed for equipment: ${itemData.name}. Item data has been dumped to debug. ${e}`);
				console.debug(itemData);
			}
		}
		
		// Weapons
		else if ( itemData.type === "weapon" ) {
			try{
				for (const [key, value] of Object.entries(system?.properties)){
					if(value && !(key == 'imp' && system.weaponType == 'implement')){
						const newKey = `props${key}`;
						labels[newKey] = game.i18n.localize(CONFIG.DND4E.weaponProperties[key]);
					}
				}
				for (const [key, value] of Object.entries(system?.weaponGroup)){
					if(value){
						const newKey = `types${key}`;
						labels[newKey] = game.i18n.localize(CONFIG.DND4E.weaponGroup[key]);
					}
				}
				if(system.implement != undefined){	
					for (const [key, value] of Object.entries(system?.implement)){
						if(value){
							const newKey = `types${key}`;
							labels[newKey] = game.i18n.localize(CONFIG.DND4E.implement[key]);
						}
					}
				}
			}catch(e){
				console.error(`Item labels failed for weapon: ${itemData.name}. Item data has been dumped to debug. ${e}`);
				console.debug(itemData);
			}
		}

		// Powers
		else if ( itemData.type === "power" ) {
			try{				
				//Summary Line
				let summaryText = '';
				
				if(system?.powersourceName && !['feat','item','inherent'].includes(system?.powerType)){
					summaryText += system.powersourceName;
				}else if(system?.powerType && system?.powerType != 'inherent'){
					summaryText += game.i18n.localize(C.powerType[system.powerType]);
				}
				
				if(system?.powerSubtype && system.powerSubtype != 'other'){
					summaryText += ` ${game.i18n.localize(C.powerSubtype[system.powerSubtype])}`;
				}else if(['other'].includes(system?.powerSubtype)){
					summaryText += ` ${game.i18n.localize('DND4E.Power')}`;
				}
				
				if(system?.level){
					summaryText += ` ${system.level}`;
				}else if(['race','class'].includes(system?.powerType) && system.powerSubtype != 'feature'){
					summaryText += ` ${game.i18n.localize('DND4E.Feature.Feature')}`;
				}else if(['feature','other'].includes(system?.powerType)){
					summaryText += ` ${game.i18n.localize('DND4E.Power')}`;
				}
				
				if(summaryText != '') labels.summary = summaryText;
				
				//Usage
				if(system.useType) labels.usage = game.i18n.localize(C.powerUseType[system.useType]);
				
				//Source
				if(system?.powersource) labels.source = game.i18n.localize(C.powerSource[system.powersource]);
				if(system?.secondPowersource) labels.source2 = game.i18n.localize(C.powerSource[system.secondPowersource]);
								
				//Tool Used (Weapon/Implement)
				if (system?.weaponType === 'implement'){
					labels.toolType = game.i18n.localize('DND4E.WeaponPropertiesImp');
				}else if (['melee','ranged','meleeRanged'].includes(system?.weaponType)){
					labels.toolType = game.i18n.localize('DND4E.Weapon');
				}else if (system?.weaponType === 'any'){
					const weaponUse = (itemData.actor ? Helper.getWeaponUse(system, itemData.actor) : null);
					if (weaponUse != null){
						if (weaponUse.system?.weaponType === 'implement'){
							labels.toolType = game.i18n.localize('DND4E.WeaponPropertiesImp');
						}else{
							labels.toolType = game.i18n.localize('DND4E.Weapon');
						}
					}else if (system?.rangeType === 'weapon'){
						labels.toolType = game.i18n.localize('DND4E.Weapon');
					}
				}				
			}catch(e){
				console.error(`Item labels failed for power: ${itemData.name}. Item data has been dumped to debug. ${e}`);
				console.debug(itemData);
			}
		}
		
		// Rituals
		if ( itemData.type === "ritual" ) {
			if ( system?.category ) {
				try {
					labels.category = `<strong>${game.i18n.localize('DND4E.Category')}:</strong> ${CONFIG.DND4E.ritualTypes[system.category].label}`;
				} catch(e) {
					console.error(`Failed to get the category name for this ritual, probably due to an un-migrated item. Manually setting the category should fix this.`);
				}
			}
		}

		// fix old healing consumables to migrate them to the new structure
		else if (itemData.type === "consumable") {
			// does it have an old damage expression
			if (system.damage.parts?.length > 0) {
				if (system.damage.parts.map(d => d[1]).includes("healing") && !system.hit?.healFormula) {
					system.hit.healFormula = system.damage.parts[0][0]
					system.hit.isHealing = true
					system.damage.parts = []
					system.oldConsumableNeedsUpdate = true
					// don't unassign parts here because it will get permanently solved by the update statement
				}
				// non healing damage expressions didn't work anyway
			}
		}	
		
		// Activated Items other than powers/features
		if (!['power','feature'].includes(itemData.type) && system.hasOwnProperty("activation") ) {
			// Ability Activation Label
			let act = system.activation || {};
			if ( act ) labels.activation = [act.cost, C.abilityActivationTypes[act.type]].filterJoin(" ");

			// Target Label
			let tgt = system.target || {};
			if (["none", "touch", "self"].includes(tgt.units)) tgt.value = null;
			if (["none", "self"].includes(tgt.type)) {
				tgt.value = null;
				tgt.units = null;
			}
			labels.target = [tgt.value, C.distanceUnits[tgt.units], C.targetTypes[tgt.type]].filterJoin(" ");

			// Range Label
			let rng = system.range || {};
			if (["none", "touch", "self"].includes(rng.units) || (rng.value === 0)) {
				rng.value = null;
				rng.long = null;
			}
			labels.range = [rng.value, rng.long ? `/ ${rng.long}` : null, C.distanceUnits[rng.units]].filterJoin(" ");

			// Duration Label
			let dur = system.duration || {};
			if (["inst", "perm"].includes(dur.units)) dur.value = null;

			labels.duration = dur.value? `<strong>${game.i18n.localize("DND4E.Duration")}:</strong> ${[dur.value, C.timePeriods[dur.units]].filterJoin(" ")}` : null;

			// CastTime Label
			if (system.castTime){
				let castTime = system.castTime || {};
				if (["inst", "perm"].includes(castTime.units)) castTime.value = null;
				labels.castTime = `<strong>${game.i18n.localize("DND4E.CastTime")}:</strong> ${[castTime.value, C.timePeriods[castTime.units]].filterJoin(" ")}`;
			}

			// Attribute Label
			if(system.attribute){
				const attribute = system.attribute.split('.')[1];
				if(DND4E.abilities[attribute]){
					labels.attribute = `<strong>${game.i18n.localize("DND4E.Ability")}:</strong> ${game.i18n.localize(DND4E.abilities[attribute])}`;
				}
				else if(DND4E.skills[attribute]){
					labels.attribute = `<strong>${game.i18n.localize("DND4E.Skill")}:</strong> ${DND4E.skills[attribute]?.label}`;
				}
			}

			//Component type + cost Label
			if(itemData.type === "ritual"){
				if(system.consume?.amount && system.consume?.type){
					let resourceLabel;
					if(['ritualcomp','currency'].includes(system.consume.type)){
						const resourceTarget = system.consume.target.split('.')[2];
						if(system.consume?.type === "ritualcomp" ){
							resourceLabel = DND4E.ritualComponents[resourceTarget];
						}else if(system.consume?.type === "currency" ){
							resourceLabel = DND4E.currencies[resourceTarget];
						}
					}
					else if(system.consume?.type === "attribute" ){
						const resourceTarget = system.consume.target.split('.')[1];

						if(DND4E.ritualComponents[resourceTarget]){
							resourceLabel = DND4E.ritualComponents[resourceTarget];
						}
						else if(DND4E.currencyConversion[resourceTarget]){
							resourceLabel = DND4E.currencies[resourceTarget];
						}
						else if(resourceTarget === "hp"){
							resourceLabel = game.i18n.localize("DND4E.HP");
						}
						else if(resourceTarget === "surges"){
							resourceLabel = game.i18n.localize("DND4E.HealingSurges");
						}
					}
					if(resourceLabel){
						labels.component = `<strong>${game.i18n.localize("DND4E.Component")}:</strong> ${resourceLabel} (${system.consume.amount})`;
					}
				}
			}

			// Recharge Label
			if(system.recharge?.value){
				let chg = system.recharge || {};
				labels.recharge = `${game.i18n.localize("DND4E.Recharge")} [${chg.value}${parseInt(chg.value) < 6 ? "+" : ""}]`;
			}
		}

		// Damage & Effect Type Keywords
		try{
			// DamageTypes
			if(system.hasOwnProperty("damageType")){
				if(this.getDamageType()){
					let damType = [];
					for ( let [damage, d] of Object.entries(this.getDamageType())) {
						if(d && damage !== 'physical'){
							damType.push(`${game.i18n.localize(DND4E.damageTypes[damage])}`);
						}
					}
					if (damType.length) labels.damageTypes = damType.join(", ");
				}
			}
			//Effect Types
			if(system.hasOwnProperty("effectType")){
				for (const [key, value] of Object.entries(system.effectType)) {
					if(value){
						const labelKey = `kw${key}`;
						labels[labelKey] = `${game.i18n.localize(C.effectTypes[key])}`;
					}
				}
			}
			//Custom Keywords
			if(system?.keywordsCustom){
				const customKeys = system.keywordsCustom.split(';');
				customKeys.forEach((item) => {
					const labelKey = `kw${item}`;
					labels[labelKey] = item;
				});
			}
		}catch(e){
			console.error(`Item labels failed for ${itemData.type}: ${itemData.name}. Item data has been dumped to debug. ${e}`);
			console.debug(itemData);
		}
		
		// Range, action
		try{
			//Action
			if(system?.actionType){
				labels.action = C.abilityActivationTypes[system.actionType].label;
			}
			
			//Range
			if(['power','consumable'].includes(itemData.type) && system?.rangeType){
				let rangeString = '';
				if (system?.rangeType === 'weapon'){
					const weaponUse = (itemData.actor ? Helper.getWeaponUse(system, itemData.actor) : null);
					if (weaponUse != null){
						if(weaponUse.isRanged){
							rangeString = `${game.i18n.localize('DND4E.Ranged')} ${weaponUse.system.range.value}/${weaponUse.system.range.value}`;
						}else{
							rangeString = game.i18n.localize('DND4E.Melee');
							if(weaponUse.system.properties.rch){
								rangeString += ' 2';
							}else{
								rangeString += ' 1';
							}							
						}
					}else{
						if (system?.weaponType === 'melee'){
							rangeString = game.i18n.localize('DND4E.WeaponMelee');
						}else if (system?.weaponType === 'ranged'){
							rangeString = game.i18n.localize('DND4E.WeaponRanged');
						}else{
							rangeString = C.rangeType.weapon.label;
						}
					}
				}else{
					const isRange = !["personal","closeBurst","closeBlast","","touch"].includes(itemData.system.rangeType);
					const isArea = ["closeBurst","closeBlast","rangeBurst","rangeBlast","wall"].includes(itemData.system.rangeType);
					
					rangeString += C.rangeType[system.rangeType].label;
					
					if (isArea){
						let areaString = system.area || '';
						if(this.actor && areaString){
							try{
								areaString = Helper.commonReplace(areaString, this.actor);
								if (!Helper._isNumber(areaString)) areaString = Roll.safeEval(areaString);
							}catch(e){
								console.error(`Could not evaluate area formula. This is probably due to an unknown key in the formula.`);
							}
						}
						rangeString += ` ${areaString}`;
					}
					
					if (isArea && isRange) rangeString += ` ${game.i18n.localize('DND4E.RangeWithin')}`;
					
					if (isRange){
						let rangeValue = system.rangePower || '';
						if(this.actor && rangeValue){
							try{
								rangeValue = Helper.commonReplace(rangeValue, this.actor);
								if (!Helper._isNumber(rangeValue)) rangeValue = Roll.safeEval(rangeValue);
							}catch(e){
								console.error(`Could not evaluate range formula. This is probably due to an unknown key in the formula.`);
							}
						}
						rangeString += ` ${rangeValue}`;
					}
					
					if (isRange && system.range?.long && !isArea){
						let longRangeValue = system.range.long;
						if(this.actor){
							try{
								longRangeValue = Helper.commonReplace(longRangeValue, this.actor);
								if (!Helper._isNumber(longRangeValue)) longRangeValue = Roll.safeEval(longRangeValue);
							}catch(e){
								console.error(`Could not evaluate long range formula. This is probably due to an unknown key in the formula.`);
							}
						}
						rangeString += `/${longRangeValue}`;
					}
				}
				if (rangeString != '') labels.range = rangeString;
			}
		}catch(e){
			console.error(`Item labels failed for ${itemData.type}: ${itemData.name}. Item data has been dumped to debug. ${e}`);
			console.debug(itemData);
		}

		// Assign labels
		this.labels = labels;
		//console.debug(this.labels);

		if(this.isOwned){
			system.preparedMaxUses = this.preparedMaxUses;
		}

		itemData.system.isOnCooldown = this.isOnCooldown();
		
	}

	// /** @inheritdoc */
	// prepareDerivedData() {

	// }

	/* -------------------------------------------- */

	getDamageType(){
		if(this.type == "power" && this.actor){
			const weapon = Helper.getWeaponUse(this.system, this.actor);
			if(weapon && weapon.system.damageTypeOverride){
				this.system.damageTypeOverride = true;
				this.system.weaponDamageType = weapon.system.damageType;
				this.system.weaponSourceName = weapon.name;
				return weapon.system.damageType;
			} else {
				this.system.damageTypeOverride = false;
			}
		}
		return this.system.damageType;
	}

/* -------------------------------------------- */
  /**
   * Compute capacity information for this container.
   * @returns {Promise<Item4eCapacityDescriptor>}
   */
	async _computeEncumbrance(){

		const { value, type } = this.system.capacity;
		const context = { max: value ?? Infinity };
		if ( type === "weight" ) {
			context.value = (await this.contentsWeight).toNearest(0.01);
			context.units = game.i18n.localize("DND4E.AbbreviationLbs");
		} else {
			context.value = (await this.contentsCount).toNearest(0.01);
			context.units = game.i18n.localize("DND4E.ItemContainerCapacityItems");
		}
		// context.pct = Math.clamp(context.max ? (context.value / context.max) * 100 : 0, 0, 100);

		//set ppc Percentage Base Carry-Capasity
		context.pbc = Math.clamp(context.value / context.max * 100, 0, 99.7);
		//set ppc Percentage Encumbranced Capasity
		context.pec = Math.clamp(context.value / (context.max) * 100 - 100, 1, 99.7);

		context.encumbered = context.value > context.max;

		return context;

	}

	/* -------------------------------------------- */

	/**
	 * Roll the item to Chat, creating a chat card which contains follow up attack or damage roll options
	 * @param {boolean} [configureDialog]     Display a configuration dialog for the item roll, if applicable?
	 * @param {string} [rollMode]             The roll display mode with which to display (or not) the card
	 * @param {boolean} [createMessage]       Whether to automatically create a chat message (if true) or simply return
	 *                                        the prepared chat message data (if false).
	 * @return {Promise}
	 */
	async roll({configureDialog=true, rollMode=null, createMessage=true, variance={}}={}) {
		//console.debug(variance);

		if(["both", "pre", "sub"].includes(this.system.macro?.launchOrder)) {
			await Helper.executeMacro(this);
			if (this.system.macro.launchOrder === "sub") return;
		}
		const cardData = await ( async () => {
			if ((this.type === "power" || this.type === "consumable") && this.system.autoGenChatPowerCard) {
				let weaponUse = Helper.getWeaponUse(this.system, this.actor);
				let attackBonus = null;
				if(this.hasAttack){
					attackBonus = await this.getAttackBonus({'variance':variance});
				}
				let cardString = Helper._preparePowerCardData(await this.getChatData({},variance), CONFIG, this.actor, attackBonus);
				return Helper.commonReplace(cardString, this.actor, this, weaponUse? weaponUse.system : null, 1);
			} else {
				return null;
			}
		})();


		// Basic template rendering data
		const token = this.actor.token;
		const templateData = {
			actor: this.actor,
			tokenId: token ? token.uuid : null,
			effects: this.effects.size ? this.effects : false,
			item: this,
			system: await this.getChatData({},variance),
			labels: this.labels,
			hasAttack: this.hasAttack,
			isHealing: this.isHealing,
			isPower: this.type === "power",
			hasDamage: this.hasDamage,
			hasHealing: this.hasHealing,
			hasEffect: this.hasEffect,
			cardData: cardData,
			isVersatile: this.isVersatile,
			hasSave: this.hasSave,
			hasAreaTarget: this.hasAreaTarget,
			isRoll: true
		};

		// Set up html div for effect Tool Tips
		if(this.effects.size){
			for(const e of this.effects){
				if (e.description){
					e.descriptionToolTip = `<div class="effect-tooltip" >${e.description}</div>`;
				}
			}
		}

		/*// For feature items, optionally show an ability usage dialog
		// @FoxLee Looks like obsolete 5e stuff, but could it be repurposed for modal powers?
		if (this.type === "feat") {
			let configured = await this._rollFeature(configureDialog);
			if ( configured === false ) return;
		}
		else*/ if ( this.type === "consumable" ) {
			let configured = await this._rollConsumable(configureDialog);
			if ( configured === false ) return;
		}
		
		// For items which consume a resource, handle that here
		const allowed = await this._handleResourceConsumption({isCard: true, isAttack: false},this.system);
		if ( allowed === false ) return;

		// Render the chat card template
		let templateType = "item"
		if (["tool", "ritual"].includes(this.type)) {
			templateType =  this.type
			templateData.abilityCheck = Helper.byString(this.system.attribute.replace(".mod",".label").replace(".total",".label"), this.actor.system);
		}
		const template = `systems/dnd4e/templates/chat/${templateType}-card.html`;
		let html = await foundry.applications.handlebars.renderTemplate(template, templateData);
		
		if(["power", "consumable"].includes(templateData.item.type)) {
			html = html.replace("ability-usage--", `ability-usage--${templateData.system.useType}`);
			if(game.settings.get("dnd4e", "autoApplyEffects")){
				if(typeof this.parent === 'string'){
					const attacker = await fromUuid(this.parent);
					Helper.applyEffectsToTokens(this.effects, [attacker.token], "self", attacker);
					Helper.applyEffectsToTargets(this.effects, attacker);
				}else{
					Helper.applyEffectsToTokens(this.effects, [this.parent.token], "self", this.parent);
					Helper.applyEffectsToTargets(this.effects, this.parent);
				}
			}
		}
		else if (["weapon", "equipment", "backpack", "tool", "loot"].includes(templateData.item.type)) {
			html = html.replace("ability-usage--", `ability-usage--item`);
		} else {
			html = html.replace("ability-usage--", `ability-usage--other`);
		}

		// Basic chat message data
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_STYLES.OTHER,
			content: html,
			speaker: {
				actor: this.actor.id,
				token: this.actor.token,
				alias: this.actor.name
			},
			flags: {
			  core: { canPopout: true }
			}
		};
	
		// In case the Item was destroyed or tweaked in the process of rolling - embed the item data in the chat message
		chatData.flags["dnd4e.itemData"] = templateData.item;
		
		// Embed variance in the chat message, so buttons can be aware of it
		if (variance) {
			chatData.flags["dnd4e.variance"] = variance;
		}

		// Toggle default roll mode
		rollMode = rollMode || game.settings.get("core", "rollMode");
		if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
		if ( rollMode === "blindroll" ) chatData["blind"] = true;

		// Create the chat message
		if ( createMessage ) {

			if(this.type === "power") {
				Hooks.callAll("dnd4e.usePower", this, ChatMessage.getSpeaker({ actor: this.actor }));
			}

			ChatMessage.create(chatData);

			if(["both", "post"].includes(this.system.macro?.launchOrder)) {
				await Helper.executeMacro(this)
			}
		}
		else return chatData;
	}

	/**
	 * Post the item to chat without triggering macros, effect transfer, resource consumption etc., 
	 * @return {Promise}
	 */
	async toChat(){

		const cardData = await ( async () => {
			if ((this.type === "power" || this.type === "consumable") && this.system.autoGenChatPowerCard) {
				let weaponUse = Helper.getWeaponUse(this.system, this.actor);
				let cardString = Helper._preparePowerCardData(await this.getChatData(), CONFIG, this.actor);
				return Helper.commonReplace(cardString, this.actor, this, weaponUse? weaponUse.system : null, 1);
			} else {
				return null;
			}
		})();

		// Basic template rendering data
		const token = this.actor.token;
		const templateData = {
			actor: this.actor,
			tokenId: token ? token.uuid : null,
			item: this,
			system: await this.getChatData(),
			labels: this.labels,
			hasAttack: this.hasAttack,
			isHealing: this.isHealing,
			isPower: this.type === "power",
			hasDamage: this.hasDamage,
			hasHealing: this.hasHealing,
			hasEffect: this.hasEffect,
			cardData: cardData,
			isVersatile: this.isVersatile,
			hasSave: this.hasSave,
			hasAreaTarget: this.hasAreaTarget,
			isRoll: false
		};

		// Render the chat card template
		let templateType = "item"
		if (["tool", "ritual"].includes(this.type)) {
			templateType = this.type
			templateData.abilityCheck  = Helper.byString(this.system.attribute.replace(".mod",".label").replace(".total",".label"), this.actor.system);
		}
		const template = `systems/dnd4e/templates/chat/${templateType}-card.html`;
		let html = await foundry.applications.handlebars.renderTemplate(template, templateData);
		
		if(["power", "consumable"].includes(templateData.item.type)) {
			html = html.replace("ability-usage--", `ability-usage--${templateData.system.useType}`);
		}
		else if (["weapon", "equipment", "backpack", "tool", "loot"].includes(templateData.item.type)) {
			html = html.replace("ability-usage--", `ability-usage--item`);
		} else {
			html = html.replace("ability-usage--", `ability-usage--other`);
		}

		// Basic chat message data
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_STYLES.OTHER,
			content: html,
			speaker: {
				actor: this.actor.id,
				token: this.actor.token,
				alias: this.actor.name
			},
			flags: {
			  core: { canPopout: true }
			}
		};

		// Create the chat message
		ChatMessage.create(chatData);
	}

	/* -------------------------------------------- */

	/**
	 * For items which consume a resource, handle the consumption of that resource when the item is used.
	 * There are four types of ability consumptions which are handled:
	 * 1. Ammunition (on attack rolls)
	 * 2. Attributes (on card usage)
	 * 3. Materials (on card usage)
	 * 4. Item Charges (on card usage)
	 *
	 * @param {boolean} isCard      Is the item card being played?
	 * @param {boolean} isAttack    Is an attack roll being made?
	 * @return {Promise<boolean>}   Can the item card or attack roll be allowed to proceed?
	 * @private
	 */
	async _handleResourceConsumption({isCard=false, isAttack=false}={}, itemData) {
		// const itemData = this.system;
	
		const consume = itemData.consume || {};
		//console.debug(consume);
		if ( !consume.type ) return true;
		const actor = this.actor;
		const typeLabel = CONFIG.DND4E.abilityConsumptionTypes[consume.type].label;
		const amount =  parseInt(consume.amount) || parseInt(consume.amount) === 0 ? parseInt(consume.amount) : 1;

		// Only handle certain types for certain actions
		if ( ((consume.type === "ammo") && !isAttack ) || ((consume.type !== "ammo") && !isCard) ) return true;

		// No consumed target set
		if ( !consume.target ) {
			ui.notifications.warn(game.i18n.format("DND4E.ConsumeWarningNoResource", {name: this.name, type: typeLabel}));
			return false;
		}

		// Identify the consumed resource and its quantity
		let consumed = null;
		let quantity = 0;
		switch ( consume.type ) {
			case "resource":
			case "attribute":
			case "currency":
			case "ritualcomp":
				consumed = foundry.utils.getProperty(actor, consume.target);
				quantity = consumed || 0;
				break;
			case "ammo":
			case "material":
				consumed = actor.items.get(consume.target);
				quantity = consumed ? consumed.system.quantity : 0;
				break;
			case "charges":
				consumed = actor.items.get(consume.target);
				quantity = consumed ? consumed.system.uses.value : 0;
				break;
		}

		// Verify that the consumed resource is available
		if ( [null, undefined].includes(consumed) ) {
			ui.notifications.warn(game.i18n.format("DND4E.ConsumeWarningNoSource", {name: this.name, type: typeLabel}));
			return false;
		}
		let remaining = quantity - amount;
		if ( remaining < 0) {
			ui.notifications.warn(game.i18n.format("DND4E.ConsumeWarningNoQuantity", {name: this.name, type: typeLabel}));
			return false;
		}

		// Update the consumed resource
		switch ( consume.type ) {
			case "attribute":
			case "resource":
			case "currency":
			case "ritualcomp":
				await this.actor.update({[consume.target]: `${remaining}`});
				break;
			case "ammo":
			case "material":
				await consumed.update({"system.quantity": remaining});
				break;
			case "charges":
				await consumed.update({"system.uses.value": remaining});
		}
		return true;
	}

	/* -------------------------------------------- */

	/**
	 * Additional rolling steps when rolling a feat-type item
	 * @private
	 * @return {boolean} whether the roll should be prevented
	 */
	async _rollFeature(configureDialog) {
		if ( this.type !== "feature" ) throw new Error("Wrong Item type");

		// Configure whether to consume a limited use or to place a template
		const charge = this.system.recharge;
		const uses = this.system.uses;
				
		let usesCharges = !!uses.per && (this.preparedMaxUses > 0);
		let placeTemplate = false;
		let consume = charge.value || usesCharges;

		// Determine whether the feat uses charges
		configureDialog = configureDialog && (consume || this.hasAreaTarget);
		if ( configureDialog ) {
			const usage = await AbilityUseDialog.create(this);
			if ( usage === null ) return false;
			consume = Boolean(usage.get("consumeUse"));
			placeTemplate = Boolean(usage.get("placeTemplate"));
		}

		// Update Item data
		const current = foundry.utils.getProperty(this, "system.uses.value") || 0;
		if ( consume && charge.value ) {
			if ( !charge.charged ) {
				ui.notifications.warn(game.i18n.format("DND4E.ItemNoUses", {name: this.name}));
				return false;
			}
			else await this.update({"system.recharge.charged": false});
		}
		else if ( consume && usesCharges ) {
			if ( uses.value <= 0 ) {
				ui.notifications.warn(game.i18n.format("DND4E.ItemNoUses", {name: this.name}));
				return false;
			}
			await this.update({"system.uses.value": Math.max(current - 1, 0)});
		}

		// Maybe initiate template placement workflow
		if ( this.hasAreaTarget && placeTemplate ) {
			const template = MeasuredTemplate4e.fromItem(this);
			if ( template ) template.drawPreview(event);
			if ( this.owner && this.owner.sheet ) this.owner.sheet.minimize();
		}
		return true;
	}

	/* -------------------------------------------- */
	/*  Chat Cards									*/
	/* -------------------------------------------- */

	/**
	 * Prepare an object of chat data used to display a card for the Item in the chat log
	 * @param {Object} htmlOptions    Options used by the TextEditor.enrichHTML function
	 * @return {Object}               An object of chat data to render
	 */
	async getChatData(htmlOptions={},variance={}) {
		const data = foundry.utils.duplicate(this.system);
		const labels = this.labels;
			
		const description = data.description;
		const weaponUse = Helper.getWeaponUse(data, this.actor);
		const descriptionText = description.value ? Helper.commonReplace(description.value, this.actor, this.system, weaponUse?.system) : "";

		// Rich text description
		htmlOptions.async = true; //TextEditor.enrichHTML is becoming asynchronous. In the short term you may pass async=true or async=false as an option to nominate your preferred behavior.
		data.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(descriptionText || ``, htmlOptions);

		// Item type specific properties
		const props = [];
		const fn = this[`_${this.type}ChatData`];
		if ( fn ) fn.bind(this)(data, labels, props);
		
		// Proficiencies
		if (data.hasOwnProperty("proficient") && ["equipment","weapon"].includes(this.type)){
			if( this.type == 'weapon' || (data?.armour.type == 'armour' && ![""].includes(data?.armour.subType)) || (data?.armour.type == 'arms' && ["light","heavy"].includes(data?.armour.subType)) ){
				if(data?.proficient || (data?.weaponType == 'implement' && data?.proficientI) ){
					props.push(`<li class="proficiency">${game.i18n.localize('DND4E.Proficient')}</li>`);
				}				
				if(data?.weaponType != 'implement' && data?.proficientI){
					props.push(`<li class="proficiency">${game.i18n.localize("DND4E.ProficiencyI")}</li>`);
				}
				if(!data?.proficient && !(data?.weaponType == 'implement' && data?.proficientI) ){
					props.push(`<li class="proficiency negative">${game.i18n.localize("DND4E.NotProficient")}</li>`);
				}
			}
		}
		
		// Equippables
		if ( data.hasOwnProperty("equipped") && ["equipment","weapon","container"].includes(this.type) ) {
			if(data?.equipped){
				props.push(`<li class="equipped">${game.i18n.localize("DND4E.Equipped")}</li>`);
			}else{
				props.push(`<li class="equipped negative">${game.i18n.localize("DND4E.Unequipped")}</li>`);
			}
		}

		// Ability activation properties
		if ( data.hasOwnProperty("activation") ) {
			if(labels?.activation) props.push(`<li class="activation">${labels.activation} ${data.activation.condition}</li>`);
			if(labels?.attribute) props.push(`<li class="attribute">${labels.attribute}</li>`);
			if(labels?.target) props.push(`<li class="target">${labels.target}</li>`);
			if(data.isRanged && labels?.range) props.push(`<li class="range">${game.i18n.localize("DND4E.Range")}: ${labels.range}</li>`);
			if(labels?.castTime) props.push(`<li class="cast-time">${labels.castTime}</li>`);
			if(labels?.duration) props.push(`<li class="duration">${labels.duration}</li>`);
			if(labels?.component) props.push(`<li class="components">${labels.component}</li>`);
			if(labels?.componentCost) props.push(`<li class="component-cost">${labels.componentCost}</li>`);
			if(labels?.damageTypes) props.push(`<li class="keywords damage">${labels.damageTypes}</li>`);
			if(labels?.effectType) props.push(`<li class="keyword effect">${labels.effectType}</li>`);
		}
		
		// Filter properties and return
		data.properties = props.filter(p => !!p);
		
		//console.debug(variance);
		
		//Temporary states from special usage
		data.isCharge = variance?.isCharge || false;
		data.isOpp = variance?.isOpp || false;
		
		return data;
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for equipment type items
	 * @private
	 */
	_equipmentChatData(data, labels, props) {
		if(labels?.type) props.push(`<li class="equipment-type">${labels.type}</li>`);
		if(labels?.armour) props.push(`<li class="amour-bonus">${labels.armour}</li>`);
		if(labels?.fort) props.push(`<li class="fort-bonus">${labels.fort}</li>`);
		if(labels?.ref) props.push(`<li class="ref-bonus">${labels.ref}</li>`);
		if(labels?.wil) props.push(`<li class="will-bonus">${labels.wil}</li>`);
		if(labels?.move) props.push(`<li class="move-penalty">${labels.move}</li>`);
		if(labels?.check) props.push(`<li class="check-penalty">${labels.check}</li>`);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for weapon type items
	 * @private
	 */
	_weaponChatData(data, labels, props) {
		props.push(`<li class="weapon-type">${game.i18n.localize(CONFIG.DND4E.weaponTypes[data.weaponType])}</li>`);
		
		if(data.weaponHand == "hMain" || data.weaponHand == "hOff"){
			props.push(`<li class="hands">${game.i18n.localize('DND4E.1H')}</li>`);
		}else if(data.weaponHand == "hTwo"){
			props.push(`<li class="hands">${game.i18n.localize('DND4E.2H')}</li>`);
		}

		for (const [key, value] of Object.entries(labels)) {
			if(key.startsWith("prop") || key.startsWith("type")) props.push(`<li class="${key}">${value}</li>`);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for consumable type items
	 * @private
	 */
	_consumableChatData(data, labels, props) {
		if(data.preparedMaxUses != 0){
			props.push(
				`<li class="consumable-type">${CONFIG.DND4E.consumableTypes[data.consumableType].label}</li>`,
				`<li class="consumable-type">${data.uses.value}/${data.preparedMaxUses} ${game.i18n.localize("DND4E.Charges")}</li>`
			);
		}
		data.hasCharges = data.uses.value >= 0;
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for tool type items
	 * @private
	 */
	_toolChatData(data, labels, props) {
		props.push(
			`<li class="check">${CONFIG.DND4E.abilities[data.ability] || ''}${CONFIG.DND4E.skills[data.ability]?.label || ''}</li>`
			// CONFIG.DND4E.proficiencyLevels[data.proficient || 0]
		);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for tool type items
	 * @private
	 */
	_lootChatData(data, labels, props) {
		if(data?.weight) props.push(`<li class="weight">${data.weight} ${game.i18n.localize("DND4E.AbbreviationLbs")}</li>`);
		if(data?.price) props.push(`<li class="price">${data.price} ${game.i18n.localize("DND4E.GP")}</li>`);
	}

	/* -------------------------------------------- */

	/**
	 * Render a chat card for Spell type data
	 * @return {Object}
	 * @private
	 */
	_spellChatData(data, labels, props) {
		if(labels?.level) props.push(`<li class="level">${labels.level}</li>`);
		if(labels?.components) props.push(`<li class="level">${labels.components} ${labels.materials || ''}`);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for items of the "Feature" type
	 * @private
	 */
	_featureChatData(data, labels, props) {
		for (const [key, value] of Object.entries(labels)) {
			props.push(`<li class="${key}">${value}</li>`);
		}
	}
	
	/**
	 * Prepare chat card data for items of the "Power" type
	 * @private
	 */
	_powerChatData(data, labels, props) {
		for (const [key, value] of Object.entries(labels)) {
			props.push(`<li class="${key}">${value}</li>`);
		}
	}


	/* -------------------------------------------- */
	/*  Item Rolls - Attack, Damage, Saves, Checks  */
	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, power, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @param {object} options        Roll options which are configured and provided to the d20Roll function
	 * @return {Promise<Roll|null>}   A Promise which resolves to the created Roll instance
	 */
	async rollAttack(options={}) {
		const itemData = this.system;
		const actorData = this.actor;
		// itemData.weaponUse = 2nd dropdown - default/none/weapon
		// itemData.weaponType = first dropdown: melee/ranged/implement/none etc...
		// find details on the weapon being used, if any.   This is null if no weapon is being used.
		
		//console.debug(options);
		const weaponUse = Helper.getWeaponUse(itemData, this.actor);

		if(Helper.lacksRequiredWeaponEquipped(itemData, weaponUse)) {
			ui.notifications.error(game.i18n.localize("DND4E.LackRequiredWeapon"));
			return null;
		}

		if(!this.hasAttack ) {
			ui.notifications.error("You may not place an Attack Roll with this Item.");
			return null;
		}

		// let title = `${this.name} - ${game.i18n.localize("DND4E.AttackRoll")}`;
		let title = `${game.i18n.localize("DND4E.AttackRoll")}: ${this.name}`;
			let flavor = title;
		
			//weapon attack roll check
		if (weaponUse) {
			title += ` - ${weaponUse.name}`;
					flavor += `<br />${weaponUse.name}`;
		}

		//Defence targeted is now printed per-target
		/*if(itemData.attack.def) {
			flavor += ` ${game.i18n.localize("DND4E.VS")} <strong>${itemData.attack.def.toUpperCase() }</strong>`;
		}*/

		if(game.user.targets.size) {
			options.attackedDef = itemData.attack.def; 
		}
		
		const rollData = this.getRollData({'variance':options?.variance});

		rollData.isAttackRoll = true;
		rollData.commonAttackBonuses = actorData.system.commonAttackBonuses;
		//console.debug(rollData.commonAttackBonuses);
		rollData["ammo"] = 0 // because ammo is added to by weapon use multiple clicks of the button will add it higher

		// Define Roll bonuses
		const parts = [];
		const partsExpressionReplacements = [];
		if(!!itemData.attack.formula) {		
			parts.push(Helper.commonReplace(itemData.attack.formula, actorData, this.system, weaponUse? weaponUse.system : null))
			partsExpressionReplacements.push({value : itemData.attack.formula, target: parts[0]})
			// add the substitutions that were used in the expression to the data object for later
			options.formulaInnerData = Helper.commonReplace(itemData.attack.formula, actorData, this.system, weaponUse? weaponUse.system : null, 1, true)
		}

		const handlePowerAndWeaponAmmoBonuses = (onHasBonus, consumable, resourceType) => {
			if ( consumable?.type === "ammo" ) {
				if (Helper.isNonEmpty(consumable.target) && Helper.isNonEmpty(consumable.amount))
				{
					const ammo = this.actor.items.get(consumable.target);
					if (ammo) {
						const ammoCount = ammo.system.quantity;
						if ( ammoCount && (ammoCount - consumable.amount >= 0) ) {
							let ammoBonus = ammo.system.attackBonus;
							if ( ammoBonus ) {
								onHasBonus(ammo, ammoBonus)
							}
						}
						else {
							ui.notifications.warn(game.i18n.format("The {resourceType} requires {quantity} of '{target}' but the character only has {ammoCount}",
								{resourceType, ammoCount, target: ammo.name, quantity: consumable.amount}))
						}
					}
					else {
						ui.notifications.warn(game.i18n.format("The {resourceType} requires a ammunition but none could be found on the character",
							{resourceType, target: consumable.target}))
					}
				}
				else {
					if (!Helper.isNonEmpty(consumable.target)) {
						ui.notifications.warn(game.i18n.format("The {resourceType} requires ammunition, but the type ('{target}') was empty",
							{resourceType, target: consumable.target, quantity: consumable.amount}))
					}
					if (!Helper.isNonEmpty(consumable.quantity)) {
						ui.notifications.warn(game.i18n.format("The {resourceType} requires ammunition, but the quantity ('{quantity}') was empty",
							{resourceType, target: consumable.target, quantity: consumable.amount}))
					}
				}
			}
		}

		// Ammunition Bonus from power.
		delete this._ammo;
		const powerHasAmmoWithBonus = (ammo, ammoBonus) => {
			parts.push("@ammo");
			rollData["ammo"] = ammoBonus;
			title += ` [${ammo.name}]`;
			this._ammo = ammo;
		}
		handlePowerAndWeaponAmmoBonuses(powerHasAmmoWithBonus, itemData.consume, "power")
	
		// Ammunition Bonus from weapon.
		if(weaponUse) {
			delete weaponUse._ammo;
			const weaponHasAmmoWithBonus = (ammo, ammoBonus) => {
				if (parts[parts.length-1] !== "@ammo" ) parts.push("@ammo");
				rollData["ammo"]? rollData["ammo"] += ammoBonus : rollData["ammo"] = ammoBonus;
				title += ` [${ammo.name}]`;
				weaponUse._ammo = ammo;
			}
			handlePowerAndWeaponAmmoBonuses(weaponHasAmmoWithBonus, weaponUse.system.consume, "weapon used by the power")
		}
		
		await Helper.applyEffects([parts], rollData, actorData, this, weaponUse, "attack")

		// Compose roll options
		const rollConfig = {
			parts,
			partsExpressionReplacements,
			actor: this.actor,
			item: this,
			weaponUse: weaponUse,
			data: rollData,
			title,
			flavor,
			event: options.event,
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			dialogOptions: {
				width: 400,
				top: options.event ? options.event.clientY - 80 : null,
				left: window.innerWidth - 710
			},
			isAttackRoll: true,
			'isCharge': options?.variance?.isCharge || false,
			'isOpp': options?.variance?.isOpp || false,
			messageData: {"flags.dnd4e.roll": {type: "attack", itemId: this.id }},
			options,
		};
		
		//Prevent actor with all its items getting embedded
		const parentID = this.actor.uuid;
		rollConfig.options.parent = parentID;

		if(["power", "consumable"].includes(this.type)){
			rollConfig.options.powerEffects = this.effects;
		}

		// // Expanded weapon critical threshold
		if (weaponUse) {
			rollConfig.critical = itemData.weaponType === "implement" ? weaponUse.system.critRangeImp : weaponUse.system.critRange;
		}
		// Invoke the d20 roll helper
		const roll = await d20Roll(rollConfig);
		if ( roll === false ) return null;

		// Handle resource consumption if the attack roll was made
		const allowed = await (
			this._handleResourceConsumption({isCard: false, isAttack: true},this.system),
			weaponUse? this._handleResourceConsumption({isCard: false, isAttack: true},this.actor.items.get(weaponUse.id).system) : true
		// itemData.weaponUse? this.actor.items.get(itemData.weaponUse)
		);
	
	
		if ( allowed === false ) return null;
	
		return roll;
	}

	async getAttackBonus(options={}) {
		if (!this.hasAttack) return;

		const itemData = this.system;
		const actorData = this.actor;
		const weaponUse = Helper.getWeaponUse(itemData, this.actor);

		if(Helper.lacksRequiredWeaponEquipped(itemData, weaponUse)) {
			return;
		}

		const rollData = this.getRollData(options);

		rollData.isAttackRoll = true;
		rollData.commonAttackBonuses = actorData.system.commonAttackBonuses;
		//console.debug(rollData.commonAttackBonuses);
		rollData["ammo"] = 0;

		// Define Roll bonuses
		const parts = [];
		const partsExpressionReplacements = [];
		if(!!itemData.attack.formula) {		
			parts.push(Helper.commonReplace(itemData.attack.formula, actorData, this.system, weaponUse? weaponUse.system : null));
			partsExpressionReplacements.push({value : itemData.attack.formula, target: parts[0]});
			// add the substitutions that were used in the expression to the data object for later
			options.formulaInnerData = Helper.commonReplace(itemData.attack.formula, actorData, this.system, weaponUse? weaponUse.system : null, 1, true);
		}

		const handlePowerAndWeaponAmmoBonuses = (onHasBonus, consumable, resourceType) => {
			if ( consumable?.type === "ammo" ) {
				if (Helper.isNonEmpty(consumable.target) && Helper.isNonEmpty(consumable.amount))
				{
					const ammo = this.actor.items.get(consumable.target);
					if (ammo) {
						const ammoCount = ammo.system.quantity;
						if ( ammoCount && (ammoCount - consumable.amount >= 0) ) {
							let ammoBonus = ammo.system.attackBonus;
							if ( ammoBonus ) {
								onHasBonus(ammo, ammoBonus);
							}
						}
					}
				}
			}
		}

		// Ammunition Bonus from power.
		delete this._ammo;
		const powerHasAmmoWithBonus = (ammo, ammoBonus) => {
			parts.push("@ammo");
			rollData["ammo"] = ammoBonus;
			this._ammo = ammo;
		}
		handlePowerAndWeaponAmmoBonuses(powerHasAmmoWithBonus, itemData.consume, "power");
	
		// Ammunition Bonus from weapon.
		if(weaponUse) {
			delete weaponUse._ammo;
			const weaponHasAmmoWithBonus = (ammo, ammoBonus) => {
				if (parts[parts.length-1] !== "@ammo" ) parts.push("@ammo");
				rollData["ammo"]? rollData["ammo"] += ammoBonus : rollData["ammo"] = ammoBonus;
				weaponUse._ammo = ammo;
			}
			handlePowerAndWeaponAmmoBonuses(weaponHasAmmoWithBonus, weaponUse.system.consume, "weapon used by the power");
		}
		await Helper.applyEffects([parts], rollData, actorData, this, weaponUse, "attack");

		// Compose roll options
		const rollConfig = {
			parts,
			partsExpressionReplacements,
			data: rollData,
			options
		};

		if(["power", "consumable"].includes(this.type)){
			rollConfig.options.powerEffects = this.effects;
			rollConfig.options.parent = this.parent;
		}
		
		// Get the bonus
		const bonus = getAttackRollBonus(rollConfig);

		return bonus;
	}

	rangeData() {
		const C = CONFIG.DND4E; 
		let rangeData = {};
		let area;
		if(this.system.area) {
			try{
				let areaForm = game.helper.commonReplace(`${this.system.area}`, this.actor);
				area = Roll.safeEval(areaForm);
			} catch (e) {
				area = this.system.area;
			}
		} else {
			area = 0;
		}

		if(this.system.rangeType === "range") {
			rangeData.rangeText = `${C.rangeType.range.label} ${this.system.rangePower}`
			rangeData.rangeTextShort = C.rangeType.range.abbr
			rangeData.rangeTextBlock = `${this.system.rangePower}`
			if(this.system.range.long) {
				rangeData.rangeText += `/${this.system.range.long}`
				rangeData.rangeTextBlock += `/${this.system.range.long}`
			}
		} else if(this.system.rangeType === "closeBurst") {
			rangeData.rangeText = `${C.rangeType.closeBurst.label} ${area}`
			rangeData.rangeTextShort = C.rangeType.closeBurst.abbr
			rangeData.rangeTextBlock = `${area}`
		} else if(this.system.rangeType === "rangeBurst") {
			rangeData.rangeText = `${C.rangeType.rangeBurst.label} ${area} ${game.i18n.localize('DND4E.RangeWithin')} ${this.system.rangePower}`
			rangeData.rangeTextShort = C.rangeType.rangeBurst.abbr
			rangeData.rangeTextBlock = `${area}(${this.system.rangePower})`
		} else if(this.system.rangeType === "closeBlast") {
			rangeData.rangeText = `${C.rangeType.closeBlast.label} ${area}`
			rangeData.rangeTextShort = C.rangeType.closeBlast.abbr
			rangeData.rangeTextBlock = `${area}`
		} else if(this.system.rangeType === "rangeBlast") {
			rangeData.rangeText = `${C.rangeType.rangeBlast.label} ${area} ${game.i18n.localize('DND4E.RangeWithin')} ${this.system.rangePower}`
			rangeData.rangeTextShort = C.rangeType.rangeBlast.abbr
 			rangeData.rangeTextBlock = `${area}(${this.system.rangePower})`
		} else if(this.system.rangeType === "wall") {
			rangeData.rangeText = `${C.rangeType.wall.label} ${area} ${game.i18n.localize('DND4E.RangeWithin')} ${this.system.rangePower}`
			rangeData.rangeTextShort = C.rangeType.wall.abbr
			rangeData.rangeTextBlock = `${area}(${this.system.rangePower})`
		} else if(this.system.rangeType === "personal") {
			rangeData.rangeText = C.rangeType.personal.label
			rangeData.rangeTextShort = C.rangeType.personal.abbr
		} else if(this.system.rangeType === "special") {
			rangeData.rangeText = C.rangeType.special.label
			rangeData.rangeTextShort = C.rangeType.special.abbr
		} else if(this.system.rangeType === "touch") {
			rangeData.rangeTextShort = C.rangeType.touch.abbr;
			rangeData.rangeText = C.rangeType.touch.label;
		} else if(this.system.rangeType === "melee"){
			rangeData.rangeTextShort = C.rangeType.melee.abbr;
			if(this.system.rangePower === undefined || this.system.rangePower === null){
				rangeData.rangeText = C.rangeType.melee.label;
			} else {
				rangeData.rangeText = `${C.rangeType.melee.label} ${this.system.rangePower}`;
				rangeData.rangeTextBlock = `${this.system.rangePower}`
			}
		} else if(this.system.rangeType === "reach"){
			rangeData.rangeText = `${C.rangeType.reach.label} ${this.system.rangePower}`;
			rangeData.rangeTextShort = C.rangeType.reach.abbr;
			rangeData.rangeTextBlock = `${this.system.rangePower}`
			
		} else if(this.system.rangeType === "weapon") {

			try {
				const weaponUse = Helper.getWeaponUse(this.system, this.actor);
				if(weaponUse.system.isRanged && this.system.weaponType !== 'melee') {
					rangeData.rangeText = `${game.i18n.localize('DND4E.rangeWeaponRanged')} - ${weaponUse.name}`
					rangeData.rangeTextShort = game.i18n.localize('DND4E.rangeWeaponRangedAbbr')
					rangeData.rangeTextBlock = `${weaponUse.system.range.value}/${weaponUse.system.range.long}`
				} else {
					rangeData.rangeText = `${game.i18n.localize('DND4E.rangeWeaponMelee')} - ${weaponUse.name}`;
					rangeData.rangeTextShort = game.i18n.localize('DND4E.rangeWeaponMeleeAbbr');
					
					if(this.system.rangePower == null){
						rangeData.rangeTextBlock = (weaponUse.system.properties.rch ? '2' : '')
					} else {
						rangeData.rangeTextBlock = `${this.system.rangePower}`;
					}
				}

			} catch {
				rangeData.rangeText = "Weapon";
				rangeData.rangeTextShort = game.i18n.localize('DND4E.rangeWeaponMeleeAbbr')
				rangeData.rangeTextBlock = `${this.system.rangePower}`

				if(this.system.rangePower == null){
					rangeData.rangeTextBlock = '';
				} else {
					rangeData.rangeTextBlock = `${this.system.rangePower}`;
				}
			}

		} else {
			rangeData.rangeText = game.i18n.localize("DND4E.NotAvailable");
			rangeData.rangeTextShort = game.i18n.localize("DND4E.NotAvailableShort");
		}

		return rangeData;
	}
	/* -------------------------------------------- */

	/**
	 * Place a damage roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the damageRoll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollDamage({event, spellLevel=null, versatile=false, fastForward=undefined, variance={}}={}) {
		const itemData = this.system;
		const actorData = this.actor;
		const actorInnerData = this.actor.system;
		const weaponUse = Helper.getWeaponUse(itemData, this.actor);

		if(Helper.lacksRequiredWeaponEquipped(itemData, weaponUse)) {
			ui.notifications.error(game.i18n.localize("DND4E.LackRequiredWeapon"));
			return null;
		}

		if ( !this.hasDamage ) {
			ui.notifications.error("You may not make a Damage Roll with this Item.");
			return null;
		}
		const messageData = {"flags.dnd4e.roll": {type: "damage", itemId: this.id }};

		// Get roll data
		const rollData = this.getRollData({'variance':variance});
		if ( spellLevel ) rollData.item.level = spellLevel;

		// Get message labels
		let title = `${this.name} - ${game.i18n.localize("DND4E.DamageRoll")}`;
		let flavor = this.labels.damageTypes?.length ? `${title} (${this.labels.damageTypes})` : title;

		// Define Roll  and add seconadry parts
		const returnDamageRollAndOptionalType = (damageRoll, damageType) => {
			if (damageType && damageType !== game.i18n.localize(game.dnd4e.config.damageTypes.damage) && damageType !== game.i18n.localize("DND4E.None")) {
				return `(${damageRoll})[${damageType}]`
			}
			else {
				return damageRoll
			}

		}
		const options = { formulaInnerData: {}, divisors: {normal: 1, miss: 1, crit: 1} }
		const secondaryPartsHelper = (formula, damageType) => {
			// store the values that were used to sub in any formulas
			options.formulaInnerData = foundry.utils.mergeObject(options.formulaInnerData, Helper.commonReplace(formula, actorData, this.system, weaponUse?.system, 1, true))
			// convert formula and type into a single string of "substituted formula [type]"
			return returnDamageRollAndOptionalType(Helper.commonReplace(formula, actorData, this.system, weaponUse?.system), damageType)
		}
		const parts = itemData.damage.parts.map(d => secondaryPartsHelper(d[0], d[1]));
		const partsMiss = itemData.damage.parts.map(d => secondaryPartsHelper(d[0], d[1]));
		const partsCrit = itemData.damageCrit.parts.map(d => secondaryPartsHelper(d[0], d[1]));

		// store the original expression formula that produced those formula
		const partsExpressionReplacement = parts.map(part => { return {target: part, value: "@pow2ndryDamage"}})
		const partsMissExpressionReplacement = partsMiss.map(part => { return {target: part, value: "@pow2ndryDamage"}})
		const partsCritExpressionReplacement = partsCrit.map(part => { return {target: part, value: "@pow2ndryCritDamage"}})

		// itemData.damageType
		let primaryDamage = ''
		const pD = [];

		if(this.getDamageType()){
			for ( let [damage, d] of Object.entries(this.getDamageType())) {
				if(d){
					pD.push(damage);
					// primaryDamage += `${damage}`;
				}
			}
		}

		primaryDamage = pD.join(', ');

		let damageFormula = '';
		let missDamageFormula = '';
		let critDamageFormula = '';
		let damageFormulaExpression = '';
		let missDamageFormulaExpression = '';
		let critDamageFormulaExpression = '';
		//Add power damage into parts
		if(!!itemData.hit?.formula) {
			const formulaHelper = (formula) => {
				// store the values that were used to sub in any formulas
				options.formulaInnerData = foundry.utils.mergeObject(options.formulaInnerData, Helper.commonReplace(formula, actorData, this.system, weaponUse?.system, 1, true))
				// convert formula and type into a single string of "substituted formula [type]"
				return  Helper.commonReplace(formula, actorData, this.system, weaponUse?.system);
			}
			damageFormula = formulaHelper(itemData.hit.formula)
			missDamageFormula = formulaHelper(itemData.miss.formula)
			critDamageFormula = formulaHelper(itemData.hit.critFormula)
			damageFormulaExpression = itemData.hit.formula
			missDamageFormulaExpression = itemData.miss.formula
			critDamageFormulaExpression = itemData.hit.critFormula

			//Should now be redudent with everything moved into the Helper#CommonReplace function

			//Add seconadary weapons damage into parts
			const secondaryDamageExpressionHelper = (oldParts, expressionParts, newPartsArr) => {
				const newParts = newPartsArr.map(d =>  {
					options.formulaInnerData = foundry.utils.mergeObject(options.formulaInnerData, Helper.commonReplace(d[0], actorData, this.system, weaponUse?.system, 1, true))
					const formula = Helper.commonReplace(d[0], actorData, this.system, weaponUse?.system);
					if (d.length >= 2) {
						return returnDamageRollAndOptionalType(formula, d[1])
					}
					else {
						return formula
					}
				})

				Array.prototype.push.apply(oldParts, newParts)
				Array.prototype.push.apply(expressionParts, newParts.map(part => { return {target: part, value: "@wep2ndryDamage"}}))
			}
			//I really want to factor this, but they are annoyingly different enough to make it too headache inducing
			if(weaponUse) {
				if(itemData.hit.formula.includes("@wepDamage") && weaponUse.system.damage.parts.length > 0) {
					secondaryDamageExpressionHelper(parts, partsExpressionReplacement, weaponUse.system.damage.parts)
				}
				if(itemData.hit.critFormula.includes("@wepCritBonus") && weaponUse.system.damageCrit.parts.length > 0) {
					secondaryDamageExpressionHelper(partsCrit, partsCritExpressionReplacement, weaponUse.system.damageCrit.parts)
				}

				if(itemData.hit.formula.includes("@impDamage") && weaponUse.system.proficientI && weaponUse.system.damageImp.parts.length > 0) {
					secondaryDamageExpressionHelper(parts, partsExpressionReplacement, weaponUse.system.damageImp.parts)
				}
				if(itemData.hit.critFormula.includes("@impCritBonus") && weaponUse.system.proficientI && weaponUse.system.damageCritImp.parts.length > 0) {
					secondaryDamageExpressionHelper(partsCrit, partsCritExpressionReplacement, weaponUse.system.damageCritImp.parts)
				}

				if(itemData.miss.formula.includes("@wepDamage") && weaponUse.system.damage.parts.length > 0) {
					secondaryDamageExpressionHelper(partsMiss, partsMissExpressionReplacement, weaponUse.system.damage.parts)
				}
				if(itemData.miss.formula.includes("@impDamage") && weaponUse.system.proficientI && weaponUse.system.damageImp.parts.length > 0) {
					secondaryDamageExpressionHelper(partsMiss, partsMissExpressionReplacement, weaponUse.system.damageImp.parts)
				}
			}
		}
	
		// Adjust damage from versatile usage
		if(weaponUse) {
			if(weaponUse.system.properties["ver"] && weaponUse.system.weaponHand === "hTwo" ) {
				damageFormula += `+ 1`;
				critDamageFormula += `+ 1`;
				damageFormulaExpression  += `+ @versatile`;
				critDamageFormulaExpression += `+ @versatile`;
				options.formulaInnerData.versatile = 1
			}
		}
	
		if(this.system?.hit?.damageBonusNull) console.log(`Ignoring damage bonuses do to power config.`);
	
		// Define Roll Data
		if(!this.system?.hit?.damageBonusNull){
			const actorBonus = foundry.utils.getProperty(actorInnerData, `bonuses.${itemData.actionType}`) || {};
			if ( actorBonus.damage && parseInt(actorBonus.damage) !== 0 ) {
				// parts.push("@dmg");
				// partsCrit.push("@dmg");
				// rollData["dmg"] = actorBonus.damage;
				damageFormula += `+ ${actorBonus.damage}`
				missDamageFormula += `+ ${actorBonus.damage}`
				critDamageFormula += `+ ${actorBonus.damage}`
				damageFormulaExpression  += `+ @actorBonusDamage`
				missDamageFormulaExpression += `+ @actorBonusDamage`
				critDamageFormulaExpression +=  `+ @actorBonusDamage`
				options.formulaInnerData.actorBonusDamage = actorBonus.damage
			}
		}

		// Originally these were a separate part, but then they were not part of the primary damage type
		// which they should be.  So now appending them to the main expression.
		const effectDamageParts = []
		const extraDamageParts = []
		if(!this.system?.hit?.damageBonusNull){
			await Helper.applyEffects([effectDamageParts], rollData, actorData, this, weaponUse, "damage", extraDamageParts)
			effectDamageParts.forEach(part => {
				const value = rollData[part.substring(1)]
				damageFormula += `+ ${value}`
				missDamageFormula += `+ ${value}`
				critDamageFormula += `+ ${value}`
				damageFormulaExpression  += `+ ${part}`
				missDamageFormulaExpression += `+ ${part}`
				critDamageFormulaExpression += `+ ${part}`
				options.formulaInnerData[part.substring(1)] = value
			})
		}

		// Ammunition Damage from power
		if(this._ammo) {
			parts.push("@ammo");
			partsCrit.push("@ammo");

			if(!missDamageFormula.includes('@damageFormula') && !missDamageFormula.includes('@halfDamageFormula')){
				partsMiss.push("@ammo");
			}

			rollData["ammo"] = this._ammo.system.damage.parts.map(p => p[0]).join("+");
			flavor += ` [${this._ammo.name}]`;
			delete this._ammo;
		}
	
		// Ammunition Damage from weapon
		if(weaponUse) {
			if ( weaponUse._ammo ) {
				parts.push("@ammoW");
				partsCrit.push("@ammoW");

				if(!missDamageFormula.includes('@damageFormula') && !missDamageFormula.includes('@halfDamageFormula')){
					partsMiss.push("@ammoW");
				}

				rollData["ammoW"] = weaponUse._ammo.system.damage.parts.map(p => p[0]).join("+");
				flavor += ` [${weaponUse._ammo.name}]`;
				delete weaponUse._ammo;
			}
			title += ` with ${weaponUse.name}`
			flavor += ` with ${weaponUse.name}`
		}

		// Extra damage
		if(extraDamageParts.length) {
			for(const part of extraDamageParts) {
				parts.push(part);
				partsExpressionReplacement.unshift({target : part, value: '@extraDamage'});

				if (critDamageFormula) {
					const maxRoll = await new Roll(part).evaluate({maximize: true});
					let critPart = `(${maxRoll.total})`;
					if (maxRoll.terms[0].flavor) critPart += `[${maxRoll.terms[0].flavor}]`;
					partsCrit.push(critPart);
					partsCritExpressionReplacement.unshift({target : critPart, value: '@extraDamage'});
				}
				if (missDamageFormula) {
					partsMiss.push(part);
					partsMissExpressionReplacement.unshift({target : part, value: '@extraDamage'});
				}
			}
		}

		//Add powers text to message.
		// if(itemData.hit?.detail) flavor += '<br>Hit: ' + itemData.hit.detail
		// if(itemData.miss?.detail) flavor += '<br>Miss: ' + itemData.miss.detail
		// if(itemData.effect?.detail) flavor += '<br>Effect: ' + itemData.effect.detail;
		// Call the roll helper utility
		
		if(itemData.attack.isAttack && actorData.statuses.has('weakened')){
			options.divisors.normal *= 2;
			options.divisors.miss *= 2;
			options.divisors.crit *= 2;
		}

		if(missDamageFormula.includes('@damageFormula')){
			missDamageFormula = missDamageFormula.replace('@damageFormula', Helper.bracketed(damageFormula));
		}

		if(missDamageFormula.includes('@halfDamageFormula')){
			missDamageFormula = missDamageFormula.replace('@halfDamageFormula', Helper.bracketed(damageFormula));
			options.divisors.miss *= 2;
		}

		const primaryDamageStr = primaryDamage ? `[${primaryDamage}]` : ""
		parts.unshift(`(${damageFormula})${primaryDamageStr}`);
		partsCrit.unshift(`(${critDamageFormula})${primaryDamageStr}`);
		partsMiss.unshift(`(${missDamageFormula})${primaryDamageStr}`);
		partsExpressionReplacement.unshift({target : parts[0], value: damageFormulaExpression})
		partsCritExpressionReplacement.unshift({target : partsCrit[0], value: critDamageFormulaExpression})
		partsMissExpressionReplacement.unshift({target : partsMiss[0], value: missDamageFormulaExpression})
		
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });

		Hooks.callAll("dnd4e.rollDamage", this, speaker);		

		return damageRoll({
			event,
			parts,
			partsCrit,
			partsMiss,
			partsExpressionReplacement,
			partsCritExpressionReplacement,
			partsMissExpressionReplacement,
			actor: this.actor,
			data: rollData,
			title,
			flavor,
			speaker,
			dialogOptions: {
				width: 400,
				top: event ? event.clientY - 80 : null,
				left: window.innerWidth - 710
			},
			messageData,
			options,
			fastForward,
			'isCharge': variance?.isCharge || false,
			'isOpp': variance?.isOpp || false,
		});
	}

	/* -------------------------------------------- */
	/**
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	rollHealing({event, spellLevel=null, versatile=false, fastForward=undefined}={}) {
		const itemData = this.system;
		const actorData = this.actor;
		const actorInnerData = this.actor.system;
		const weaponUse = Helper.getWeaponUse(itemData, this.actor);

		if(Helper.lacksRequiredWeaponEquipped(itemData, weaponUse)) {
			ui.notifications.error(game.i18n.localize("DND4E.LackRequiredWeapon"));
			return null;
		}

		if ( !this.hasHealing ) {
			ui.notifications.error("You may not make a Healing Roll with this Item.");
			return null;
		}
		const messageData = {"flags.dnd4e.roll": {type: "healing", itemId: this.id }};

		// Get roll data
		const rollData = this.getRollData();
		if ( spellLevel ) rollData.item.level = spellLevel;

		// Get message labels
		const title = `${this.name} - ${game.i18n.localize("DND4E.HealingRoll")}`;
		let flavor = this.labels.damageTypes?.length ? `${title} (${this.labels.damageTypes})` : title;

		// Define Roll parts
		const parts = itemData.damage.parts.map(d => d[0]);
		const partsExpressionReplacement = itemData.damage.parts.map(part => { return {target: part[0], value: "@wep2ndryDamage"}})

		const options = { formulaInnerData : {} }
		const formulaHelper = (formula) => {
			// store the values that were used to sub in any formulas
			options.formulaInnerData = foundry.utils.mergeObject(options.formulaInnerData, Helper.commonReplace(formula, actorData, this.system, weaponUse?.system, 1, true))
			// convert formula and type into a single string of "substituted formula [type]"
			return  Helper.commonReplace(formula, actorData, this.system, weaponUse?.system);
		}

		//Add power healing into parts
		if(!itemData.hit?.healFormula){
			itemData.hit.healFormula = "0";
		}
		let surge = itemData.hit.healSurge ? `, ${itemData.hit.healSurge}`: "";
		parts.unshift(`(${formulaHelper(itemData.hit.healFormula)})[heal${surge}]`) //add healFormula here
		//Add seconadary weapons damage into parts
		if(weaponUse) {
			if(itemData.hit.healFormula.includes("@wepDamage") && weaponUse.system.damage.parts.length > 0) {
				Array.prototype.push.apply(parts, weaponUse.system.damage.parts.map(d => formulaHelper(d[0])))
				Array.prototype.push.apply(partsExpressionReplacement, weaponUse.system.damage.parts.map(part => { return {target: part[0], value: "@wep2ndryDamage"}}))
			}
			
			if(itemData.hit.healFormula.includes("@impDamage") && weaponUse.system.proficientI && weaponUse.system.damageImp.parts.length > 0) {
				Array.prototype.push.apply(parts, weaponUse.system.damageImp.parts.map(d => formulaHelper(d[0])))
				Array.prototype.push.apply(partsExpressionReplacement, weaponUse.system.damageImp.parts.map(part => { return {target: part[0], value: "@wep2ndryDamage"}}))
			}
		}

		// Adjust damage from versatile usage
		if(weaponUse) {
			if(weaponUse.system.properties["ver"] && weaponUse.system.weaponHand === "hTwo" ) {
				parts.push("1");
				messageData["flags.dnd4e.roll"].versatile = true;
				partsExpressionReplacement.push({target: "1", value: "@versatile"})
			}
		}
		// if ( versatile && itemData.damage.versatile ) {
			// parts[0] = itemData.damage.versatile;
			// messageData["flags.dnd4e.roll"].versatile = true;
		// }
	
		// Define Roll Data
		const actorBonus = foundry.utils.getProperty(actorInnerData, `bonuses.${itemData.actionType}`) || {};
		if ( actorBonus.damage && parseInt(actorBonus.damage) !== 0 ) {
			parts.push("@dmg");
			rollData["dmg"] = actorBonus.damage;
		}

		// Ammunition Damage from power
		if ( this._ammo ) {
			parts.push("@ammo");
			rollData["ammo"] = this._ammo.system.damage.parts.map(p => p[0]).join("+");
			flavor += ` [${this._ammo.name}]`;
			delete this._ammo;
		}
	
		// Ammunition Damage from weapon
		if(weaponUse) {
			if ( weaponUse._ammo ) {
				parts.push("@ammoW");
				rollData["ammoW"] = weaponUse._ammo.system.damage.parts.map(p => p[0]).join("+");
				flavor += ` [${weaponUse._ammo.name}]`;
				delete weaponUse._ammo;
			}
		}
		//Add powers text to message.
		// if(itemData.hit?.detail) flavor += '<br>Hit: ' + itemData.hit.detail
		// if(itemData.miss?.detail) flavor += '<br>Miss: ' + itemData.miss.detail
		// if(itemData.effect?.detail) flavor += '<br>Effect: ' + itemData.effect.detail;

		const speaker = ChatMessage.getSpeaker({ actor: this.actor });

		Hooks.callAll("dnd4e.rollHealing", this, speaker);

		// Call the roll helper utility
		return damageRoll({
			event,
			parts,
			partsExpressionReplacement,
			actor: this.actor,
			data: rollData,
			title,
			healingRoll: true,
			flavor,
			speaker,
			dialogOptions: {
				width: 400,
				top: event ? event.clientY - 80 : null,
				left: window.innerWidth - 710
			},
			messageData,
			options,
			fastForward
		});
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise.<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollFormula(options={}) {
		if ( !this.system.formula ) {
			throw new Error("This Item does not have a formula to roll!");
		}

		// Define Roll Data
		const rollData = this.getRollData();
		if ( options.spellLevel ) rollData.item.level = options.spellLevel;
		const title = `${this.name} - ${game.i18n.localize("DND4E.OtherFormula")}`;

		// Invoke the roll and submit it to chat
		// const roll = await new Roll(rollData.item.formula, rollData).roll({async : true});
		const roll = await new Roll(rollData.item.formula, rollData).roll();
		roll.toMessage({ 
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			flavor: this.system.description.chat || title,
			rollMode: game.settings.get("core", "rollMode"),
			messageData: {"flags.dnd4e.roll": {type: "other", itemId: this.id }}
		});
		return roll;
	}

	/* -------------------------------------------- */

	/**
	 * Use a consumable item, deducting from the quantity or charges of the item.
	 * @param {boolean} configureDialog   Whether to show a configuration dialog
	 * @return {boolean}                  Whether further execution should be prevented
	 * @private
	 */
	async _rollConsumable(configureDialog) {
		if ( this.type !== "consumable" ) throw new Error("Wrong Item type");
		const itemData = this.system;

		// Determine whether to deduct uses of the item
		const uses = itemData.uses || {};
		const autoDestroy = uses.autoDestroy;
		let usesCharges = !!uses.per && (this.preparedMaxUses > 0);
		const recharge = itemData.recharge || {};
		const usesRecharge = !!recharge.value;
		const replenishes = uses.max && ['day','enc','round'].includes(uses.per) && !autoDestroy;

		// Display a configuration dialog to confirm the usage
		let placeTemplate = false;
		let consume = uses.autoUse || true;
		if ( configureDialog ) {
			const usage = await AbilityUseDialog.create(this);
			if ( usage === null ) return false;
			consume = Boolean(usage.get("consumeUse"));
			placeTemplate = Boolean(usage.get("placeTemplate"));
		}

		// Update Item data
		if ( consume ) {
			const current = uses.value || 0;
			const remaining = usesCharges ? Math.max(current - 1, 0) : current;
			if ( usesRecharge ) await this.update({"system.recharge.charged": false});
			else {
				const q = itemData.quantity;
				// Case 1, reduce charges
				if ( remaining || ((q === 1) && replenishes && (current > 0)) ) {
					await this.update({"system.uses.value": remaining});
				}
				// Case 2, reduce quantity
				else if ( q > 1 && !replenishes ) {
					await this.update({"system.quantity": q - 1, "system.uses.value": this.preparedMaxUses || 0});
				}
				// Case 3, destroy the item
				else if ( (q <= 1) && autoDestroy ) {
					await this.actor.deleteEmbeddedDocuments("Item", [this.id]);
				}
				// Case 4, reduce item to 0 quantity and 0 charges
				else if ( (q === 1) && !replenishes ) {
					await this.update({"system.quantity": q - 1, "system.uses.value": 0});
				}
				// Failsafe, item unusable, display warning and do nothing
				else {
					ui.notifications.warn(game.i18n.format("DND4E.ItemNoUses", {name: this.name}));
				}
			}
		}

		// Maybe initiate template placement workflow
		if ( this.hasAreaTarget && placeTemplate ) {
			const template = MeasuredTemplate4e.fromItem(this);
			if ( template ) template.drawPreview(event);
			if ( this.isEmbedded  && this.parent.sheet ) this.parent.sheet.minimize();
		}
		return true;
	}

	/* -------------------------------------------- */

	/**
	 * Perform an ability recharge test for an item which uses the d6 recharge mechanic
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollRecharge() {
		const data = this.system;
		if ( !data.recharge.value ) return;

		// Roll the check
		// const roll = await new Roll("1d6").roll({async: true});
		const roll = await new Roll("1d6").roll();
		const success = roll.total >= parseInt(data.recharge.value);

		// Display a Chat Message
		const promises = [roll.toMessage({
			flavor: `${game.i18n.format("DND4E.ItemRechargeCheck", {name: this.name})} - ${game.i18n.localize(success ? "DND4E.ItemRechargeSuccess" : "DND4E.ItemRechargeFailure")}`,
			speaker: ChatMessage.getSpeaker({actor: this.actor, token: this.actor.token})
		})];

		// Update the Item data
		if ( success ) promises.push(this.update({"system.recharge.charged": true}));
		return Promise.all(promises).then(() => roll);
	}

	/* -------------------------------------------- */

	/**
	 * Roll a Tool Check. Rely upon the d20Roll logic for the core implementation
	 * @prarm {Object} options   Roll configuration options provided to the d20Roll function
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	rollToolCheck(options={}) {
		return this.rollToolOrRitualCheck("tool", "DND4E.ToolCheck", options)
	}

	/**
	 * Roll a Ritual Check. Rely upon the d20Roll logic for the core implementation
	 * @prarm {Object} options   Roll configuration options provided to the d20Roll function
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	rollRitualCheck(options={}) {
		return this.rollToolOrRitualCheck("ritual", "DND4E.RitualCheck", options)
	}

	rollToolOrRitualCheck(rollType, titleKey, options={}) {

		//if ( this.type !== "tool" ) throw "Wrong item type!";
		// Prepare roll data
		let rollData = this.getRollData();
		const parts = ["@" + rollType];

		if(this.system.formula) {
			rollData[rollType] = Helper.commonReplace(this.system.formula.replace("@attribute", Helper.byString(this.system.attribute, this.actor.system)), this.actor.system, this.system);
		} else {
			rollData[rollType] = `1d20 + ${Helper.byString(this.system.attribute, this.actor.system)}`; 
			if(this.system.bonus){
				//if does not srtart with a number sign add one
				let trimmedbonus = this.system.bonus.toString().trim();
				if(!(trimmedbonus.startsWith("+") || trimmedbonus.startsWith("-"))) {
					trimmedbonus = ' + ' + trimmedbonus;
				}
				rollData[rollType]+= `${trimmedbonus}`;
			}
		}
		console.log(rollData[rollType])
		const title = `${this.name} - ${game.i18n.localize(titleKey)}`;

		const label = Helper.byString(this.system.attribute.replace(".mod",".label").replace(".total",".label"), this.actor.system);

		const flavour = this.system.description.chat ? `${this.system.description.chat} (${label} check)` : `${this.name} - ${game.i18n.localize(titleKey)}  (${label} check)`;
		// Compose the roll data
		const rollConfig = foundry.utils.mergeObject({
			parts: parts,
			data: rollData,
			title: title,
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			flavor: flavour,
			dialogOptions: {
				width: 400,
				top: options.event ? options.event.clientY - 80 : null,
				left: window.innerWidth - 710,
			},
			messageData: {"flags.dnd4e.roll": {type: rollType, itemId: this.id }}
		}, options);

		rollConfig.event = options.event;
		// Call the roll helper utility
		return d20Roll(rollConfig);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	getRollData(options={}) {
		//console.debug(options);
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = foundry.utils.duplicate(this.system);
		rollData.item.name = this.name;
		rollData.item.flags = foundry.utils.duplicate(this.flags);

		// Include an ability score modifier if one exists
		const abl = this.abilityMod;
		if ( abl ) {
			const ability = rollData.abilities[abl];
			rollData["mod"] = ability.mod || 0;
		}

		// Include a proficiency score
		// const prof = "proficient" in rollData.item ? (rollData.item.proficient || 0) : 1;
		// rollData["prof"] = Math.floor(prof * rollData.attributes.prof);
		
		// Temporary properties from special modes
		rollData.isCharge = options?.variance?.isCharge || false;
		rollData.isOpp = options?.variance?.isOpp || false;
		
		//console.debug(rollData);
		
		return rollData;
	}

	/* -------------------------------------------- */
	/*  Chat Message Helpers                        */
	/* -------------------------------------------- */
	
	static chatListeners(html) {
		//html.on('click', '.card-buttons button, .effects-tray button', this._onChatCardAction.bind(this));
		html.addEventListener("click", (event) => {
			if (!event.target) return;
			const el = event.target.closest(".card-buttons button, .effects-tray button");
			if (el) this._onChatCardAction.call(this, event);
		});
		//html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
		html.addEventListener("click", (event) => {
			if (!event.target) return;
			const el = event.target.closest(".item-name");
			if (el) this._onChatCardToggleContent.call(this, event);
		});

		//html.on("click", ".item-name, .collapsible", this._onChatCardEffectCollapsibleToggleContent.bind(this));
		html.addEventListener("click", (event) => {
			if (!event.target) return;
			const el = event.target.closest(".item-name, .collapsible");
			if (el) this._onChatCardEffectCollapsibleToggleContent.call(this, event);
		});
	}

	static _onChatCardEffectCollapsibleToggleContent(event){
		// If the user is clicking on a link in the collapsible region, don't collapse
		if ( event.target.closest(":is(.item-name, .collapsible) :is(a, button)") ) return;

		event.preventDefault();
		const header = event.target.closest("div");
		const card = header.closest(".chat-card");
		const content = card.querySelector(".card-content:not(.details)");
		
		// if ( content ) content.style.display = content.style.display === "none" ? "block" : "none";
		if ( header.classList.contains("collapsible") ) {
			header.classList.toggle("collapsed");
			const collapsed = header.classList.contains("collapsed");
			const details = header.querySelector(".collapsible-content");
			details.style.height = collapsed ? "0" : `${details.scrollHeight}px`;

			// Clear the height from the chat popout container so that it appropriately resizes.
			const popout = header.closest(".chat-popout");
			if ( popout ) popout.style.height = "";
		}
	}
	/* -------------------------------------------- */

	/**
	 * Handle execution of a chat card action via a click event on one of the card buttons
	 * @param {Event} event       The originating click event
	 * @returns {Promise}         A promise which resolves once the handler workflow is complete
	 * @private
	 */
	static async _onChatCardAction(event) {
		event.preventDefault();
		
		// Extract card data
		const button = event.target;
		button.disabled = true;
		const card = button.closest(".chat-card");
		const messageId = card.closest(".message").dataset.messageId;
		const message =  game.messages.get(messageId);
		const action = button.dataset.action;
		
		//console.debug(message);
		
		// Validate permission to proceed with the roll
		const isTargetted = action === "save" || action === "applyEffect";
		if ( !( isTargetted || game.user.isGM || message.isAuthor ) ) return;

		// Get the Actor from a synthetic Token
		const actor = this._getChatCardActor(card);
		if ( !actor ) return;

		// Get the Item
		const storedData = message.getFlag("dnd4e", "itemData");
		const item = storedData ? new this(storedData, {parent: actor}) : actor.items.get(card.dataset.itemId) || storedData;

		if ( !item ) {
			return ui.notifications.error(game.i18n.format("DND4E.ActionWarningNoItem", {item: card.dataset.itemId, name: actor.name}))
		}
		const spellLevel = parseInt(card.dataset.spellLevel) || null;
		const variance = message.flags?.dnd4e?.variance || {};

		//console.debug(variance);

		// Get card targets
		let targets = [];
		if ( isTargetted ) {
			targets = this._getChatCardTargets(card);
			if ( !targets.length ) {
				ui.notifications.warn(game.i18n.localize("DND4E.ActionWarningNoToken"));
				return button.disabled = false;
			}
		}

		// Attack and Damage Rolls
		console.log(action)
		let effectTargets = game.user.targets // Set
		if (game.settings.get("dnd4e","applyEffectsToSelection")) {
			effectTargets = new Set(canvas.tokens.controlled) // Array, convert to set
		}

		if ( action === "attack" ) await item.rollAttack({event, 'variance':variance});
		else if ( action === "damage" ) await item.rollDamage({event, spellLevel, 'variance':variance});
		else if ( action === "healing" ) await item.rollHealing({event, spellLevel});
		else if ( action === "versatile" ) await item.rollDamage({event, spellLevel, versatile: true, 'variance':variance});
		else if ( action === "formula" ) await item.rollFormula({event, spellLevel, 'variance':variance});
		
		// Effects
		else if ( action === "applyEffect" ) {
			//apply the single effect from button
			const effectId = button.closest("[data-uuid]")?.dataset.uuid.split('.').pop();
			//const effect = effects.await fromUuid(button.closest("[data-uuid]")?.dataset.uuid);
			//Get effect from embedded data, in case the source has been expended/deleted
			const effect = item.effects.get(effectId);
			const targets = game.settings.get("dnd4e", "applyEffectsToSelection") ? canvas.tokens.controlled : game.user.targets;
			Helper.applyEffectsToTokens([effect], targets, effect.flags.dnd4e.effectData.powerEffectTypes, actor);
		} 
		else if ( action === "effect" ) Helper.applyAllXEffectsToTokens(item.effects, actor, effectTargets);
		else if ( action === "hitEffect" ) Helper.applyEffectsToTokens(item.effects, effectTargets, "hit", actor);
		else if ( action === "missEffect" ) Helper.applyEffectsToTokens(item.effects, effectTargets, "miss", actor);
		else if ( action === "hitOrMissEffect" ) Helper.applyEffectsToTokens(item.effects, effectTargets, "hitOrMiss", actor);

		// Saving Throws for card targets
		else if ( action === "save" ) {
			for ( let a of targets ) {
				const speaker = ChatMessage.getSpeaker({scene: canvas.scene, token: a.token});
				await a.rollAbilitySave(button.dataset.ability, { event, speaker });
			}
		}

		// Tool usage
		else if ( action === "toolCheck" ) await item.rollToolCheck({event});
		else if ( action === "ritualCheck" ) await item.rollRitualCheck({event});

		// Spell Template Creation
		else if ( action === "placeTemplate") {
			const template = MeasuredTemplate4e.fromItem(item);
			if ( template ) template.drawPreview(event);
		}

		// Re-enable the button
		button.disabled = false;
	}

	/* -------------------------------------------- */

	/**
	 * Handle toggling the visibility of chat card content when the name is clicked
	 * @param {Event} event   The originating click event
	 * @private
	 */
	static _onChatCardToggleContent(event) {
		event.preventDefault();
		const header = event.target;
		const card = header.closest(".chat-card");
		const content = card.querySelector(".card-content");
		content.style.display = content.style.display === "none" ? "block" : "none";
	}

	/* -------------------------------------------- */

	/**
	 * Get the Actor which is the author of a chat card
	 * @param {HTMLElement} card    The chat card being used
	 * @return {Actor|null}         The Actor entity or null
	 * @private
	 */
	static _getChatCardActor(card) {
		// Case 1 - a synthetic actor from a Token
		const tokenKey = card.dataset.tokenId;
		if (tokenKey) {
			const [,sceneId,,tokenId] = tokenKey.split(".");
			const scene = game.scenes.get(sceneId);
			if (!scene) return null;
			const tokenData = scene.getEmbeddedDocument("Token", tokenId);
			if (!tokenData) return null;
			const token = new foundry.canvas.placeables.Token(tokenData);
			return token.actor;
		}

		// Case 2 - use Actor ID directory
		const actorId = card.dataset.actorId;
		return game.actors.get(actorId) || null;
	}

	/* -------------------------------------------- */

	/**
	 * Get the Actor which is the author of a chat card
	 * @param {HTMLElement} card    The chat card being used
	 * @return {Array.<Actor>}      An Array of Actor entities, if any
	 * @private
	 */
	static _getChatCardTargets(card) {
		const character = game.user.character;
		const controlled = canvas.tokens.controlled;
		const targets = controlled.reduce((arr, t) => t.actor ? arr.concat([t.actor]) : arr, []);
		if ( character && (controlled.length === 0) ) targets.push(character);
		return targets;
	}

	//SPECIFICALLY for detecting if a power needs a recharge roll
	isOnCooldown(){
		if(this.type !== "power") return false;
		if(this.system.uses.value || (!this.system.uses.value && !this.system.uses.max)) return false;
		if(this.system.type !== "recharge") return false;

		return true;
	}


	/* -------------------------------------------- */
	/*	Getters										*/
	/* -------------------------------------------- */

	/**
	 * Get the weight of all of the currency. Always returns 0 if currency weight is disabled in settings.
	 * @returns {number}
	 */
	get currencyWeight() {
		if ( !game.settings.get("dnd4e", "currencyWeight") ) return 0;

		let weight = 0;
		for (let [e, v] of Object.entries(this.system.currency)) {
			weight += (e == "ad" ? v/500 : v/50);
		}

		return weight;
	}

	/**
	 * Get the weight of all of the Ritual Componets. Always returns 0 if currency weight is disabled in settings.
	 * @returns {number}
	 */
	get ritualCompWeight() {
		if ( !game.settings.get("dnd4e", "currencyWeight") ) return 0;

		let weight = 0;
		//4e 1gp of residuum weights 0.000002
		for (let [e, v] of Object.entries(actorData.currency)) {
			weight += v * 0.000002;
		}

		return weight;
	}

	/* -------------------------------------------- */
	/*				Container Functions				*/
	/* -------------------------------------------- */

	/**
	 * Get all of the items contained in this container. A promise if item is within a compendium.
	 * @type {Collection<Item4e>|Promise<Collection<Item4e>>}
	 */
	get contents() {
		const parent = this;

		if ( !parent ) return new foundry.utils.Collection();

		// If in a compendium, fetch using getDocuments and return a promise
		if ( parent.pack && !parent.isEmbedded ) {
			const pack = game.packs.get(parent.pack);
			return pack.getDocuments({system: { container: parent.id }}).then(d =>
			new foundry.utils.Collection(d.map(d => [d.id, d]))
			);
		}

		// Otherwise use local document collection
		return (parent.isEmbedded ? parent.actor.items : game.items).reduce((collection, item) => {
			if ( item.system.container === parent.id ) collection.set(item.id, item);
			return collection;
		}, new foundry.utils.Collection());
	}

	/* --------------------------------------------- */

	/**
	 * The item that contains this item, if it is in a container. Returns a promise if the item is located
	 * in a compendium pack.
	 * @type {Item4e|Promise<Item4e>|void}
	 */
	get container() {
		if ( !this.system.container ) return;
		if ( this.isEmbedded ) return this.actor.items.get(this.system.container);
		if ( this.pack ) return game.packs.get(this.pack).getDocument(this.system.container);
		return game.items.get(this.system.container);
	}

	/* -------------------------------------------- */

	/**
	 * Fetch a specific contained item.
	 * @param {string} id                 ID of the item to fetch.
	 * @returns {Item4e|Promise<Item4e>}  Item if found.
	 */
	getContainedItem(id) {
		if ( this.isEmbedded ) return this.actor.items.get(id);
		if ( this.parent?.pack ) return game.packs.get(this.parent.pack)?.getDocument(id);
		return game.items.get(id);
	}

	/** @inheritdoc */
	async _handleDroppedEntry(target, data) {

		// Obtain the dropped Document

		let item = await Item.fromDropData(data); //this._getDroppedEntryFromData(data);
		if ( !item ) return;

		const oldContainer = item.container;


		// Create item and its contents if it doesn't already exist here
		if ( !this._entryAlreadyExists(item) ) {
			const toCreate = await Item4e.createWithContents([item]);
			const folder = target?.closest("[data-folder-id]")?.dataset.folderId;
			if ( folder ) toCreate.map(d => d.folder = folder);
			[item] = await Item4e.createDocuments(toCreate, {keepId: true});
		}
		// Otherwise, if it is within a container, take it out
		else if ( oldContainer ){
			await item.update({"system.container": null});
		}

		// refresh any container sheets if open... TODO, this doesn't refresh the sheet for others veiwing it.
		// if(oldContainer) oldContainer.sheet.render(oldContainer.sheet.rendered);

		// Let parent method perform sorting
		super._handleDroppedEntry(target, item.toDragData());
	}

	/* -------------------------------------------- */

	/**
	 * Get all of the items in this container and any sub-containers. A promise if item is within a compendium.
	 * @type {Collection<Item4e>|Promise<Collection<Item4e>>}
	 */
	get allContainedItems() {
		if ( this.parent?.pack ) return this.#allContainedItems();

		return this.contents.reduce((collection, item) => {
			collection.set(item.id, item);
			if ( item.type === "container" ) item.system.allContainedItems.forEach(i => collection.set(i.id, i));
			return collection;
		}, new foundry.utils.Collection());
	}

	/**
	 * Asynchronous helper method for fetching all contained items from a compendium.
	 * @returns {Promise<Collection<Item4e>>}
	 * @private
	 */
	async #allContainedItems() {
		return (await this.contents).reduce(async (promise, item) => {
			const collection = await promise;
			collection.set(item.id, item);
			if ( item.type === "container" ) (await item.system.allContainedItems).forEach(i => collection.set(i.id, i));
			return collection;
		}, new foundry.utils.Collection());
	}

	/* -------------------------------------------- */

	/**
	 * Number of items contained in this container including items in sub-containers. Result is a promise if item
	 * is within a compendium.
	 * @type {number|Promise<number>}
	 */
	get contentsCount() {
		const reducer = (count, item) => count + item.system.quantity;
		const items = this.allContainedItems;
		if ( items instanceof Promise ) return items.then(items => items.reduce(reducer, 0));
		return items.reduce(reducer, 0);
	}

	/* -------------------------------------------- */

	/**
	 * Weight of the items in this container. Result is a promise if item is within a compendium.
	 * @type {number|Promise<number>}
	 */
	get contentsWeight() {
		if ( this.pack && !this.isEmbedded ) return this.#contentsWeight();
		return this.contents.reduce((weight, item) => weight + item.totalWeight, this.currencyWeight);
	}

	/**
	 * Asynchronous helper method for calculating the weight of items in a compendium.
	 * @returns {Promise<number>}
	 */
	async #contentsWeight() {
		const contents = await this.contents;
		return contents.reduce(async (weight, item) => await weight + await item.system.totalWeight, this.currencyWeight);
	}

	/* -------------------------------------------- */

	/**
	 * The weight of this container with all of its contents. Result is a promise if item is within a compendium.
	 * @type {number|Promise<number>}
	 */
	get totalWeight() {
		
		if(this.type !== "backpack"){
			return (this.system.quantity * this.system.weight).toNearest(0.01);
		}

		if ( this.system.capacity.weightless ) return this.system.weight;
		const containedWeight = this.contentsWeight;
		if ( containedWeight instanceof Promise ) return containedWeight.then(c => this.system.weight + c);
		return this.system.weight + containedWeight;
	}	

	/* -------------------------------------------- */
	/*  Socket Event Handlers                       */
	/* -------------------------------------------- */

	/**
	 * Trigger a render on all sheets for items within which this item is contained.
	 * @param {object} [options={}]
	 * @param {object} [options.rendering]        Additional rendering options.
	 * @param {string} [options.formerContainer]  UUID of the former container if this item was moved.
	 * @protected
	 */
	async _renderContainers({ formerContainer, ...rendering }={}) {
		if(!this.container && !formerContainer) return;

		// Render this item's container & any containers it is within
		const parentContainers = await this.allContainers();
		parentContainers.forEach(c => c.sheet?.render(false, rendering));

		// Render the actor sheet, compendium, or sidebar
		if ( this.parent?.isEmbedded ) this.parent.actor.sheet?.render(false, rendering);
		else if ( this.parent?.pack ) game.packs.get(this.parent.pack).apps.forEach(a => a.render(false, rendering));
		else ui.items.render(false);

		// Render former container if it was moved between containers
		if ( formerContainer ) {
			const former = await fromUuid(formerContainer);
			former.render(false, rendering);
			former._renderContainers(rendering);
		}
	}

	/* -------------------------------------------- */

	/**
	 * All of the containers this item is within up to the parent actor or collection.
	 * @returns {Promise<Item4e[]>}
	 */
	async allContainers() {
		let item = this;
		let container;
		let depth = 0;
		const containers = [];
		
		while ( (container = await item.container) && (depth < CONFIG.DND4E.PhysicalItemTemplate.MAX_DEPTH) ) {
			containers.push(container);
			item = container;
			depth++;
		}
		return containers;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		this._renderContainers();
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onUpdate(changed, options, userId) {
		super._onUpdate(changed, options, userId);
		this._renderContainers({ formerContainer: options.formerContainer });
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		this._renderContainers();
	}


	/* -------------------------------------------- */
	/*	Factory Methods								*/
	/* -------------------------------------------- */

	/**
	 * Prepare creation data for the provided items and any items contained within them. The data created by this method
	 * can be passed to `createDocuments` with `keepId` always set to true to maintain links to container contents.
	 * @param {Item4e[]} items								Items to create.
	 * @param {object} [context={}]							Context for the item's creation.
	 * @param {Item4e} [context.container]					Container in which to create the item.
	 * @param {boolean} [context.keepId=false]				Should IDs be maintained?
	 * @param {Function} [context.transformAll]				Method called on provided items and their contents.
	 * @param {Function} [context.transformFirst]			Method called only on provided items.
	 * @returns {Promise<object[]>}							Data for items to be created.
	 */
	static async createWithContents(items, { container, keepId=false, transformAll, transformFirst }={}) {
		let depth = 0;
		if ( container ) {
			depth = 1 + (await container.allContainers()).length;
			if ( depth > CONFIG.DND4E.PhysicalItemTemplate.MAX_DEPTH ) {
				ui.notifications.warn(game.i18n.format("DND4E.ContainerMaxDepth", { depth: CONFIG.DND4E.PhysicalItemTemplate.MAX_DEPTH }));
				return;
			}
		}
		
		const createItemData = async (item, containerId, depth) => {
			let newItemData = transformAll ? await transformAll(item) : item;
			
			if ( transformFirst && (depth === 0) ) newItemData = await transformFirst(newItemData);
			if ( !newItemData ) return;
			if ( newItemData instanceof Item ) newItemData = newItemData.toObject();
			foundry.utils.mergeObject(newItemData, {"system.container": containerId} );
			if ( !keepId ) newItemData._id = foundry.utils.randomID();

			created.push(newItemData);

			const contents = await item.contents;
			if ( contents && (depth < CONFIG.DND4E.PhysicalItemTemplate.MAX_DEPTH) ) {
				for ( const doc of contents ) await createItemData(doc, newItemData._id, depth + 1);
			}
		};

		const created = [];
		for ( const item of items ) await createItemData(item, container?.id, depth);
		return created;
	}
	
	
	/* -------------------------------------------- 
	/*	HIDE OBSOLETE ITEMS							
	/*  Transitional tool that removes obsolete item types 
	/*  from the "create item" dialogue, with the goal of 
	/*  preventing their creation from now on.  
	/*  When the obsolete item types are removed from the
	/*	system template, this override should be removed too.
	/* -------------------------------------------- */
	static createDialog(data={}, {parent=null, pack=null, types, ...options}={}) {
		try{
			types ??= Item.TYPES.filter(name => !["classFeats","raceFeats","feat","pathFeats","destinyFeats"].includes(name));
		}catch(e){
			console.error(`Failed to hide obsolete item types: ${e}`);
		}
		return super.createDialog(data, {parent, pack, types, ...options});
	}
	
	
}
