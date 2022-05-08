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
		if ( this.object.data.type === "class" ) {
			this.options.resizable = true;
			this.options.width =  600;
			this.options.height = 680;
		}
	}

	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			width: 585,
			height: 420,
			classes: ["dnd4eBeta", "sheet", "item"],
			resizable: true,
			scrollY: [
				".tab.details"
			],
			tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}],
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get template() {
		const path = "systems/dnd4e/templates/items/";
		return `${path}/${this.item.data.type}.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData(options) {
		const data = super.getData(options);
		const itemData = data.data;
		data.labels = this.item.labels;
		data.config = CONFIG.DND4EBETA;

		// Item Type, Status, and Details
		data.itemType = itemData.type.titleCase();
		data.itemStatus = this._getItemStatus(itemData);
		data.itemProperties = this._getItemProperties(itemData);
		data.isPhysical = itemData.data.hasOwnProperty("quantity");

		// Potential consumption targets
		data.abilityConsumptionTargets = this._getItemConsumptionTargets(itemData);
	
		if(itemData.type === "power"){
			data.powerWeaponUseTargets = this._getItemsWeaponUseTargets(itemData);
			data.effectsPowers = this._prepareEffectPowersCategories(this.item.effects);
		}

		if(itemData.type == "equipment") data.equipmentSubTypeTargets = this._getItemEquipmentSubTypeTargets(itemData, data.config);
		if(itemData.data?.useType) {
			if(!(itemData.data.rangeType === "personal" || itemData.data.rangeType === "closeBurst" || itemData.data.rangeType === "closeBlast" || data.data.rangeType === "")){
				itemData.data.isRange = true;
			}

			if(itemData.data.rangeType === "closeBurst" || itemData.data.rangeType === "closeBlast" || itemData.data.rangeType === "rangeBurst" || itemData.data.rangeType === "rangeBlast" || itemData.data.rangeType === "wall" ) { 
				itemData.data.isArea = true;
			}
			itemData.data.isRecharge = itemData.data.useType === "recharge";
		}


		// Weapon Properties
		if(itemData.type === "weapon"){
			data.weaponMetaProperties = {};
			for (let attrib in data.config.weaponProperties) {
				data.weaponMetaProperties[attrib] = {
						propName: data.config.weaponProperties[attrib], 
						checked: itemData.data.properties[attrib],
						disabled: (attrib === "imp" && itemData.data.weaponType === "implement")
				}
			}
		}

		// Action Details
		data.hasAttackRoll = this.item.hasAttack;
		data.isHealing = itemData.data.actionType === "heal";
		data.isFlatDC = getProperty(itemData.data, "save.scaling") === "flat";

		// Vehicles
		data.isCrewed = itemData.data.activation?.type === 'crew';
		data.isMountable = this._isItemMountable(itemData);
	
		// Prepare Active Effects
		data.effects = ActiveEffect4e.prepareActiveEffectCategories(this.item.effects);

		// Re-define the template data references (backwards compatible)
		data.item = itemData;
		data.data = itemData.data;
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
		for (const [key, value] of Object.entries(CONFIG.DND4EBETA.powerEffectTypes)) {
			categories[key] = {
			type:key,
			label: game.i18n.localize(value),
			effects: []
		  }
		}

		if(effectPowers){
			for ( let e of effectPowers ) {
				e.durationTypeLable = `${CONFIG.DND4EBETA.durationType[e.data.flags.dnd4e.effectData.durationType]}`;
				if(e.data.flags.dnd4e?.effectData?.powerEffectTypes === "hit") categories.hit.effects.push(e);
				else if(e.data.flags.dnd4e?.effectData?.powerEffectTypes === "miss") categories.miss.effects.push(e);
				else if(e.data.flags.dnd4e?.effectData?.powerEffectTypes === "self") categories.self.effects.push(e);
				else categories.all.effects.push(e);
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
				this.item.createEmbeddedDocuments("ActiveEffect", [{
					label: game.i18n.localize("DND4EBETA.EffectNew"),
					icon: "icons/svg/aura.svg",
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

	shareItem() {
		game.socket.emit("system.dnd4e", {
			itemId: this.item.id
		});
	}

	static _handleShareItem({itemId}={}) {
		let item = game.items.get(itemId);

		if (item == undefined) {
			let characters = game.actors.filter(x => x.data.type == "Player Character");

			for (var x = 0; x <= characters.length; x++) {
				let actor = characters[x];
				let found = actor.data.items.find(x => x._id == itemId);
				if (found) {
					item = actor.items.get(itemId);
					break;
				}
			}
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
		const jsonString = JSON.stringify(this.object.data._source);

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

		if(item.data.armour.type == "armour") { return config.equipmentTypesArmour; }
		else if (item.data.armour.type == "arms") { return config.equipmentTypesArms; }
		else if (item.data.armour.type == "feet") { return config.equipmentTypesFeet; }
		else if (item.data.armour.type == "hands") { return config.equipmentTypesHands; }
		else if (item.data.armour.type == "head") { return config.equipmentTypesHead; }
		else if (item.data.armour.type == "neck") { return config.equipmentTypesNeck; }
		else if (item.data.armour.type == "ring") { return null; }
		else if (item.data.armour.type == "waist") { return config.equipmentTypesWaist; }
		else if (item.data.armour.type == "natural") { return null; }
		else if (item.data.armour.type == "other") { return null; }
		
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
		const consume = item.data.consume || {};
		if ( !consume.type ) return [];
		const actor = this.item.actor;
		if ( !actor ) return {};
	
		// Ammunition
		if ( consume.type === "ammo" ) {
			return actor.itemTypes.consumable.reduce((ammo, i) =>  {
				if ( i.data.data.consumableType === "ammo" ) {
					ammo[i.id] = `${i.name} (${i.data.data.quantity})`;
				}
				return ammo;
			}, {});
		}

	// Attributes
	else if ( consume.type === "attribute" ) {
		// const attributes = Object.values(CombatTrackerConfig.prototype.getAttributeChoices())[0]; // Bit of a hack
		const attributes = TokenDocument.getTrackedAttributes(actor.data.data);
		attributes.bar.forEach(a => a.push("value"));
		return attributes.bar.concat(attributes.value).reduce((obj, a) => {
			let k = a.join(".");
			obj[k] = k;
			return obj;
		},{});
	}

		// Materials
		else if ( consume.type === "material" ) {
			return actor.items.reduce((obj, i) => {
				if ( ["consumable", "loot"].includes(i.data.type) ) {
					obj[i.id] = `${i.name} (${i.data.data.quantity})`;
				}
				return obj;
			}, {});
		}

		// Charges
		else if ( consume.type === "charges" ) {
			return actor.items.reduce((obj, i) => {
				const uses = i.data.data.uses || {};
				if ( uses.per && uses.max ) {
					const label = uses.per === "charges" ?
						` (${game.i18n.format("DND4EBETA.AbilityUseChargesLabel", {value: uses.value})})` :
						` (${game.i18n.format("DND4EBETA.AbilityUseConsumableLabel", {max: uses.max, per: uses.per})})`;
					obj[i.id] = i.name + label;
				}
				return obj;
			}, {})
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
		
		const weaponType = weapon.data.weaponType || {};
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
				if (setMelee.includes(i.data.data.weaponType) ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});
		}
		
		if ( weaponType === "ranged" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (setRanged.includes(i.data.data.weaponType) ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});
		}

		if ( weaponType === "meleeRanged" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (setMelee.includes(i.data.data.weaponType) || setRanged.includes(i.data.data.weaponType) ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});
		}
		
		if ( weaponType === "implement" ) {
			return actor.itemTypes.weapon.reduce((obj, i) =>  {
				if (i.data.data.properties.imp ) {
					obj[i.id] = `${i.name}`;
				}
				return obj;
			}, {});			
		}
				
		// if ( weaponType === "implementA" ) {
			// return actor.itemTypes.weapon.reduce((obj, i) =>  {
				// if (i.data.data.properties.impA || i.data.data.properties.imp ) {
					// obj[i.id] = `${i.name}`;
				// }
				// return obj;
			// }, {});			
		// }
		
		// if ( weaponType === "implementD" ) {
			// return actor.itemTypes.weapon.reduce((obj, i) =>  {
				// if (i.data.data.properties.impD || i.data.data.properties.imp ) {
					// obj[i.id] = `${i.name}`;
				// }
				// return obj;
			// }, {});			
		// }
		
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
			return CONFIG.DND4EBETA.spellPreparationModes[item.data.preparation];
		}
		else if ( ["weapon", "equipment"].includes(item.type) ) {
			return game.i18n.localize(item.data.equipped ? "DND4EBETA.Equipped" : "DND4EBETA.Unequipped");
		}
		else if ( item.type === "tool" ) {
			return game.i18n.localize(item.data.proficient ? "DND4EBETA.Proficient" : "DND4EBETA.NotProficient");
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

			props.push(CONFIG.DND4EBETA.weaponTypes[item.data.weaponType])

			props.push(...Object.entries(item.data.properties)
				.filter(e => e[1] === true)
				.map(e => {
					if(e[0] === "bru") return `${CONFIG.DND4EBETA.weaponProperties[e[0]]} ${item.data.brutalNum}`;
					return CONFIG.DND4EBETA.weaponProperties[e[0]]
				})
			);

			props.push(...Object.entries(item.data.damageType)
				.filter(e => e[1] === true)
				.map(e => CONFIG.DND4EBETA.damageTypes[e[0]])
			);

			props.push(...Object.entries(item.data.weaponGroup)
				.filter(e => e[1] === true)
				.map(e => CONFIG.DND4EBETA.weaponGroup[e[0]])
			);

			if(item.data.isRanged)
				props.push(`${game.i18n.localize("DND4EBETA.Range")}: ${item.data.range.value} / ${item.data.range.long}`);
		}

		else if ( item.type === "power" || ["power","atwill","encounter","daily","utility","item"].includes(item.data.type)) {
			props.push(
				labels.components,
				labels.materials,
				// item.data.components.concentration ? game.i18n.localize("DND4EBETA.Concentration") : null,
				// item.data.components.ritual ? game.i18n.localize("DND4EBETA.Ritual") : null
			)
		}

		else if ( item.type === "equipment" ) {
			props.push(CONFIG.DND4EBETA.equipmentTypes[item.data.armour.type]);
			props.push(labels.armour);
			props.push(labels.fort);
			props.push(labels.ref);
			props.push(labels.wil);
		}

		else if ( item.type === "feat" ) {
			props.push(labels.featType);
		}

		// Action type
		if ( item.data.actionType ) {
			props.push(CONFIG.DND4EBETA.itemActionTypes[item.data.actionType]);
		}

		// Action usage
		if ( (item.type !== "weapon") && item.data.activation && !isObjectEmpty(item.data.activation) ) {
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
		const data = item.data;
		return (item.type === 'weapon' && data.weaponType === 'siege')
			|| (item.type === 'equipment' && data.armour.type === 'vehicle');
	}

	/* -------------------------------------------- */

	/** @override */
	setPosition(position={}) {
		if ( !(this._minimized  || position.height) ) {
			position.height = (this._tabs[0].active === "details") ? "auto" : this.options.height;
		}
		return super.setPosition(position);
	}

	/* -------------------------------------------- */
	/*  Form Submission                             */
	/* -------------------------------------------- */

	/** @override */
	_updateObject(event, formData) {

		// TODO: This can be removed once 0.7.x is release channel
		if ( !formData.data ) formData = expandObject(formData);

		// Handle Damage Array
		const damage = formData.data?.damage;
		if ( damage ) damage.parts = Object.values(damage?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
		const damageCrit = formData.data?.damageCrit;
		if ( damageCrit ) damageCrit.parts = Object.values(damageCrit?.parts || {}).map(d => [d[0] || "", d[1] || ""]);

		const damageImp = formData.data?.damageImp;
		if ( damageImp ) damageImp.parts = Object.values(damageImp?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
		const damageCritImp = formData.data?.damageCritImp;
		if ( damageCritImp ) damageCritImp.parts = Object.values(damageCritImp?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
		
		const damageRes = formData.data.armour?.damageRes;
		if ( damageRes ) damageRes.parts = Object.values(damageRes?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
	
		const damageDice = formData.data?.damageDice;
		if(damageDice) damageDice.parts = Object.values(damageDice?.parts || {}).map(d => [d[0] || "", d[1] || "", d[2] || ""]);

		const special = formData.data?.specialAdd;
		if (special) special.parts = Object.values(special?.parts || {}).map(d => [d || ""]);

		// Update the Item
		super._updateObject(event, formData);
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		if ( this.isEditable ) {
			html.find("button.execute").click(this._onExecute.bind(this));

			html.find(".damage-control").click(this._onDamageControl.bind(this));
			html.find(".onetext-control").click(this._onOnetextControl.bind(this));
			html.find('.trait-selector.class-skills').click(this._onConfigureClassSkills.bind(this));
			html.find(".effect-control").click(ev => {
				if ( this.item.isOwned ) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.")
					ActiveEffect4e.onManageActiveEffect(ev, this.item);
					// onManageActiveEffect(ev, this.item)
			});
			html.find('.powereffect-control').click(this._onPowerEffectControl.bind(this));
	}

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
			const damage = this.item.data.data.damage;
			return this.item.update({"data.damage.parts": damage.parts.concat([["", ""]])});
		}

		// Remove a damage component
		if ( a.classList.contains("delete-damage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damage = duplicate(this.item.data.data.damage);
			damage.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"data.damage.parts": damage.parts});
		}
	
		// Add new critical damage component
		if ( a.classList.contains("add-criticalDamage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageCrit = this.item.data.data.damageCrit;
			return this.item.update({"data.damageCrit.parts": damageCrit.parts.concat([["", ""]])});
		}

		// Remove a critical damage component
		if ( a.classList.contains("delete-criticalDamage") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageCrit = duplicate(this.item.data.data.damageCrit);
			damageCrit.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"data.damageCrit.parts": damageCrit.parts});
		}

		// Add new implement damage component
		if ( a.classList.contains("add-damage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageImp = this.item.data.data.damageImp;
			return this.item.update({"data.damageImp.parts": damageImp.parts.concat([["", ""]])});
		}

		// Remove a implement damage component
		if ( a.classList.contains("delete-damage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageImp = duplicate(this.item.data.data.damageImp);
			damageImp.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"data.damageImp.parts": damageImp.parts});
		}
	
		// Add new implement critical damage component
		if ( a.classList.contains("add-criticalDamage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageCritImp = this.item.data.data.damageCritImp;
			return this.item.update({"data.damageCritImp.parts": damageCritImp.parts.concat([["", ""]])});
		}

		// Remove a implement critical damage component
		if ( a.classList.contains("delete-criticalDamage-imp") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageCritImp = duplicate(this.item.data.data.damageCritImp);
			damageCritImp.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"data.damageCritImp.parts": damageCritImp.parts});
		}
		// Add new damage res
		if ( a.classList.contains("add-damageRes") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const damageRes = this.item.data.data.armour.damageRes;
			return this.item.update({"data.armour.damageRes.parts": damageRes.parts.concat([["", ""]])});
		}

		// Remove a damage res
		if ( a.classList.contains("delete-damageRes") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageRes = duplicate(this.item.data.data.armour.damageRes);
			damageRes.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"data.armour.damageRes.parts": damageRes.parts});
		}

		if(a.classList.contains("add-dice")) {
			await this._onSubmit(event); // Submit any unsaved changes
			const damageDice = duplicate(this.item.data.data.damageDice);
			return this.item.update({"data.damageDice.parts": damageDice.parts.concat([["","",""]])});
		}

		if ( a.classList.contains("delete-dice") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".damage-part");
			const damageDice = duplicate(this.item.data.data.damageDice);
			damageDice.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"data.damageDice.parts": damageDice.parts});
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
			const special = this.item.data.data.specialAdd;
			return this.item.update({"data.specialAdd.parts": special.parts.concat([[""]])});
		}

		// Remove a special component
		if ( a.classList.contains("delete-special") ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const li = a.closest(".onetext-part");
			const special = duplicate(this.item.data.data.specialAdd);
			special.parts.splice(Number(li.dataset.specialPart), 1);
			return this.item.update({"data.specialAdd.parts": special.parts});
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
		const skills = this.item.data.data.skills;
		const choices = skills.choices && skills.choices.length ? skills.choices : Object.keys(CONFIG.DND4EBETA.skills);
		const a = event.currentTarget;
		const label = a.parentElement;

		// Render the Trait Selector dialog
		// new TraitSelector(this.item, {
			// name: a.dataset.edit,
			// title: label.innerText,
			// choices: Object.entries(CONFIG.DND4EBETA.skills).reduce((obj, e) => {
				// if ( choices.includes(e[0] ) ) obj[e[0]] = e[1];
				// return obj;
			// }, {}),
			// minimum: skills.number,
			// maximum: skills.number
		// }).render(true)
	}
}
