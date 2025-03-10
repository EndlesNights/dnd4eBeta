// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import {Helper} from "../helper.js";

/**
 * Override and extend the core ItemSheet implementation to handle specific item types
 * @extends {ItemSheet}
 */
export default class ItemSheet4e extends ItemSheet {
	constructor(...args) {
		super(...args);
		// Expand the default size of the class sheet
		if ( this.object.type === "class" ) {
			this.options.resizable = true;
			this.options.width =  600;
			this.options.height = 680;
		}
	}

	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 585,
			height: 420,
			classes: ["dnd4e", "sheet", "item"],
			resizable: true,
			scrollY: [
				".tab.details"
			],
			tabs: [{
				navSelector: ".tabs",
				contentSelector: ".sheet-body",
				initial: "description"
			}],
			dragDrop: [
				{dragSelector: "[data-effect-id]", dropSelector: ".effects-list"},
			]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get template() {
		const path = "systems/dnd4e/templates/items/";
		return `${path}/${this.item.type}.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData(options) {
		const data = await super.getData(options);
		const itemData = data.data;

		data.labels = this.item.labels;
		data.config = CONFIG.DND4E;

		// Item Type, Status, and Details
		// data.user = game.user; //This is causing a huge error!
		data.userInfo = game.user;

		data.itemType = itemData.type.titleCase();
		data.itemStatus = this._getItemStatus(itemData);
		data.itemProperties = this._getItemProperties(itemData);
		data.isPhysical = itemData.system.hasOwnProperty("quantity");

		// Potential consumption targets
		data.abilityConsumptionTargets = this._getItemConsumptionTargets(itemData);
	
		if(itemData.type === "power"){
			data.powerWeaponUseTargets = this._getItemsWeaponUseTargets(itemData);
			data.effectsPowers = this._prepareEffectPowersCategories(this.item.effects);
		}

		if(itemData.type === "consumable"){
			data.effectsPowers = this._prepareEffectPowersCategories(this.item.effects);
		}

		if(itemData.type === "equipment"){
			data.equipmentSubTypeTargets = this._getItemEquipmentSubTypeTargets(itemData, data.config);

			if(itemData.system.armour.type === "armour"){
				data.isArmour = true;
				data.hasEnhance = true;
				data.hasBaseProps = true;
				data.armourBaseTypes = CONFIG.DND4E[itemData.system.armour.subType] || {"": game.i18n.localize("DND4E.None")};
				data.isArmourBaseTypeCustom = (itemData.system.armourBaseType === "custom");
			}
			else if(itemData.system.armour.type === "arms" && CONFIG.DND4E.profArmor[itemData.system.armour.subType]){
				data.isShield = true;
				data.hasBaseProps = true;
				data.shieldBaseTypes = CONFIG.DND4E.shield;
				data.isShieldBaseTypeCustom = (itemData.system.shieldBaseType === "custom");
			}
			else if(itemData.system.armour.type === "neck"){
				data.hasEnhance = true;
			}
		}

		if(itemData.system?.useType) {
			if(!(itemData.system.rangeType === "personal" || itemData.system.rangeType === "closeBurst" || itemData.system.rangeType === "closeBlast" || itemData.system.rangeType === "")){
				itemData.system.isRange = true;
			}

			if(itemData.system.rangeType === "closeBurst" || itemData.system.rangeType === "closeBlast" || itemData.system.rangeType === "rangeBurst" || itemData.system.rangeType === "rangeBlast" || itemData.system.rangeType === "wall" ) { 
				itemData.system.isArea = true;
			}
			itemData.system.isRecharge = itemData.system.useType === "recharge";
		}


		// Weapon Properties
		if(itemData.type === "weapon"){
			data.weaponMetaProperties = {};
			for (let attrib in data.config.weaponProperties) {
				data.weaponMetaProperties[attrib] = {
						propName: data.config.weaponProperties[attrib], 
						checked: itemData.system.properties[attrib],
						disabled: (attrib === "imp" && itemData.system.weaponType === "implement")
				}
			}

			data.weaponBaseTypes = CONFIG.DND4E[itemData.system.weaponType];
			data.isWeaponBaseTypeCustom = (itemData.system.weaponBaseType === "custom");
		}

		// Action Details
		data.hasAttackRoll = this.item.hasAttack;
		data.isHealing = itemData.system.actionType === "heal";
		data.isFlatDC = foundry.utils.getProperty(itemData.system, "save.scaling") === "flat";

		// Vehicles
		data.isCrewed = itemData.system.activation?.type === 'crew';
		data.isMountable = this._isItemMountable(itemData);
	
		// Prepare Active Effects
		data.effects = ActiveEffect4e.prepareActiveEffectCategories(this.item.effects);

		// Re-define the template data references (backwards compatible)
		data.item = itemData;
		data.system = itemData.system;

		const description = data.system.description;
		const weaponUse = this.actor ? Helper.getWeaponUse(itemData.system, this.actor) : null;
		const itemActor = this.item.actor || null;
		const descriptionText = description.value ? Helper.commonReplace(description.value, itemActor, itemData.system, weaponUse?.system) : "";
		data.descriptionHTML = await TextEditor.enrichHTML(descriptionText || description, {
			secrets: data.item.isOwner,
			async: true,
			relativeTo: this.item
		});

		const descriptionGM = data.system.description.gm || "";
		const descriptionTextGM = data.system.description.gm ? Helper.commonReplace(descriptionGM, itemActor, itemData.system, weaponUse?.system) : "";

		data.descriptionHTMLGM = await TextEditor.enrichHTML(descriptionTextGM || descriptionGM, {
			secrets: data.item.isOwner,
			async: true,
			relativeTo: this.item,
			// icon: "fa-regular fa-note-medical"
		});

		if(data.system.description.gm){
			data.system.description.gmNotes = true;
		}

		data.effectDetailHTML = await TextEditor.enrichHTML(data.system.effect?.detail, {
			secrets: data.item.isOwner,
			async: true,
			relativeTo: this.item
		});

		data.autoanimationsActive = game.modules.get("autoanimations")?.active;

		return data;
	}

	_getHeaderButtons(){
		let buttons = super._getHeaderButtons();
	
		// Share Entry
		if (game.user.isGM) {
			buttons.unshift({
				label: "Show Players",
				class: "share-image",
				icon: "fas fa-eye",
				onclick: () => this.shareItem()
			});
		}
	
		// Export JSON
		buttons.unshift({
			label: "Expor JSON",
			class: "export-json",
			icon: "fas fa-atlas",
			onclick: () => this.exportItem()
		});

		return buttons;
	}

	/**
	 * Prepare the data structure for Power Effects which can then be transfered as active effectst to other actors.
	 * @param {PowerEffect[]} powerEffects    The array of Active Effect instances to prepare sheet data for
	 * @returns {object}                  Data for rendering
	 */
	_prepareEffectPowersCategories(effectPowers){
		const categories = {};
		for (const [key, value] of Object.entries(CONFIG.DND4E.powerEffectTypes)) {
			categories[key] = {
			type:key,
			label: game.i18n.localize(value),
			effects: []
		  }
		}

		if(effectPowers){
			for ( let e of effectPowers ) {
				e.durationTypeLable = `${CONFIG.DND4E.durationType[e.flags.dnd4e.effectData.durationType]}`;
				if(e.flags.dnd4e?.effectData?.powerEffectTypes === "hit") categories.hit.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "miss") categories.miss.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "hitOrMiss") categories.hitOrMiss.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "self") categories.self.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "selfHit") categories.selfHit.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "selfMiss") categories.selfMiss.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "selfAfterAttack") categories.selfAfterAttack.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "allies") categories.allies.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "enemies") categories.enemies.effects.push(e);
				else if(e.flags.dnd4e?.effectData?.powerEffectTypes === "all") categories.all.effects.push(e);
				else categories.misc.effects.push(e);
			}
		}
		return categories;
	}

	async _onPowerEffectControl(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const li = a.closest("li");
		const effect = li.dataset.effectId ? this.item.effects.get(li.dataset.effectId) : null;
		switch(a.dataset.action){
			case "create":
				console.log(this)
				this.item.createEmbeddedDocuments("ActiveEffect", [{
					label: game.i18n.localize("DND4E.EffectNew"),
					icon: this.item.img || "icons/svg/aura.svg",
					origin: this.item.uuid,
					"flags.dnd4e.effectData.powerEffectTypes": li.dataset.effectType,
					"duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
					disabled: li.dataset.effectType === "inactive"
				}]);
				return;
			case "edit":
				return effect.sheet.render(true);
			case "delete":
				return effect.delete();
		}

	}

	async shareItem() {
		let changeBack = false
		//set the default permsion to be vieable for all players if it it not already higher
		if(this.item.ownership.default <= 0){
			await this.item.update({"ownership.default": 1});
			changeBack = !game.keyboard.downKeys.has(game.keybindings.bindings.get(`dnd4e.permShowPlayer`)[0].key);
		}

		game.socket.emit("system.dnd4e", {
			itemId: this.item.id
		});

		if(changeBack){
			this.item.update({"ownership.default": 0});
		}
	}

	static _handleShareItem({itemId}={}) {
		let item = game.items.get(itemId);

		if (item == undefined) {
			let characters = game.actors.filter(x => x.type == "Player Character");

			for (var x = 0; x <= characters.length; x++) {
				let actor = characters[x];
				if(!actor) continue;

				if(actor.items.get(itemId)){
					item = actor.items.get(itemId);
					break;
				}
			}
		}

		if(!item){
			return;
		}

		let itemSheet = new ItemSheet4e(item, {
			title: item.title,
			uuid: item.uuid,
			shareable: false,
			editable: false
		});

		return itemSheet.render(true);
	  }

	exportItem() {
		const jsonString = JSON.stringify(this.object._source);

		try {
			navigator.clipboard.writeText(jsonString)
			ui.notifications.info("JSON data copied to clipboard");
		} catch (er) {
			let d = new Dialog({
				title: `JSON Output`,
				content: `<textarea readonly type="text" id="debugmacro">${jsonString}</textarea>`,
				buttons: {
				  copy: {
					label: `Copy to clipboard`,
					callback: () => {
					  $("#debugmacro").select();
					  document.execCommand('copy');
					}
				  },
				  close: {
					icon: "<i class='fas fa-tick'></i>",
					label: `Close`
				  },
				},
				default: "close",
				close: () => {}
			  });
			  
			  d.render(true);
		}
	}

	_getItemEquipmentSubTypeTargets(item, config) {

		if(item.system.armour.type == "armour") { return config.equipmentTypesArmour; }
		else if (item.system.armour.type == "arms") { return config.equipmentTypesArms; }
		else if (item.system.armour.type == "feet") { return config.equipmentTypesFeet; }
		else if (item.system.armour.type == "hands") { return config.equipmentTypesHands; }
		else if (item.system.armour.type == "head") { return config.equipmentTypesHead; }
		else if (item.system.armour.type == "neck") { return config.equipmentTypesNeck; }
		else if (item.system.armour.type == "ring") { return null; }
		else if (item.system.armour.type == "waist") { return config.equipmentTypesWaist; }
		else if (item.system.armour.type == "natural") { return null; }
		else if (item.system.armour.type == "other") { return null; }
		
		return null;
	}
	/* -------------------------------------------- */

	/**
	 * Get the valid item consumption targets which exist on the actor
	 * @param {Object} item         Item data for the item being displayed
	 * @return {{string: string}}   An object of potential consumption targets
	 * @private
	 */
	_getItemConsumptionTargets(item) {
		const consume = item.system.consume || {};
		if (!consume.type) return [];

		const actor = this.item.actor;

		// Attributes (and Resources)
		// this can work separate to an actor as the actors model is known at compile time
		// if separate from an actor it will default to the PC model, as unlikely to be set with an NPC
		if (consume.type === "attribute" || consume.type === "resource") {
			if (actor) {
				const attributes = TokenDocument.getTrackedAttributes(actor.system)
				attributes.bar.forEach(a => a.push("value"));
				
				if(consume.type === "resource"){
					return {"": game.i18n.localize("DND4E.None"), ...attributes.bar.concat(attributes.value).reduce((obj, a) => {
						console.debug(a);
						let k = a.join(".");
						if(k.startsWith("resources") && k.endsWith("value")){
							obj[k] = a[1];
						}
						return obj;
					}, {})};
				}
				
				return {"": game.i18n.localize("DND4E.None"), ...attributes.bar.concat(attributes.value).reduce((obj, a) => {
					let k = a.join(".");
					obj[k] = k;
					return obj;
				}, {})};
			}
			else {
				const attributes = game.model.Actor['Player Character']
				
				if(consume.type === "resource"){
					const resourceKeys = Object.keys(foundry.utils.flattenObject(attributes.resources)).reduce((obj, a) => {
						//console.debug(obj);
						if(a.endsWith("value")) obj[`system.resources.${a}`] = a.replace(".value","");
						return obj;
					}, {});
					console.debug(resourceKeys);
					return {"": game.i18n.localize("DND4E.None"), ...resourceKeys};
				}
				
				const attributeKeys = Object.keys(foundry.utils.flattenObject(attributes)).reduce((obj, a) => {
					obj[a] = a;
					return obj;
				}, {});
				
				return {"": game.i18n.localize("DND4E.None"), ...attributeKeys};
			}
		}

		// All the rest of them require the actor, because they are very tied to that individual actors stuff
		if (!actor) return {};

		// Ammunition
		else if (consume.type === "ammo") {
			return {"": game.i18n.localize("DND4E.None"), ...actor.itemTypes.consumable.reduce((ammo, i) => {
				if (i.system.consumableType === "ammo") {
					ammo[i.id] = `${i.name} (${i.system.quantity})`;
				}
				return ammo;
			}, {})};
		}

		// Materials
		else if (consume.type === "material") {
			return {"": game.i18n.localize("DND4E.None"), ...actor.items.reduce((obj, i) => {
				if (["consumable", "loot"].includes(i.system.type)) {
					obj[i.id] = `${i.name} (${i.system.quantity})`;
				}
				return obj;
			}, {})};
		}

		// Charges
		else if (consume.type === "charges") {
			return {"": game.i18n.localize("DND4E.None"), ...actor.items.reduce((obj, i) => {
				const uses = i.system.uses || {};
				if (uses.per && uses.max) {
					const label = uses.per === "charges" ?
						` (${game.i18n.format("DND4E.AbilityUseChargesLabel", {value: uses.value})})` :
						` (${game.i18n.format("DND4E.AbilityUseConsumableLabel", {max: uses.max, per: uses.per})})`;
					obj[i.id] = i.name + label;
				}
				return obj;
			}, {})};
		}
		else return {};
	}
	
		/* -------------------------------------------- */
	
	/**
	* Get the valid weapons targets which exist on the actor
	* @param {Object} weapon         weapon data for the weapon items being displayed
	* @return {{string: string}}   An object of potential consumption targets
	* @private
	*/
	_getItemsWeaponUseTargets(weapon) {
		
		const weaponType = weapon.system.weaponType || {};
		if ( !weaponType ) return [];
		const actor = this.item.actor;
		if ( !actor ) return {};
		
		if (weaponType === "any") {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				obj[i.id] = `${i.name}`;
				return obj;
			}, {});		
		}

		let setMelee = ["melee", "simpleM", "militaryM", "superiorM", "improvM", "naturalM", "siegeM"];
		let setRanged = ["ranged", "simpleR", "militaryR", "superiorR", "improvR", "naturalR", "siegeR"];
		
		if ( weaponType === "melee" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (setMelee.includes(i.system.weaponType) ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});
		}
		
		if ( weaponType === "ranged" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (setRanged.includes(i.system.weaponType) ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});
		}

		if ( weaponType === "meleeRanged" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (setMelee.includes(i.system.weaponType) || setRanged.includes(i.system.weaponType) ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});
		}
		
		if ( weaponType === "implement" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (i.system.properties.imp ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});			
		}
						
		return {};
	}

	/* -------------------------------------------- */

	/**
	 * Get the text item status which is shown beneath the Item type in the top-right corner of the sheet
	 * @return {string}
	 * @private
	 */
	_getItemStatus(item) {
		if ( item.type === "spell" ) {
			return CONFIG.DND4E.spellPreparationModes[item.system.preparation];
		}
		else if ( ["weapon", "equipment"].includes(item.type) ) {
			return game.i18n.localize(item.system.equipped ? "DND4E.Equipped" : "DND4E.Unequipped");
		}
		else if ( item.type === "tool" ) {
			return game.i18n.localize(item.system.proficient ? "DND4E.Proficient" : "DND4E.NotProficient");
		}
	}

	/* -------------------------------------------- */

	/**
	 * Get the Array of item properties which are used in the small sidebar of the description tab
	 * @return {Array}
	 * @private
	 */
	_getItemProperties(item) {
		const props = [];
		const labels = this.item.labels;
		if ( item.type === "weapon" ) {

			props.push(CONFIG.DND4E.weaponTypes[item.system.weaponType])

			props.push(...Object.entries(item.system.properties)
				.filter(e => e[1] === true)
				.map(e => {
					if(e[0] === "bru") return `${CONFIG.DND4E.weaponProperties[e[0]]} ${item.system.brutalNum}`;
					return CONFIG.DND4E.weaponProperties[e[0]]
				})
			);
			props.push(...Object.entries(item.system.damageType)
				.filter(e => e[1] === true)
				.map(e => CONFIG.DND4E.damageTypes[e[0]])
			);

			props.push(...Object.entries(item.system.weaponGroup)
				.filter(e => e[1] === true)
				.map(e => CONFIG.DND4E.weaponGroup[e[0]])
			);

			if(item.system.isRanged)
				props.push(`${game.i18n.localize("DND4E.Range")}: ${item.system.range.value} / ${item.system.range.long}`);
		}

		else if ( item.type === "power" || ["power","atwill","encounter","daily","utility","item"].includes(item.system.type)) {
			props.push(
				labels.components,
				labels.materials,
				// item.system.components.concentration ? game.i18n.localize("DND4E.Concentration") : null,
				// item.system.components.ritual ? game.i18n.localize("DND4E.Ritual") : null
			)
		}

		else if ( item.type === "equipment" ) {
			props.push(CONFIG.DND4E.equipmentTypes[item.system.armour.type]);
			props.push(labels.armour);
			props.push(labels.fort);
			props.push(labels.ref);
			props.push(labels.wil);
			
			if (item.system?.armour?.enhance){
				let enhString = `${game.i18n.localize("DND4E.Enhancement")}\n +${item.system.armour.enhance}`;
				//The strings below begin with a non-breaking space character. Don't delete it unless you want to break the text wrapping!
				if(item.system.armour.type === "armour"){
					enhString += ` ${game.i18n.localize("DND4E.DefAC")}`;
				} else {
					enhString += ` ${game.i18n.localize("DND4E.DefFort")}/${game.i18n.localize("DND4E.DefRef")}/${game.i18n.localize("DND4E.DefWil")}`;
				}
				props.push(enhString);
			}
		}

		else if ( item.type === "feat" ) {
			props.push(labels.featType);
		}

		// Action type
		if ( item.system.actionType ) {
			props.push(CONFIG.DND4E.itemActionTypes[item.system.actionType]);
		}

		// Action usage
		if ( (item.type !== "weapon") && item.system.activation && !foundry.utils.isEmpty(item.system.activation) ) {
			props.push(
				labels.attribute,
				labels.activation,
				labels.range,
				labels.target,
				labels.castTime,
				labels.duration,
				labels.component,
				labels.componentCost
			)
		}
		return props.filter(p => !!p);
	}

	/* -------------------------------------------- */

	/**
	 * Is this item a separate large object like a siege engine or vehicle
	 * component that is usually mounted on fixtures rather than equipped, and
	 * has its own AC and HP.
	 * @param item
	 * @returns {boolean}
	 * @private
	 */
	_isItemMountable(item) {
		const system = item.system;
		return (item.type === 'weapon' && system.weaponType === 'siege')
			|| (item.type === 'equipment' && system.armour.type === 'vehicle');
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onChangeTab(event, tabs, active) {
		this.setPosition({ height: "auto" });
	}

	/* -------------------------------------------- */
	/*  Form Submission                             */
	/* -------------------------------------------- */

	/** @override */
	_updateObject(event, formData) {

		// TODO: This can be removed once 0.7.x is release channel
		if ( !formData.system ) formData = foundry.utils.expandObject(formData);

		// Handle Damage Array
		const damage = formData.system?.damage;
		if ( damage ) damage.parts = Object.values(damage?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
		const damageCrit = formData.system?.damageCrit;
		if ( damageCrit ) damageCrit.parts = Object.values(damageCrit?.parts || {}).map(d => [d[0] || "", d[1] || ""]);

		const damageImp = formData.system?.damageImp;
		if ( damageImp ) damageImp.parts = Object.values(damageImp?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
		const damageCritImp = formData.system?.damageCritImp;
		if ( damageCritImp ) damageCritImp.parts = Object.values(damageCritImp?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
		
		const damageRes = formData.system.armour?.damageRes;
		if ( damageRes ) damageRes.parts = Object.values(damageRes?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
	
		const damageDice = formData.system?.damageDice;
		if(damageDice) damageDice.parts = Object.values(damageDice?.parts || {}).map(d => [d[0] || "", d[1] || "", d[2] || ""]);

		const special = formData.system?.specialAdd;
		if (special) special.parts = Object.values(special?.parts || {}).map(d => [d || ""]);

		// Update the Item
		super._updateObject(event, formData);
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		//veiw image
		html.find('.item-art').click(this._onDisplayItemArt.bind(this));

		if ( this.isEditable ) {
			html.find("button.execute").click(this._onExecute.bind(this));

			html.find(".damage-control").click(this._onDamageControl.bind(this));
			html.find(".onetext-control").click(this._onOnetextControl.bind(this));
			html.find('.trait-selector.class-skills').click(this._onConfigureClassSkills.bind(this));

			// html.find(".effect-control").click(event => {
			// 	if ( this.item.isOwned ) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.")
			// 		ActiveEffect4e.onManageActiveEffect(event, this.item);
			// });
			html.find(".effect-control").click(event => { ActiveEffect4e.onManageActiveEffect(event, this.item);});


			html.find('.powereffect-control').click(this._onPowerEffectControl.bind(this));
		}

		
		// Add a link to add GM notes
		if ( this.isEditable && game.user.isGM && !this.item.system.description.gm) {
			const descriptionEditors = html.find(".tab[data-tab=description]");
			const mainEditor = descriptionEditors.find(".main .editor");

			const addGMNotesLink = document.createElement("a");
			addGMNotesLink.className = "add-gm-notes editor-edit"
			addGMNotesLink.dataset.action = "add-gm-notes";
			addGMNotesLink.innerHTML = `<i class="fa-regular fa-note-medical"></i>`;
			addGMNotesLink.dataset.tooltip = "DND4E.GMNotesAdd";
			mainEditor.prepend(addGMNotesLink);
			addGMNotesLink.addEventListener("click", () => {
				html.find(".gm-notes")?.addClass("has-content");
				this.activateEditor("system.description.gm");
			});
		}
	}

	async activateEditor(name, options={}, initialContent="") {

		if(name === "system.description.gm"){
			this.element.find(".description").addClass("editing-gm");
		}
		else if(name === "system.description.value"){
			this.element.find(".description").addClass("editing-main");
		}
		return super.activateEditor(name, options, initialContent);
	}

	/* -------------------------------------------- */

	_onDisplayItemArt(event) {
		event.preventDefault();

		const p = new ImagePopout(this.object.img);
		p.render(true);
	}	
	/* -------------------------------------------- */
	
	async _onExecute(event) {
		event.preventDefault();
		await this._onSubmit(event, {preventClose: true});
		return Helper.executeMacro(this.document)
	}
	
	/* -------------------------------------------- */

	/**
	 * Add or remove a damage part from the damage formula
	 * @param {Event} event     The original click event
	 * @return {Promise}
	 * @private
	 */
	async _onDamageControl(event) {
		event.preventDefault();
		const a = event.currentTarget;

		// Add new damage component
		if ( a.classList.contains("add-damage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damage = this.item.system.damage;
			return this.item.update({"system.damage.parts": damage.parts.concat([["", ""]])});
		}

		// Remove a damage component
		if ( a.classList.contains("delete-damage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damage = duplicate(this.item.system.damage);
			damage.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damage.parts": damage.parts});
		}
	
		// Add new critical damage component
		if ( a.classList.contains("add-criticalDamage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageCrit = this.item.system.damageCrit;
			return this.item.update({"system.damageCrit.parts": damageCrit.parts.concat([["", ""]])});
		}

		// Remove a critical damage component
		if ( a.classList.contains("delete-criticalDamage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageCrit = duplicate(this.item.system.damageCrit);
			damageCrit.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageCrit.parts": damageCrit.parts});
		}

		// Add new implement damage component
		if ( a.classList.contains("add-damage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageImp = this.item.system.damageImp;
			return this.item.update({"system.damageImp.parts": damageImp.parts.concat([["", ""]])});
		}

		// Remove a implement damage component
		if ( a.classList.contains("delete-damage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageImp = duplicate(this.item.system.damageImp);
			damageImp.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageImp.parts": damageImp.parts});
		}
	
		// Add new implement critical damage component
		if ( a.classList.contains("add-criticalDamage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageCritImp = this.item.system.damageCritImp;
			return this.item.update({"system.damageCritImp.parts": damageCritImp.parts.concat([["", ""]])});
		}

		// Remove a implement critical damage component
		if ( a.classList.contains("delete-criticalDamage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageCritImp = duplicate(this.item.system.damageCritImp);
			damageCritImp.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageCritImp.parts": damageCritImp.parts});
		}
		// Add new damage res
		if ( a.classList.contains("add-damageRes") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageRes = this.item.system.armour.damageRes;
			return this.item.update({"system.armour.damageRes.parts": damageRes.parts.concat([["", ""]])});
		}

		// Remove a damage res
		if ( a.classList.contains("delete-damageRes") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageRes = duplicate(this.item.system.armour.damageRes);
			damageRes.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.armour.damageRes.parts": damageRes.parts});
		}

		if(a.classList.contains("add-dice")) {
			await this._onSubmit(event); // Submit any unsaved changes
			const damageDice = duplicate(this.item.system.damageDice);
			return this.item.update({"system.damageDice.parts": damageDice.parts.concat([["","",""]])});
		}

		if ( a.classList.contains("delete-dice") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageDice = duplicate(this.item.system.damageDice);
			damageDice.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageDice.parts": damageDice.parts});
		}
	}

	/**
	 * Add or remove a damage part from the damage formula
	 * @param {Event} event     The original click event
	 * @return {Promise}
	 * @private
	 */
	async _onOnetextControl(event) {
		event.preventDefault();
		const a = event.currentTarget;

		// Add new special component
		if ( a.classList.contains("add-special") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const special = this.item.system.specialAdd;
			return this.item.update({"system.specialAdd.parts": special.parts.concat([[""]])});
		}

		// Remove a special component
		if ( a.classList.contains("delete-special") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".onetext-part");
			const special = duplicate(this.item.system.specialAdd);
			special.parts.splice(Number(li.dataset.specialPart), 1);
			return this.item.update({"system.specialAdd.parts": special.parts});
		}
	}

	/* -------------------------------------------- */

	/**
	 * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
	 * @param {Event} event   The click event which originated the selection
	 * @private
	 */
	_onConfigureClassSkills(event) {
		event.preventDefault();
		const skills = this.item.system.skills;
		const choices = skills.choices && skills.choices.length ? skills.choices : Object.keys(CONFIG.DND4E.skills);
		const a = event.currentTarget;
		const label = a.parentElement;

		// Render the Trait Selector dialog
		// new TraitSelector(this.item, {
			// name: a.dataset.edit,
			// title: label.innerText,
			// choices: Object.entries(CONFIG.DND4E.skills).reduce((obj, e) => {
				// if ( choices.includes(e[0] ) ) obj[e[0]] = e[1];
				// return obj;
			// }, {}),
			// minimum: skills.number,
			// maximum: skills.number
		// }).render(true)
	}


	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onDragStart(event) {
		const li = event.currentTarget;
		if ( event.target.classList.contains("content-link") ) return;

		// Create drag data
		let dragData;

		// Active Effect
		if ( li.dataset.effectId ) {
		const effect = this.item.effects.get(li.dataset.effectId);
		dragData = effect.toDragData();
		} else if ( li.classList.contains("advancement-item") ) {
		dragData = this.item.advancement.byId[li.dataset.id]?.toDragData();
		}

		if ( !dragData ) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		const item = this.item;

		/**
		 * A hook event that fires when some useful data is dropped onto an ItemSheet4e.
		 * @function dnd4e.dropItemSheetData
		 * @memberof hookEvents
		 * @param {Item4e} item                  The Item4e
		 * @param {ItemSheet4e} sheet            The ItemSheet4e application
		 * @param {object} data                  The data that has been dropped onto the sheet
		 * @returns {boolean}                    Explicitly return `false` to prevent normal drop handling.
		 */
		const allowed = Hooks.call("dnd4e.dropItemSheetData", item, this, data);
		if ( allowed === false ) return;

		switch ( data.type ) {
		case "ActiveEffect":
			return this._onDropActiveEffect(event, data);
		}

	}

	/* -------------------------------------------- */

	/**
	 * Handle the dropping of ActiveEffect data onto an Item Sheet
	 * @param {DragEvent} event                  The concluding DragEvent which contains drop data
	 * @param {object} data                      The data transfer extracted from the event
	 * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
	 * @protected
	 */
	async _onDropActiveEffect(event, data) {
		const effect = await ActiveEffect.implementation.fromDropData(data);
		if ( !this.item.isOwner || !effect ) return false;
		if ( (this.item.uuid === effect.parent?.uuid) || (this.item.uuid === effect.origin) ) return false;
		return ActiveEffect.create({
			...effect.toObject(),
			origin: this.item.uuid
		}, {parent: this.item});
	}

  /* -------------------------------------------- */

  /**
   * IDs for items on the sheet that have been expanded.
   * @type {Set<string>}
   * @protected
   */
  _expanded = new Set();

  /* -------------------------------------------- */

}
