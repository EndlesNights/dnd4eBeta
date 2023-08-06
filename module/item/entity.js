import {d20Roll, damageRoll} from "../dice.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import AbilityTemplate from "../pixi/ability-template.js";
import { Helper } from "../helper.js"
import { DND4EBETA } from "../config.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class Item4e extends Item {

	
	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);
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
		if ( !this.isEmbedded) return;
		const isNPC = this.parent.type === "npc";
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
			if(actorProfs.value.includes(data.system.armourBaseType)){
				updates["system.proficient"] = actorProfs.value.includes(data.system.armourBaseType);
			}
			else if(data.system.armourBaseType === "custom"){
				updates["system.proficient"] = actorProfs.custom.split(";").includes(data.system.armourBaseTypeCustom);
			}
			else if(data.system.armourBaseType === "cloth"){
				updates["system.proficient"] = true; //everyone is proficient with cloth.
			}
		}

		if(data.system.armour?.type === "arms" && CONFIG.DND4EBETA.shield[data.system.armour.subType]){
			if(actorProfs.value.includes(data.system.shieldBaseType)){
				updates["system.proficient"] = actorProfs.value.includes(data.system.shieldBaseType);
				console.log("Enters")
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

		if(actorProfs.value.includes(data.system.weaponType)){
			updates["system.proficient"] = actorProfs.value.includes(data.system.weaponType);
		}
		else if(data.system.weaponBaseType === "custom"){
			updates["system.proficient"] = actorProfs.custom.split(";").includes(data.system.weaponBaseTypeCustom);
		} else {
			updates["system.proficient"] = actorProfs.value.includes(data.system.weaponBaseType);
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

			// Spells - Use Actor spellcasting modifier
			if (this.type === "spell") return actorData.attributes.spellcasting || "int";

			// Tools - default to Intelligence
			// else if (this.type === "tool") return "int";

			// Weapons
			else if (this.type === "weapon") {
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
		const requireEquipped = (this.type !== "consumable") || ["rod", "trinket", "wand"].includes(
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

	/* -------------------------------------------- */
	/*	Data Preparation														*/
	/* -------------------------------------------- */

	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	prepareData() {
		super.prepareData();
		// Get the Item's data
		const itemData = this;
		const system = itemData.system;
		const C = CONFIG.DND4EBETA;
		const labels = {};

		// Equipment Items
		if ( itemData.type === "equipment" ) {
			labels.armour = system.armour.ac ? `${system.armour.ac} ${game.i18n.localize("DND4EBETA.AC")}` : "";
			labels.fort = system.armour.fort ? `${system.armour.fort} ${game.i18n.localize("DND4EBETA.FORT")}` : "";
			labels.ref = system.armour.ref ? `${system.armour.ref} ${game.i18n.localize("DND4EBETA.REF")}` : "";
			labels.wil = system.armour.wil ? `${system.armour.wil} ${game.i18n.localize("DND4EBETA.WIL")}` : "";
		}

		// Activated Items
		if ( system.hasOwnProperty("activation") ) {
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

			labels.duration = dur.value? `${game.i18n.localize("DND4EBETA.Duration")}: ${[dur.value, C.timePeriods[dur.units]].filterJoin(" ")}` : null;

			// CastTime Label
			if (system.castTime) {
				let castTime = system.castTime || {};
				if (["inst", "perm"].includes(castTime.units)) castTime.value = null;
				labels.castTime = `${game.i18n.localize("DND4EBETA.CastTime")}: ${[castTime.value, C.timePeriods[castTime.units]].filterJoin(" ")}`;
			}


			// Attribute Label
			if(system.attribute){
				const attribute = system.attribute.split('.')[1];
				if(DND4EBETA.abilities[attribute]){
					labels.attribute = `${game.i18n.localize("DND4EBETA.Ability")}: ${DND4EBETA.abilities[attribute]}`;
				}
				else if(DND4EBETA.skills[attribute]){
					labels.attribute = `${game.i18n.localize("DND4EBETA.Skill")}: ${DND4EBETA.skills[attribute]}`;
				}
			}

			//Component type + cost Label
			if(itemData.type === "ritual"){
				if(system.consume?.amount && system.consume?.type === "attribute" ){
					const resourceTarget = system.consume.target.split('.')[1];
					let resourceLabel;

					if(DND4EBETA.ritualcomponents[resourceTarget]){
						resourceLabel = game.i18n.localize(DND4EBETA.ritualcomponents[resourceTarget]);
					}
					else if(DND4EBETA.currencyConversion[resourceTarget]){
						resourceLabel = game.i18n.localize(DND4EBETA.currencies[resourceTarget]);
					}
					else if(resourceTarget === "hp"){
						resourceLabel = game.i18n.localize("DND4EBETA.HP");
					}
					else if(resourceTarget === "surges"){
						resourceLabel = game.i18n.localize("DND4EBETA.HealingSurges");
					}

					if(resourceLabel){
						labels.component = `${game.i18n.localize("DND4EBETA.Component")}: ${resourceLabel}`;
						labels.componentCost = `${game.i18n.localize("DND4EBETA.ComponentCost")}: ${system.consume.amount}`;
					}
				}
			}

			// Recharge Label
			let chg = system.recharge || {};
			labels.recharge = `${game.i18n.localize("DND4EBETA.Recharge")} [${chg.value}${parseInt(chg.value) < 6 ? "+" : ""}]`;
		}

		// DamageTypes
		if(system.hasOwnProperty("damageType")){
			if(this.getDamageType()){
				let damType = [];
				for ( let [damage, d] of Object.entries(this.getDamageType())) {
					if(d){
						damType.push(`${game.i18n.localize(DND4EBETA.damageTypes[damage])}`);
					}
				}
				labels.damageTypes = damType.join(", ");
			}
		}

		// fix old healing consumables to migrate them to the new structure
		if (itemData.type === "consumable") {
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

		// Assign labels
		this.labels = labels;

		if(this.isOwned){
			system.preparedMaxUses = this.preparedMaxUses;
		}

		itemData.system.isOnCooldown = this.isOnCooldown();

	}

	/* -------------------------------------------- */

	getDamageType(){
		if(this.type == "power" && this.actor){
			const weapon = Helper.getWeaponUse(this.system, this.actor);
			// if(this.system.damageTypeWeapon && weapon){
			if(weapon && weapon.system.damageTypeWeapon){
				this.system.damageTypeWeapon = true;
				this.system.weaponDamageType = weapon.system.damageType;
				this.system.weaponSourceName = weapon.name;
				return weapon.system.damageType;
			} else {
				this.system.damageTypeWeapon = false;
			}
		}
		return this.system.damageType;
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
	async roll({configureDialog=true, rollMode=null, createMessage=true}={}) {

		if(["both", "pre", "sub"].includes(this.system.macro?.launchOrder)) {
			Helper.executeMacro(this)
			if (this.system.macro.launchOrder === "sub") return;
		}
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
			hasAreaTarget: this.hasAreaTarget
		};
		// For feature items, optionally show an ability usage dialog
		if (this.type === "feat") {
			let configured = await this._rollFeat(configureDialog);
			if ( configured === false ) return;
		}
		else if ( this.type === "consumable" ) {
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
			templateData.abilityCheck  = Helper.byString(this.system.attribute.replace(".mod",".label").replace(".total",".label"), this.actor.system);
		}
		const template = `systems/dnd4e/templates/chat/${templateType}-card.html`;
		let html = await renderTemplate(template, templateData);
		
		if(templateData.item.type === "power") {
			html = html.replace("ability-usage--", `ability-usage--${templateData.system.useType}`);
			
		Helper.applyEffectsToTokens(this.effects, game.user.targets, "all", this.parent);
		Helper.applyEffectsToTokens(this.effects, [this.parent.token], "self", this.parent);

		}
		else if (["weapon", "equipment", "consumable", "backpack", "tool", "loot"].includes(templateData.item.type)) {
			html = html.replace("ability-usage--", `ability-usage--item`);
		} else {
			html = html.replace("ability-usage--", `ability-usage--other`);
		}

		// Basic chat message data
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			content: html,
			speaker: {
				actor: this.actor.id,
				token: this.actor.token,
				alias: this.actor.name
			},
			flags: {}
		};

	    // If the Item was destroyed in the process of displaying its card - embed the item data in the chat message
		if ( (this.type === "consumable") && !this.actor.items.has(this.id) ) {
			chatData.flags["dnd4e.itemData"] = templateData.item;
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
				Helper.executeMacro(this)
			}
		}
		else return chatData;
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
		if ( !consume.type ) return true;
		const actor = this.actor;
		const typeLabel = CONFIG.DND4EBETA.abilityConsumptionTypes[consume.type];
		const amount =  parseInt(consume.amount) || parseInt(consume.amount) === 0 ? parseInt(consume.amount) : 1;

		// Only handle certain types for certain actions
		if ( ((consume.type === "ammo") && !isAttack ) || ((consume.type !== "ammo") && !isCard) ) return true;

		// No consumed target set
		if ( !consume.target ) {
			ui.notifications.warn(game.i18n.format("DND4EBETA.ConsumeWarningNoResource", {name: this.name, type: typeLabel}));
			return false;
		}

		// Identify the consumed resource and it's quantity
		let consumed = null;
		let quantity = 0;
		switch ( consume.type ) {
			case "attribute":
				consumed = getProperty(actor.system, consume.target);
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
			ui.notifications.warn(game.i18n.format("DND4EBETA.ConsumeWarningNoSource", {name: this.name, type: typeLabel}));
			return false;
		}
		let remaining = quantity - amount;
		if ( remaining < 0) {
			ui.notifications.warn(game.i18n.format("DND4EBETA.ConsumeWarningNoQuantity", {name: this.name, type: typeLabel}));
			return false;
		}

		// Update the consumed resource
		switch ( consume.type ) {
			case "attribute":
				await this.actor.update({[`system.${consume.target}`]: remaining});
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
	async _rollFeat(configureDialog) {
		if ( this.type !== "feat" ) throw new Error("Wrong Item type");

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
		const current = getProperty(this, "system.uses.value") || 0;
		if ( consume && charge.value ) {
			if ( !charge.charged ) {
				ui.notifications.warn(game.i18n.format("DND4EBETA.ItemNoUses", {name: this.name}));
				return false;
			}
			else await this.update({"system.recharge.charged": false});
		}
		else if ( consume && usesCharges ) {
			if ( uses.value <= 0 ) {
				ui.notifications.warn(game.i18n.format("DND4EBETA.ItemNoUses", {name: this.name}));
				return false;
			}
			await this.update({"system.uses.value": Math.max(current - 1, 0)});
		}

		// Maybe initiate template placement workflow
		if ( this.hasAreaTarget && placeTemplate ) {
			const template = AbilityTemplate.fromItem(this);
			if ( template ) template.drawPreview(event);
			if ( this.owner && this.owner.sheet ) this.owner.sheet.minimize();
		}
		return true;
	}

	/* -------------------------------------------- */
	/*  Chat Cards																	*/
	/* -------------------------------------------- */

	/**
	 * Prepare an object of chat data used to display a card for the Item in the chat log
	 * @param {Object} htmlOptions    Options used by the TextEditor.enrichHTML function
	 * @return {Object}               An object of chat data to render
	 */
	async getChatData(htmlOptions={}) {
		const data = duplicate(this.system);
		const labels = this.labels;

		// if(data.chatFlavor) {
		// 	data.description.value = data.chatFlavor;
		// }
			
		const description = data.description;
		const weaponUse = Helper.getWeaponUse(data, this.actor);
		const descriptionText = description.value ? Helper.commonReplace(description.value, this.actor, this.system, weaponUse?.system) : "";

		// Rich text description
		htmlOptions.async = true; //TextEditor.enrichHTML is becoming asynchronous. In the short term you may pass async=true or async=false as an option to nominate your preferred behavior.
		data.description.value = await TextEditor.enrichHTML(descriptionText || ``, htmlOptions);

		// Item type specific properties
		const props = [];
		const fn = this[`_${this.type}ChatData`];
		if ( fn ) fn.bind(this)(data, labels, props);

		// General equipment properties
		if ( data.hasOwnProperty("equipped") && !["loot", "tool"].includes(this.type) ) {
			props.push(
				game.i18n.localize(data.equipped ? "DND4EBETA.Equipped" : "DND4EBETA.Unequipped"),
				game.i18n.localize(data.proficient ? "DND4EBETA.Proficient" : "DND4EBETA.NotProficient"),
				game.i18n.localize(data.proficientI ? "DND4EBETA.ProficientI" : ""),
			);
		}

		// Ability activation properties
		if ( data.hasOwnProperty("activation") ) {
			props.push(
				labels.activation + (data.activation?.condition ? ` (${data.activation.condition})` : ""),
				labels.attribute,
				labels.target,
				data.isRanged && labels.range ? `${game.i18n.localize("DND4EBETA.Range")}: ${labels.range}` : "",
				labels.castTime,
				labels.duration,
				labels.component,
				labels.componentCost,
				labels.damageTypes,
				labels.effectType,
			);
		}
		


		// Filter properties and return
		data.properties = props.filter(p => !!p);
		return data;
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for equipment type items
	 * @private
	 */
	_equipmentChatData(data, labels, props) {
		props.push(
			CONFIG.DND4EBETA.equipmentTypes[data.armour.type],
			labels.armour || null,
			labels.fort || null,
			labels.ref || null,
			labels.wil || null,
			data.stealth.value ? game.i18n.localize("DND4EBETA.StealthDisadvantage") : null
		);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for weapon type items
	 * @private
	 */
	_weaponChatData(data, labels, props) {
		props.push(
			CONFIG.DND4EBETA.weaponTypes[data.weaponType],
		);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for consumable type items
	 * @private
	 */
	_consumableChatData(data, labels, props) {
		props.push(
			CONFIG.DND4EBETA.consumableTypes[data.consumableType],
			data.uses.value + "/" + data.preparedMaxUses + " " + game.i18n.localize("DND4EBETA.Charges")
		);
		data.hasCharges = data.uses.value >= 0;
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for tool type items
	 * @private
	 */
	_toolChatData(data, labels, props) {
		props.push(
			CONFIG.DND4EBETA.abilities[data.ability] || null,
			CONFIG.DND4EBETA.skills[data.ability] || null
			// CONFIG.DND4EBETA.proficiencyLevels[data.proficient || 0]
		);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for tool type items
	 * @private
	 */
	_lootChatData(data, labels, props) {
		props.push(
			game.i18n.localize("DND4EBETA.ItemTypeLoot"),
			data.weight ? data.weight + " " + game.i18n.localize("DND4EBETA.AbbreviationLbs") : null
		);
	}

	/* -------------------------------------------- */

	/**
	 * Render a chat card for Spell type data
	 * @return {Object}
	 * @private
	 */
	_spellChatData(data, labels, props) {
		props.push(
			labels.level,
			labels.components + (labels.materials ? ` (${labels.materials})` : "")
		);
	}

	/* -------------------------------------------- */

	/**
	 * Prepare chat card data for items of the "Feat" type
	 * @private
	 */
	_featChatData(data, labels, props) {
		props.push(data.requirements);
	}

	/* -------------------------------------------- */
	/*  Item Rolls - Attack, Damage, Saves, Checks  */
	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
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
		const weaponUse = Helper.getWeaponUse(itemData, this.actor);

		if(Helper.lacksRequiredWeaponEquipped(itemData, weaponUse)) {
			ui.notifications.error(game.i18n.localize("DND4EBETA.LackRequiredWeapon"));
			return null;
		}

		if(!this.hasAttack ) {
			ui.notifications.error("You may not place an Attack Roll with this Item.");
			return null;
		}
		let title = `${this.name} - ${game.i18n.localize("DND4EBETA.AttackRoll")}`;
		let flavor = title;

		if(itemData.attack.def) {
			flavor += ` ${game.i18n.localize("DND4EBETA.VS")} <b>${itemData.attack.def.toUpperCase() }</b>`;
		}

		if(game.user.targets.size) {
			options.attackedDef = itemData.attack.def; 
		}
		
		const rollData = this.getRollData();

		rollData.isAttackRoll = true;
		rollData.commonAttackBonuses = CONFIG.DND4EBETA.commonAttackBonuses;
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
			messageData: {"flags.dnd4eBeta.roll": {type: "attack", itemId: this.id }},
			options
		};

		if(this.type === "power"){
			rollConfig.options.powerEffects = this.effects;
			rollConfig.options.parent = this.parent;
		}

		// Expanded weapon critical threshold
		if (weaponUse) {
			rollConfig.critical = itemData.weaponType === "implement" ? weaponUse.system.critRangeImp : weaponUse.system.critRange;
			rollConfig.flavor += ` using ${weaponUse.name}`;
			rollConfig.title += ` using ${weaponUse.name}`;
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

	/* -------------------------------------------- */

	/**
	 * Place a damage roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the damageRoll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollDamage({event, spellLevel=null, versatile=false, fastForward=undefined}={}) {
		const itemData = this.system;
		const actorData = this.actor;
		const actorInnerData = this.actor.system;
		const weaponUse = Helper.getWeaponUse(itemData, this.actor);

		if(Helper.lacksRequiredWeaponEquipped(itemData, weaponUse)) {
			ui.notifications.error(game.i18n.localize("DND4EBETA.LackRequiredWeapon"));
			return null;
		}

		if ( !this.hasDamage ) {
			ui.notifications.error("You may not make a Damage Roll with this Item.");
			return null;
		}
		const messageData = {"flags.dnd4eBeta.roll": {type: "damage", itemId: this.id }};

		// Get roll data
		const rollData = this.getRollData();
		if ( spellLevel ) rollData.item.level = spellLevel;

		// Get message labels
		let title = `${this.name} - ${game.i18n.localize("DND4EBETA.DamageRoll")}`;
		let flavor = this.labels.damageTypes?.length ? `${title} (${this.labels.damageTypes})` : title;

		// Define Roll  and add seconadry parts
		const returnDamageRollAndOptionalType = (damageRoll, damageType) => {
			if (damageType && damageType !== game.i18n.localize(game.dnd4eBeta.config.damageTypes.damage) && damageType !== game.i18n.localize("DND4EBETA.None")) {
				return `(${damageRoll})[${damageType}]`
			}
			else {
				return damageRoll
			}

		}
		const options = { formulaInnerData: {} }
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
			missDamageFormula =formulaHelper(itemData.miss.formula)
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
	
		// Define Roll Data
		const actorBonus = getProperty(actorInnerData, `bonuses.${itemData.actionType}`) || {};
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


		// Originally these were a separate part, but then they were not part of the primary damage type
		// which they should be.  So now appending them to the main expression.
		const effectDamageParts = []
		await Helper.applyEffects([effectDamageParts], rollData, actorData, this, weaponUse, "damage")
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

		// Ammunition Damage from power
		if ( this._ammo ) {
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
		//Add powers text to message.
		// if(itemData.hit?.detail) flavor += '<br>Hit: ' + itemData.hit.detail
		// if(itemData.miss?.detail) flavor += '<br>Miss: ' + itemData.miss.detail
		// if(itemData.effect?.detail) flavor += '<br>Effect: ' + itemData.effect.detail;
		// Call the roll helper utility
		
		if(missDamageFormula.includes('@damageFormula')){
			missDamageFormula = missDamageFormula.replace('@damageFormula', Helper.bracketed(damageFormula));
		}

		if(missDamageFormula.includes('@halfDamageFormula')){
			missDamageFormula = missDamageFormula.replace('@halfDamageFormula', Helper.bracketed(`${damageFormula}/2`));
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
			fastForward
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
			ui.notifications.error(game.i18n.localize("DND4EBETA.LackRequiredWeapon"));
			return null;
		}

		if ( !this.hasHealing ) {
			ui.notifications.error("You may not make a Healing Roll with this Item.");
			return null;
		}
		const messageData = {"flags.dnd4eBeta.roll": {type: "healing", itemId: this.id }};

		// Get roll data
		const rollData = this.getRollData();
		if ( spellLevel ) rollData.item.level = spellLevel;

		// Get message labels
		const title = `${this.name} - ${game.i18n.localize("DND4EBETA.HealingRoll")}`;
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
				messageData["flags.dnd4eBeta.roll"].versatile = true;
				partsExpressionReplacement.push({target: "1", value: "@versatile"})
			}
		}
		// if ( versatile && itemData.damage.versatile ) {
			// parts[0] = itemData.damage.versatile;
			// messageData["flags.dnd4eBeta.roll"].versatile = true;
		// }
	
		// Define Roll Data
		const actorBonus = getProperty(actorInnerData, `bonuses.${itemData.actionType}`) || {};
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
		const title = `${this.name} - ${game.i18n.localize("DND4EBETA.OtherFormula")}`;

		// Invoke the roll and submit it to chat
		const roll = await new Roll(rollData.item.formula, rollData).roll({async : true});
		roll.toMessage({ 
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			flavor: this.system.chatFlavor || title,
			rollMode: game.settings.get("core", "rollMode"),
			messageData: {"flags.dnd4eBeta.roll": {type: "other", itemId: this.id }}
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
				if ( remaining ) {
					await this.update({"system.uses.value": remaining});
				}
				// Case 2, reduce quantity
				else if ( q > 1 ) {
					await this.update({"system.quantity": q - 1, "system.uses.value": this.preparedMaxUses || 0});
				}
				// Case 3, destroy the item
				else if ( (q <= 1) && autoDestroy ) {
					await this.actor.deleteEmbeddedDocuments("Item", [this.id]);
				}
				// Case 4, reduce item to 0 quantity and 0 charges
				else if ( (q === 1) ) {
					await this.update({"system.quantity": q - 1, "system.uses.value": 0});
				}
				// Case 5, item unusable, display warning and do nothing
				else {
					ui.notifications.warn(game.i18n.format("DND4EBETA.ItemNoUses", {name: this.name}));
				}
			}
		}

		// Maybe initiate template placement workflow
		if ( this.hasAreaTarget && placeTemplate ) {
			const template = AbilityTemplate.fromItem(this);
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
		const roll = await new Roll("1d6").roll({async: true});
		const success = roll.total >= parseInt(data.recharge.value);

		// Display a Chat Message
		const promises = [roll.toMessage({
			flavor: `${game.i18n.format("DND4EBETA.ItemRechargeCheck", {name: this.name})} - ${game.i18n.localize(success ? "DND4EBETA.ItemRechargeSuccess" : "DND4EBETA.ItemRechargeFailure")}`,
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
		return this.rollToolOrRitualCheck("tool", "DND4EBETA.ToolCheck", options)
	}

	/**
	 * Roll a Ritual Check. Rely upon the d20Roll logic for the core implementation
	 * @prarm {Object} options   Roll configuration options provided to the d20Roll function
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	rollRitualCheck(options={}) {
		return this.rollToolOrRitualCheck("ritual", "DND4EBETA.RitualCheck", options)
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

		const flavor = this.system.chatFlavor ?  `${this.system.chatFlavor} (${label} check)` : `${this.name} - ${game.i18n.localize(titleKey)}  (${label} check)`;
		// Compose the roll data
		const rollConfig = mergeObject({
			parts: parts,
			data: rollData,
			title: title,
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			flavor: flavor,
			dialogOptions: {
				width: 400,
				top: options.event ? options.event.clientY - 80 : null,
				left: window.innerWidth - 710,
			},
			messageData: {"flags.dnd4eBeta.roll": {type: rollType, itemId: this.id }}
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
	getRollData() {
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = duplicate(this.system);
		rollData.item.name = this.name;
		rollData.item.flags = duplicate(this.flags);

		// Include an ability score modifier if one exists
		const abl = this.abilityMod;
		if ( abl ) {
			const ability = rollData.abilities[abl];
			rollData["mod"] = ability.mod || 0;
		}

		// Include a proficiency score
		// const prof = "proficient" in rollData.item ? (rollData.item.proficient || 0) : 1;
		// rollData["prof"] = Math.floor(prof * rollData.attributes.prof);
		
		return rollData;
	}

	/* -------------------------------------------- */
	/*  Chat Message Helpers                        */
	/* -------------------------------------------- */

	static chatListeners(html) {
		html.on('click', '.card-buttons button', this._onChatCardAction.bind(this));
		html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
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
		const button = event.currentTarget;
		button.disabled = true;
		const card = button.closest(".chat-card");
		const messageId = card.closest(".message").dataset.messageId;
		const message =  game.messages.get(messageId);
		const action = button.dataset.action;

		// Validate permission to proceed with the roll
		const isTargetted = action === "save";
		if ( !( isTargetted || game.user.isGM || message.isAuthor ) ) return;

		// Get the Actor from a synthetic Token
		const actor = this._getChatCardActor(card);
		if ( !actor ) return;

		// Get the Item
		const storedData = message.getFlag("dnd4e", "itemData");
		const item = storedData ? new this(storedData, {parent: actor}) : actor.items.get(card.dataset.itemId) || storedData;

		if ( !item ) {
			return ui.notifications.error(game.i18n.format("DND4EBETA.ActionWarningNoItem", {item: card.dataset.itemId, name: actor.name}))
		}
		const spellLevel = parseInt(card.dataset.spellLevel) || null;

		// Get card targets
		let targets = [];
		if ( isTargetted ) {
			targets = this._getChatCardTargets(card);
			if ( !targets.length ) {
				ui.notifications.warn(game.i18n.localize("DND4EBETA.ActionWarningNoToken"));
				return button.disabled = false;
			}
		}

		// Attack and Damage Rolls
		console.log(action)
		if ( action === "attack" ) await item.rollAttack({event});
		else if ( action === "damage" ) await item.rollDamage({event, spellLevel});
		else if ( action === "healing" ) await item.rollHealing({event, spellLevel});
		else if ( action === "versatile" ) await item.rollDamage({event, spellLevel, versatile: true});
		else if ( action === "formula" ) await item.rollFormula({event, spellLevel});

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
			// const template = game.dnd4eBeta.canvas.AbilityTemplate.fromItem(item);
			const template = AbilityTemplate.fromItem(item);
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
		const header = event.currentTarget;
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
			const token = new Token(tokenData);
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


	isOnCooldown(){
		if(this.type !== "power") return false;
		if(this.system.uses.value || (!this.system.uses.value && !this.system.uses.max)) return false;
		if(this.system.type !== "recharge") return false;

		return true;
	}
}
