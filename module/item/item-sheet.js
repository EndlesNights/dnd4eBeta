// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import { default as TokenDocument4e } from "../documents/token.js"
import {Helper} from "../helper.js";

/**
 * Override and extend the core ItemSheet implementation to handle specific item types
 * @extends {ItemSheet}
 */
export default class ItemSheet4e extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheet) {
	#dragDrop;

	get dragDrop() {
		return this.#dragDrop;
	}

	constructor(...args) {
		super(...args);

		this.#dragDrop = this.#createDragDropHandlers();
	}

	static DEFAULT_OPTIONS = {
		classes: ["dnd4e", "sheet", "item", "standard-form"],
		position: {
			width: 585,
			height: 450
		},
		window: {
			resizable: true
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false
		},
		dragDrop: [
			{dragSelector: "[data-effect-id]", dropSelector: ".effects-list"},
			{dragSelector: ".item-list .item", dropSelector: null}
		],
		actions: {
			showImage: ItemSheet4e.#onDisplayItemArt,
			executeMacro: ItemSheet4e.#onExecuteMacro,
			addDamage: ItemSheet4e.#onDamageControl,
			deleteDamage: ItemSheet4e.#onDamageControl,
			addCriticalDamage: ItemSheet4e.#onDamageControl,
			deleteCriticalDamage: ItemSheet4e.#onDamageControl,
			addDamageImp: ItemSheet4e.#onDamageControl,
			deleteDamageImp: ItemSheet4e.#onDamageControl,
			addCriticalDamageImp: ItemSheet4e.#onDamageControl,
			deleteCriticalDamageImp: ItemSheet4e.#onDamageControl,
			addDamageRes: ItemSheet4e.#onDamageControl,
			deleteDamageRes: ItemSheet4e.#onDamageControl,
			addDice: ItemSheet4e.#onDamageControl,
			deleteDice: ItemSheet4e.#onDamageControl,
			addSpecial: ItemSheet4e.#onOneTextControl,
			deleteSpecial: ItemSheet4e.#onOneTextControl,
			configureClassSkills: ItemSheet4e.#onConfigureClassSkills,
			createPowerEffect: ItemSheet4e.#onPowerEffectControl,
			editPowerEffect: ItemSheet4e.#onPowerEffectControl,
			deletePowerEffect: ItemSheet4e.#onPowerEffectControl,
			// Container actions
			itemRoll: ItemSheet4e.#onItemRoll,
			editItem: ItemSheet4e.#onItemControl,
			deleteItem: ItemSheet4e.#onItemControl
		}
	}

	static PARTS = {
		header: {
			template: "systems/dnd4e/templates/items/parts/header.hbs"
		},
		tabs: {
			template: "templates/generic/tab-navigation.hbs"
		},
		content: {
			template: "systems/dnd4e/templates/items/tabs/content.hbs",
			scrollable: [""]
		},
		description: {
			template: "systems/dnd4e/templates/items/tabs/description.hbs",
			scrollable: [""]
		},
		details: {
			template: "systems/dnd4e/templates/items/tabs/details.hbs",
			scrollable: [""]
		},
		keywords: {
			template: "systems/dnd4e/templates/items/tabs/keywords.hbs",
			scrollable: [""]
		},
		effects: {
			template: "systems/dnd4e/templates/items/tabs/effects.hbs",
			scrollable: [""]
		},
		macros: {
			template: "systems/dnd4e/templates/items/tabs/macros.hbs",
			scrollable: [""]
		}
	}

	static TABS = {
		primary: {
			tabs: [
				{
					id: "content",
					label: "DND4E.Content",
					condition: (item) => item.type === "backpack"
				},
				{
					id: "description",
					label: "DND4E.Sheet.Description"
				},
				{
					id: "details",
					label: "DND4E.Sheet.Details",
					// Custom logic, not core
					condition: (item) => item.type !== "loot"
				},
				{
					id: "keywords",
					label: "DND4E.Keywords",
					// Custom logic, not core
					condition: (item) => item.type === "feature"
				},
				{
					id: "effects",
					label: "DND4E.Sheet.Effects",
					// Custom logic, not core
					condition: (item) => item.type !== "ritual"
				},
				{
					id: "macros",
					label: "DND4E.Macros"
				}
			],
			// initial: "description"
		}
	}

	/* -------------------------------------------- */

	_configureRenderParts(options) {
		const parts = super._configureRenderParts(options);
		for (const key of Object.keys(parts)) {
			const tab = ItemSheet4e.TABS.primary.tabs.find(t => t.id === key);
			if (tab?.condition && !tab.condition(this.document)) delete parts[key];
		}
		return parts;
	}

	/* -------------------------------------------- */

	async _preparePartContext(partId, context) {
		const partContext = await super._preparePartContext(partId, context);
		if (partId in partContext.tabs) partContext.tab = partContext.tabs[partId];
		return partContext;
	}

	/* -------------------------------------------- */

	_initializeApplicationOptions(options) {
		options = super._initializeApplicationOptions(options);
		if (options.document.type === "class") {
			options.position.width = 600;
			options.position.height = 680;
		}
		return options;
	}

	/* -------------------------------------------- */

	#createDragDropHandlers() {
		return (this.options.dragDrop ?? []).map((d) => {
			d.permissions = {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			};
			d.callbacks = {
				dragstart: this._onDragStart.bind(this),
				drop: this._onDrop.bind(this),
			};
			return new foundry.applications.ux.DragDrop.implementation(d);
		});
	}

	/* -------------------------------------------- */

	_canDragStart(selector) {
		return this.isEditable;
	}

	/* -------------------------------------------- */

	_canDragDrop(selector) {
		return this.isEditable;
	}

	/* -------------------------------------------- */

	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);
		if (!this.tabGroups.primary) {
			if (this.item.type === "backpack") this.changeTab("content", "primary");
			else this.changeTab("description", "primary");
		}
	}

	/* -------------------------------------------- */

	/** @override */
	async _onRender(context, options) {
		await super._onRender(context, options);

		this.#dragDrop.forEach((d) => d.bind(this.element));

		// TODO: AppV2 this stuff properly (add to `DEFAULT_OPTIONS.actions` and set `data-action on the proper elements)
		if ( this.isEditable ) {
			this.element.querySelectorAll(".effect-control").forEach(el => el.addEventListener("click", (event => { ActiveEffect4e.onManageActiveEffect(event, this.item);})));
			this.element.querySelectorAll(".item-quantity input").forEach(el => el.addEventListener("change", (event) => {
				const li = event.target.closest(".item");
				const item = this.item.contents.get(li?.dataset.itemId);
				return item?.update({"system.quantity": event.target.value});
			}));
		}
	}

	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const itemData = this.item.toObject(false);

		context.labels = this.item.labels;
		context.config = CONFIG.DND4E;

		// Item Type, Status, and Details
		// data.user = game.user; //This is causing a huge error!
		context.userInfo = game.user;

		context.itemType = itemData.type.titleCase();
		context.itemStatus = this._getItemStatus(itemData);
		context.itemProperties = this._getItemProperties(itemData);
		
		context.isPhysical = itemData.system.hasOwnProperty("quantity");

		context.showLevel = true;
		context.showRarity = true;

		// Potential consumption targets
		context.abilityConsumptionTargets = this._getItemConsumptionTargets(itemData);
				
		if(itemData.type === "feature"){
			context.isAura = ( itemData.system?.auraSize >= 0 ? true : false);
			context.summaryLabel = CONFIG.DND4E.featureTypes[itemData.system.featureType]?.label;
			context.showRarity = false;
		}
	
		if(itemData.type === "power"){
			context.powerWeaponUseTargets = this._getItemsWeaponUseTargets(itemData);
			context.effectsPowers = this._prepareEffectPowersCategories(this.item.effects);
			context.showLevel = false;
			context.showRarity = false;
			context.surgeOptions = {
				"": "DND4E.None",
				surge: "DND4E.HealingSurgeSpend",
				surgeCost: "DND4E.HealingSurgeCost",
				surgeValue: "DND4E.HealingSurgeValue"
			}
		}

		if(itemData.type === "ritual"){
			let attributeOptions = {}
			for (const [key, value] of Object.entries(CONFIG.DND4E.abilityScores)) {
				attributeOptions[key] = {
					value: "abilities." + key + ".check.total",
					label: value.label
				};
			};
			for (const [key, value] of Object.entries(CONFIG.DND4E.skills)) {
				attributeOptions[key] = {
					value: "skills." + key + ".total",
					label: value.label
				};
			};
			context.attributeOptions = attributeOptions;
			context.showLevel = false;
			context.showRarity = false;
		}

		if(itemData.type === "consumable"){
			context.effectsPowers = this._prepareEffectPowersCategories(this.item.effects);
			context.summaryLabel = CONFIG.DND4E.consumableTypes[itemData.system.consumableType]?.label;
		}

		if(itemData.type === "equipment"){
			context.equipmentSubTypeTargets = this._getItemEquipmentSubTypeTargets(itemData, context.config);

			if(itemData.system.armour.type === "armour"){
				context.isArmour = true;
				context.hasEnhance = true;
				context.hasBaseProps = true;
				context.armourBaseTypes = CONFIG.DND4E[itemData.system.armour.subType] || {"": game.i18n.localize("DND4E.None")};
				context.isArmourBaseTypeCustom = (itemData.system.armourBaseType === "custom");
			}
			else if(itemData.system.armour.type === "arms" && CONFIG.DND4E.profArmor[itemData.system.armour.subType]){
				context.isShield = true;
				context.hasBaseProps = true;
				context.shieldBaseTypes = CONFIG.DND4E.shield;
				context.isShieldBaseTypeCustom = (itemData.system.shieldBaseType === "custom");
			}
			else if(itemData.system.armour.type === "neck"){
				context.hasEnhance = true;
			}
			context.summaryLabel = CONFIG.DND4E.equipmentTypes[itemData.system.armour.type]?.label;
		}

		if(itemData.type === "tool"){
			let attributeOptions = {}
			for (const [key, value] of Object.entries(CONFIG.DND4E.abilityScores)) {
				attributeOptions[key] = {
					value: "abilities." + key + ".check.total",
					label: value.label
				};
			};
			for (const [key, value] of Object.entries(CONFIG.DND4E.skills)) {
				attributeOptions[key] = {
					value: "skills." + key + ".total",
					label: value.label
				};
			};
			context.attributeOptions = attributeOptions;
		}

		if(itemData.type === "backpack"){
			const items = Array.from(await this.item.contents);
			context.encumbrance = await this.item._computeEncumbrance();

			context.itemData = [];

			for (const i of items) {
				const d = i.toObject(false);
				d.totalWeight = (i.system.quantity * i.system.weight).toNearest(0.1);
				d.isExpanded = this._expanded.has(i.id);
				d.isStack = i.system.quantity > 1;
				d.expanded = d.isExpanded ? await i.getChatData({secrets: this.item.isOwner}) : null;
				context.itemData.push(d);
			}
			context.isContainer = true;
			// context.inventory = {
			// 	contents: {
			// 		label: "DND4E.Contents",
			// 		items: context.items
			// 	}
			// };

			context.itemData = context.itemData.toSorted((a, b) => (a.sort || 0) - (b.sort || 0));
		}

		if(itemData.system?.rangeType) {
			if(!["personal","closeBurst","closeBlast","","touch"].includes(itemData.system.rangeType)) itemData.system.isRange = true;
			if(["closeBurst","closeBlast","rangeBurst","rangeBlast","wall"].includes(itemData.system.rangeType)) itemData.system.isArea = true;
			if(["none", "enemies"].includes(itemData.system.autoTarget.mode)) itemData.system.excludeUserFromTargeting = true;
			
			itemData.system.isRecharge = itemData.system?.useType === "recharge";
			
			//Setup range and area keys
			let autoKeys = {};
			if(["melee","touch","reach"].includes(itemData.system.rangeType)) autoKeys.melee = {label: game.i18n.localize('DND4E.Melee')};
			if(["range"].includes(itemData.system.rangeType)) autoKeys.ranged = {label: game.i18n.localize('DND4E.rangeRanged')};
			if(["rangeBurst","rangeBlast","wall"].includes(itemData.system.rangeType))  autoKeys.area = {label: game.i18n.localize('DND4E.rangeArea')};
			if(["closeBurst","closeBlast"].includes(itemData.system.rangeType)) autoKeys.close = {label: game.i18n.localize('DND4E.rangeClose')};
			if(["closeBurst","rangeBurst"].includes(itemData.system.rangeType)) autoKeys.burst = {label: game.i18n.localize('DND4E.rangeJustBurst')};
			if(["closeBlast","rangeBlast"].includes(itemData.system.rangeType)) autoKeys.blast = {label: game.i18n.localize('DND4E.rangeJustBlast')};
			itemData.system.autoKeys = autoKeys;
			if(itemData.system.rangeType == 'weapon'){
				if(itemData.system.weaponType == 'melee') autoKeys.melee = {label: game.i18n.localize('DND4E.Melee')};
				else if(itemData.system.weaponType == 'ranged') autoKeys.ranged = {label: game.i18n.localize('DND4E.rangeRanged')};
				else{
					const weaponUse = (context.document?.parent ? Helper.getWeaponUse(itemData.system, context.document.parent) : null);
					if(weaponUse != null){
						if(weaponUse.system.isRanged) autoKeys.ranged = {label: game.i18n.localize('DND4E.rangeRanged')};
						else autoKeys.melee = {label: game.i18n.localize('DND4E.Melee')};
					}
				}
			}
		}

		// Weapon Properties
		if(itemData.type === "weapon"){
			context.weaponMetaProperties = {};
			for (let attrib in context.config?.weaponProperties) {
				context.weaponMetaProperties[attrib] = {
						propName: context.config.weaponProperties[attrib], 
						checked: itemData.system.properties[attrib],
						disabled: (attrib === "imp" && itemData.system.weaponType === "implement")
				}
			}

			context.hasEnhance = true;
			context.weaponBaseTypes = CONFIG.DND4E[itemData.system.weaponType];
			context.isWeaponBaseTypeCustom = (itemData.system.weaponBaseType === "custom");
			context.summaryLabel = CONFIG.DND4E.weaponTypes[itemData.system.weaponType];
		}

		// Action Details
		//data.hasAttackRoll = this.item.hasAttack;
		//data.isHealing = itemData.system.actionType === "heal";
		//data.isFlatDC = foundry.utils.getProperty(itemData.system, "save.scaling") === "flat";

		// Vehicles
		//data.isCrewed = itemData.system.activation?.type === 'crew';
		//data.isMountable = this._isItemMountable(itemData);
	
		// Prepare Active Effects
		context.effects = ActiveEffect4e.prepareActiveEffectCategories(this.item.effects);

		// Re-define the template data references (backwards compatible)
		context.item = itemData;
		context.system = itemData.system;

		const description = context.system.description;
		const weaponUse = this.actor ? Helper.getWeaponUse(itemData.system, this.actor) : null;
		const itemActor = this.item.actor || null;
		const descriptionText = description.value ? Helper.commonReplace(description.value, itemActor, itemData.system, weaponUse?.system) : "";
		context.descriptionHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(descriptionText || description, {
			secrets: context.item.isOwner,
			async: true,
			relativeTo: this.item
		});

		const descriptionGM = context.system.description.gm || "";
		const descriptionTextGM = context.system.description.gm ? Helper.commonReplace(descriptionGM, itemActor, itemData.system, weaponUse?.system) : "";

		context.descriptionHTMLGM = await foundry.applications.ux.TextEditor.implementation.enrichHTML(descriptionTextGM || descriptionGM, {
			secrets: context.item.isOwner,
			async: true,
			relativeTo: this.item,
			// icon: "fa-regular fa-note-medical"
		});

		if(context.system.description.gm){
			context.system.description.gmNotes = true;
		}

		context.effectDetailHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.effect?.detail, {
			secrets: context.item.isOwner,
			async: true,
			relativeTo: this.item
		});

		context.autoanimationsActive = game.modules.get("autoanimations")?.active;
		context.detailsPartial = `dnd4e.details-${itemData.type}`;

		for (const key of Object.keys(context.tabs)) {
			const tab = context.tabs[key];
			if (tab?.condition && !tab.condition(this.document)) delete context.tabs[key];
		}

		context.editorLang = this.document.system.macro.type === "script" ? "javascript" : "";
		
		return context;
	}

	_getHeaderControls(){
		let controls = super._getHeaderControls();
	
		// Share Entry
		controls.push({
			icon: "fa-solid fa-eye",
			label: "Show Players",
			visible: game.user.isGM,
			onClick: () => this.shareItem()
		});
	
		// Export JSON
		controls.push({
			icon: "fa-solid fa-atlas",
			label: "Export JSON",
			onClick: () => this.exportItem()
		});

		return controls;
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

	static async #onPowerEffectControl(event, target) {
		const li = target.closest("li");
		const effect = li.dataset.effectId ? this.item.effects.get(li.dataset.effectId) : null;
		switch(target.dataset.action){
			case "createPowerEffect":
				console.log(this)
				this.item.createEmbeddedDocuments("ActiveEffect", [{
					name: game.i18n.localize("DND4E.EffectNew"),
					img: this.item.img || "icons/svg/aura.svg",
					origin: this.item.uuid,
					"flags.dnd4e.effectData.powerEffectTypes": li.dataset.effectType,
					"flags.dnd4e.effectData.durationType": li.dataset.effectType === "temporary" ? "endOfUserTurn" : undefined,
					disabled: li.dataset.effectType === "inactive"
				}]);
				return;
			case "editPowerEffect":
				return effect.sheet.render(true);
			case "deletePowerEffect":
				return effect.delete();
		}

	}

	/**
	 * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to its roll method
	 */
	static #onItemRoll(event, target) {
		const li = target.closest(".item");
		const item = this.item.contents.get(li?.dataset.itemId);

		if(item?.actor) return item.roll();
		return false;
	}

	static #onItemControl(event, target) {
		const li = target.closest(".item");
		const item = this.item.contents.get(li?.dataset.itemId);
		if (!item) return;
		if (target.dataset.action === "editItem") {
			return item.sheet.render({ force: true });
		}
		if (game.settings.get("dnd4e", "itemDeleteConfirmation")) {
			return foundry.applications.api.Dialog.confirm({
				window: {
					title: game.i18n.format("DND4E.DeleteConfirmTitle", {name: item.name})
				},
				content: game.i18n.format("DND4E.DeleteConfirmContent", {name: item.name}),
				yes: {
					default: true,
					callback: () => { return item.delete() }
				}
			})
		} else {
			return item.delete();
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
		const jsonString = JSON.stringify(this.item._source);

		// TODO: Can this reasonably ever error?
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
		else if (item.system.armour.type == "alternative") { return config.equipmentTypesAlt; }
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
				const attributes = TokenDocument4e.getTrackedAttributes(actor.system)
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
				const attributes = CONFIG.Actor.dataModels['Player Character'].schema.getInitialValue();
				
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
		//console.debug(this.item.labels);
		const props = [];
		const labels = this.item.labels || {};
		
		if ( item?.type === "weapon" ) {
			props.push(CONFIG.DND4E.weaponTypes[item.system.weaponType]);
			const shortType = item.system.weaponType.substring(0,3) || "";
			
			if (item.system.enhance != 0){				
				props.push(`<li class="enhancement">${game.i18n.localize('DND4E.Enhancement')}\n +${item.system.enhance} ${game.i18n.localize('DND4E.RollsAtkDmg')}</li>`);
			}

			props.push(...Object.entries(item.system.properties)
				.filter(e => e[1] === true && e[0] != shortType)
				//Second filter avoids double instance of "Implement"
				.map(e => {
					if(e[0] === "bru") return `<li class="${e[0]}">${CONFIG.DND4E.weaponProperties[e[0]]} ${item.system.brutalNum}</li>`;
					return `<li class="${e[0]}">${CONFIG.DND4E.weaponProperties[e[0]]}</li>`
				})
			);
			
			props.push(...Object.entries(item.system.damageType)
				.filter(e => e[1] === true && e[0] != "physical")
				.map(e => `<li class="${e[0]}">${CONFIG.DND4E.damageTypes[e[0]]}</li>`)
			);
			
			if(item.system?.implementGroup){
				props.push(...Object.entries(item.system?.implementGroup)
					.filter(e => e[1] === true)
					.map(e => `<li class="${e[0]}">${CONFIG.DND4E.implement[e[0]]}</li>`)
				);
			}
			
			props.push(...Object.entries(item.system.weaponGroup)
				.filter(e => e[1] === true)
				.map(e => `<li class="${e[0]}">${CONFIG.DND4E.weaponGroup[e[0]]}</li>`)
			);

			if(item.system.isRanged)
				props.push(`<li class="range">${game.i18n.localize("DND4E.Range")}: ${item.system.range.value} / ${item.system.range.long}</li>`);

		}

		else if ( item.type === "power" ) {
			for (const [key, value] of Object.entries(labels)) {
				props.push(`<li class="${key}">${value}</li>`)
			}
		}

		else if ( item.type === "equipment" ) {
			if(item.system.armour.type) props.push(`<li class="slot">${CONFIG.DND4E.equipmentTypes[item.system.armour.type].label}</li>`);
			if(labels.armour) props.push(`<li class="ac-bonus">${labels.armour}</li>`);
			if(labels.fort) props.push(`<li class="fort-bonus">${labels.fort}</li>`);
			if(labels.ref) props.push(`<li class="ref-bonus">${labels.ref}</li>`);
			if(labels.wil) props.push(`<li class="will-bonus">${labels.wil}</li>`);
			if(labels.enh) props.push(`<li class="enhancement">${labels.enh}</li>`);
		}

		else if ( item.type === "feature" ) {
			for (const [key, value] of Object.entries(labels)) {
				props.push(`<li class="${key}">${value}</li>`)
			}
		}

		else if ( item.type === "ritual" ) {
			if(labels.category) props.push(`<li class="category">${labels.category}</li>`);
		}
		
		// Action type
		if ( (item.type !== "power") && item.system?.actionType ) {
			if(item.system.actionType) {
				const actionTypeLabel = CONFIG.DND4E.itemActionTypes[item.system.actionType] ?? CONFIG.DND4E.abilityActivationTypes[item.system.actionType]?.label;
				props.push(`<li class="action ${item.system.actionType}">${actionTypeLabel ?? item.system.actionType}</li>`);
			}
		}

		// Action usage
		if ( !['weapon','power'].includes(item.type) && item.system?.activation && !foundry.utils.isEmpty(item.system.activation) ) {
			if(labels.attribute) props.push(`<li class="atk-attribute">${labels.attribute}</li>`);
			if(labels.activation) props.push(`<li class="action">${labels.activation}</li>`);
			if(labels.range) props.push(`<li class="range">${labels.range}</li>`);
			if(labels.target) props.push(`<li class="target">${labels.target}</li>`);
			if(labels.castTime) props.push(`<li class="cast-time">${labels.castTime}</li>`);
			if(labels.duration) props.push(`<li class="duration">${labels.duration}</li>`);
			if(labels.component) props.push(`<li class="components">${labels.component}</li>`);
			if(labels.componentCost) props.push(`<li class="component-cost">${labels.componentCost}</li>`);
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
	changeTab(...args) {
		const autoPos = {...this.position, height: "auto"};
		this.setPosition(autoPos);
		super.changeTab(...args);
		const newPos = {...this.position, height: this.element.scrollHeight};
		this.setPosition(newPos);
	}

	/* -------------------------------------------- */
	/*  Form Submission                             */
	/* -------------------------------------------- */

	// TODO: What's up with this
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

	static #onDisplayItemArt() {
		const p = new foundry.applications.apps.ImagePopout({src: this.item.img});
		p.render(true);
	}	
	/* -------------------------------------------- */
	
	static async #onExecuteMacro() {
		await this.submit({preventClose: true});
		return Helper.executeMacro(this.document)
	}
	
	/* -------------------------------------------- */

	/**
	 * Add or remove a damage part from the damage formula
	 * @param {Event} event     		The original click event
	 * @param {HTMLElement} target	The target of the event
	 * @return {Promise}
	 * @this {ItemSheet4e}
	 */
	static async #onDamageControl(event, target) {
		const action = target.dataset.action;
		// Add new damage component
		if ( action === "addDamage" ) {
			await this.submit(event);  // Submit any unsaved changes
			const damage = this.item.system.damage;
			return this.item.update({"system.damage.parts": damage.parts.concat([["", ""]])});
		}

		// Remove a damage component
		if ( action === "deleteDamage" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".damage-part");
			const damage = foundry.utils.duplicate(this.item.system.damage);
			damage.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damage.parts": damage.parts});
		}
	
		// Add new critical damage component
		if ( action === "addCriticalDamage" ) {
			await this.submit(event);  // Submit any unsaved changes
			const damageCrit = this.item.system.damageCrit;
			return this.item.update({"system.damageCrit.parts": damageCrit.parts.concat([["", ""]])});
		}

		// Remove a critical damage component
		if ( action === "deleteCriticalDamage" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".damage-part");
			const damageCrit = foundry.utils.duplicate(this.item.system.damageCrit);
			damageCrit.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageCrit.parts": damageCrit.parts});
		}

		// Add new implement damage component
		if ( action === "addDamageImp" ) {
			await this.submit(event);  // Submit any unsaved changes
			const damageImp = this.item.system.damageImp;
			return this.item.update({"system.damageImp.parts": damageImp.parts.concat([["", ""]])});
		}

		// Remove a implement damage component
		if ( action === "deleteDamageImp" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".damage-part");
			const damageImp = foundry.utils.duplicate(this.item.system.damageImp);
			damageImp.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageImp.parts": damageImp.parts});
		}
	
		// Add new implement critical damage component
		if ( action === "addCriticalDamageImp" ) {
			await this.submit(event);  // Submit any unsaved changes
			const damageCritImp = this.item.system.damageCritImp;
			return this.item.update({"system.damageCritImp.parts": damageCritImp.parts.concat([["", ""]])});
		}

		// Remove a implement critical damage component
		if ( action === "deleteCriticalDamageImp" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".damage-part");
			const damageCritImp = foundry.utils.duplicate(this.item.system.damageCritImp);
			damageCritImp.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageCritImp.parts": damageCritImp.parts});
		}
		// Add new damage res
		if ( action === "addDamageRes" ) {
			await this.submit(event);  // Submit any unsaved changes
			const damageRes = this.item.system.armour.damageRes;
			return this.item.update({"system.armour.damageRes.parts": damageRes.parts.concat([["", ""]])});
		}

		// Remove a damage res
		if ( action === "deleteDamageRes" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".damage-part");
			const damageRes = foundry.utils.duplicate(this.item.system.armour.damageRes);
			damageRes.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.armour.damageRes.parts": damageRes.parts});
		}

		if(action === "addDice") {
			await this.submit(event); // Submit any unsaved changes
			const damageDice = foundry.utils.duplicate(this.item.system.damageDice);
			return this.item.update({"system.damageDice.parts": damageDice.parts.concat([["","",""]])});
		}

		if ( action === "deleteDice" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".damage-part");
			const damageDice = foundry.utils.duplicate(this.item.system.damageDice);
			damageDice.parts.splice(Number(li.dataset.damagePart), 1);
			return this.item.update({"system.damageDice.parts": damageDice.parts});
		}
	}

	/**
	 * Add or remove a damage part from the damage formula
	 * @param {Event} event     		The original click event
	 * @param {HTMLElement} target	The target of the event
	 * @return {Promise}
	 * @this {ItemSheet4e}
	 */
	static async #onOneTextControl(event, target) {
		const action = target.dataset.action;

		// Add new special component
		if ( action === "addSpecial" ) {
			await this.submit(event);  // Submit any unsaved changes
			const special = this.item.system.specialAdd;
			return this.item.update({"system.specialAdd.parts": special.parts.concat([[""]])});
		}

		// Remove a special component
		if ( action === "deleteSpecial" ) {
			await this.submit(event);  // Submit any unsaved changes
			const li = target.closest(".onetext-part");
			const special = foundry.utils.duplicate(this.item.system.specialAdd);
			special.parts.splice(Number(li.dataset.specialPart), 1);
			return this.item.update({"system.specialAdd.parts": special.parts});
		}
	}

	/* -------------------------------------------- */

	/**
	 * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
	 * @param {Event} event   			The click event which originated the selection
	 * @param {HTMLElement} target	The target of the click event
	 * @private
	 */
	static #onConfigureClassSkills(event, target) {
		const skills = this.item.system.skills;
		const choices = skills.choices && skills.choices.length ? skills.choices : Object.keys(CONFIG.DND4E.skills);
		const label = target.parentElement;

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

		// Container Item
		if ( li.dataset.itemId ) {
			const item = await this.item.getContainedItem(li.dataset.itemId);
			dragData = item?.toDragData();
		// Active Effect
		} else if ( li.dataset.effectId ) {
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
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
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
			case "Folder":
				return this._onDropFolder(event, data);
			case "Item":
				return this._onDropItem(event, data);
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
	 * Handle the dropping of Folder data onto the Container sheet.
	 * @param {DragEvent} event							The concluding DragEvent which contains the drop data.
	 * @param {object} data									The data transfer extracted from the event.
	 * @returns {Promise<Item4e[]>}					The created Item objects.
	 */
	async _onDropFolder(event, data) {
		const folder = await Folder.implementation.fromDropData(data);
		if ( !this.item.isOwner || (folder.type !== "Item") ) return [];

		let recursiveWarning = false;
		const parentContainers = await this.item.allContainers();
		const containers = new Set();

		let items = await Promise.all(folder.contents.map(async item => {
			if ( !(item instanceof Item) ) item = await fromUuid(item.uuid);
			if ( item.system.container === this.item.id ) return;
			if ( (this.item.uuid === item.uuid) || parentContainers.includes(item) ) {
				recursiveWarning = true;
				return;
			}
			if ( item.type === "container" ) containers.add(item.id);
			return item;
		}));

		items = items.filter(i => i && !containers.has(i.system.container));

		// Display recursive warning, but continue with any remaining items
		if ( recursiveWarning ) ui.notifications.warn("DND4E.ContainerRecursiveError", { localize: true });
		if ( !items.length ) return [];

		// Create any remaining items
		const toCreate = await Item4e.createWithContents(items, {
			container: this.item,
			// transformAll: itemData
			transformAll: itemData => itemData.type === "spell" ? Item4e.createScrollFromSpell(itemData) : itemData
		});
		if ( this.item.folder ) toCreate.forEach(d => d.folder = this.item.folder.id);
		return Item4e.createDocuments(toCreate, {pack: this.item.pack, parent: this.item.parent, keepId: true});
	}

	/* -------------------------------------------- */

	/**
	 * Handle the dropping of Item data onto an Item Sheet.
	 * @param {DragEvent} event							The concluding DragEvent which contains the drop data.
	 * @param {object} data									The data transfer extracted from the event.
	 * @returns {Promise<Item4e[]|boolean>}	The created Item objects or `false` if it couldn't be created.
	 * @protected
	 */
	async _onDropItem(event, data) {
		const item = await Item.implementation.fromDropData(data);
		if ( !this.item.isOwner || !item ) return false;

		// If item already exists in this container, just adjust its sorting
		if ( item.system.container === this.item.id ) {
			return this._onSortItem(event, item);
		}

		// Prevent dropping containers within themselves
		const parentContainers = await this.item.allContainers();
		if ( (this.item.uuid === item.uuid) || parentContainers.includes(item) ) {
			ui.notifications.error("DND4E.ContainerRecursiveError", { localize: true });
			return;
		}

		// If item already exists in same DocumentCollection, just adjust its container property
		if ( (item.actor === this.item.actor) && (item.pack === this.item.pack) ) {
			return item.update({folder: this.item.folder, "system.container": this.item.id});
		}

		// Otherwise, create a new item & contents in this context
		const toCreate = await Item4e.createWithContents([item], {
			container: this.item,
			transformAll: itemData => itemData.type === "spell" ? Item4e.createScrollFromSpell(itemData) : itemData
		});
		if ( this.item.folder ) toCreate.forEach(d => d.folder = this.item.folder.id);
		return Item4e.createDocuments(toCreate, {pack: this.item.pack, parent: this.item.actor, keepId: true});
	}

	/* -------------------------------------------- */

	/**
	 * Handle a drop event for an existing contained Item to sort it relative to its siblings.
	 * @param {DragEvent} event	The concluding DragEvent.
	 * @param {Item4e} item			The item that needs to be sorted.
	 * @protected
	 */
	async _onSortItem(event, item) {
		const dropTarget = event.target.closest("[data-item-id]");
		if ( !dropTarget ) return;
		const contents = await this.item.contents;
		const target = contents.get(dropTarget.dataset.itemId);

		// Don't sort on yourself
		if ( item.id === target.id ) return;

		// Identify sibling items based on adjacent HTML elements
		const siblings = [];
		for ( const el of dropTarget.parentElement.children ) {
			const siblingId = el.dataset.itemId;
			if ( siblingId && (siblingId !== item.id) ) siblings.push(contents.get(siblingId));
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(item, {target, siblings});
		const updateData = sortUpdates.map(u => {
			const update = u.update;
			update._id = u.target.id;
			return update;
		});

		// Perform the update
		Item.updateDocuments(updateData, {pack: this.item.pack, parent: this.item.actor});
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
