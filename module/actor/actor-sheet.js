import { DND4E } from "../config.js";
import { SecondWindDialog } from "../apps/second-wind.js";
import { ActionPointDialog } from "../apps/action-point.js";
import { ShortRestDialog } from "../apps/short-rest.js";
import { LongRestDialog } from "../apps/long-rest.js";
import { DeathSaveDialog } from "../apps/death-save.js";
import { SaveThrowDialog } from "../apps/save-throw.js";
import { AttributeBonusDialog } from "../apps/attribute-bonuses.js";
import { CustomRolldDescriptions } from "../apps/custom-roll-descriptions.js";
import { MovementDialog } from "../apps/movement-dialog.js";
import { EncumbranceDialog } from "../apps/encumbrance-dialog.js";
import { ItemImporterDialog} from "../apps/item-importer.js"
import { HealMenuDialog } from "../apps/heal-menu-dialog.js";
import TraitSelector from "../apps/trait-selector.js";
import TraitSelectorSense from "../apps/trait-selector-sense.js";
import TraitSelectorSave from "../apps/trait-selector-save.js";
import ConBonConfig from "../apps/con-bon-config.js";
import ListStringInput from "../apps/list-string-input.js";
// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import HPOptions from "../apps/hp-options.js";
import { Helper } from "../helper.js";
import {ActionPointExtraDialog} from "../apps/action-point-extra.js";
import Item4e from "../item/item-document.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class ActorSheet4e extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {
	#dragDrop;
	#expandedItemIds;

	get dragDrop() {
		return this.#dragDrop;
	}

	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		this._filters = {
			inventory: new Set(),
			powers: new Set(),
			features: new Set(),
			rituals: new Set()
		};

		this.#dragDrop = this.#createDragDropHandlers();
		this.#expandedItemIds = new Set();
	}

	static DEFAULT_OPTIONS = {
		classes: ["dnd4e", "sheet", "actor"],
		position: {
			width: 844,
			height: 967
		},
		window: {
			resizable: true
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false
		},
		dragDrop: [
			{dragSelector: ".item-list .item", dropSelector: null}
		],
		actions: {
			displayActorArt: ActorSheet4e.#onDisplayActorArt,
			itemSummary: ActorSheet4e.#onItemSummary,
			cycleSkillProficiency: { handler: ActorSheet4e.#onCycleSkillProficiency, buttons: [0, 2] },
			editImage: ActorSheet4e.#onEditImage,
		}
	}

	static PARTS = {
		sheet: {
			template: "systems/dnd4e/templates/actors/actor-sheet.hbs",
			scrollable: [
				".inventory .inventory-list",
				".features .inventory-list",
				".powers .inventory-list",
				".section--sidebar",
				".section--tabs-content",
				"section.tab"
			],
			templates: [
				"systems/dnd4e/templates/actors/tabs/biography.hbs",
				"systems/dnd4e/templates/actors/tabs/details.hbs",
				"systems/dnd4e/templates/actors/tabs/inventory.hbs",
				"systems/dnd4e/templates/actors/tabs/features.hbs",
				"systems/dnd4e/templates/actors/tabs/powers.hbs",
				"systems/dnd4e/templates/actors/tabs/rituals.hbs",
				"systems/dnd4e/templates/actors/tabs/effects.hbs",
				"templates/generic/tab-navigation.hbs"
			]
		}
	}

	static TABS = {
		primary: {
			tabs: [
				{id: "biography", label: "DND4E.Sheet.Biography"},
				{id: "details", label: "DND4E.Sheet.Details"},
				{id: "inventory", label: "DND4E.Sheet.Inventory"},
				{id: "features", label: "DND4E.Sheet.Features"},
				{id: "powers", label: "DND4E.Sheet.Powers"},
				{id: "rituals", label: "DND4E.Sheet.Rituals"},
				{id: "effects", label: "DND4E.Sheet.Effects"}
			],
			initial: "powers"
		}
	}

	/* -------------------------------------------- */

	_filterHelper(target, listSelector) {
		const filter = target.value.toUpperCase();
		const lists = this.element.querySelectorAll(listSelector);

		for (const list of lists) {
			const lis = list.querySelectorAll("li");
			for (const li of lis) {
				const el = li.querySelector("h4");
				const textValue = (el?.textContent || el?.innerText) ?? "";
				li.style.display = textValue.toUpperCase().includes(filter) ? "" : "none";
			}
		}
	}

	async _onRender(context, options) {
		await super._onRender(context, options);

		this.#dragDrop.forEach((d) => d.bind(this.element));

		// Removed: on focus <input>, auto-select everything in it

		this.element.querySelectorAll('input[data-dtype="Number"]').forEach(el => el.addEventListener("change", this._onChangeInputDelta.bind(this)))

		this.element.querySelector("#filterInput-feat")?.addEventListener("input", (ev) => {
			this._filterHelper(ev.target, ".feature-list");
		});

		this.element.querySelector("#filterInput-power")?.addEventListener("input", (ev) => {
			this._filterHelper(ev.target, ".power-list");
		});

		this.element.querySelector("#filterInput-ritual")?.addEventListener("input", (ev) => {
			this._filterHelper(ev.target, ".ritual-list")
		})

		// TODO: AppV2 this stuff properly (add to `DEFAULT_OPTIONS.actions` and set `data-action` on the proper elements)

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		const html = this.element;
	
		// Update Inventory Item
		html.querySelectorAll('.item-edit').forEach(el => el.addEventListener("click", event => {
			const li = event.currentTarget.closest("li.item");
			const item = this.actor.items.get(li.dataset.itemId);
			item.sheet.render(true);
		}));
	
		if ( this.actor.isOwner ) {	
			// Roll Skill Checks
			html.querySelectorAll('.skill-name').forEach(el => el.addEventListener("click", this._onRollSkillCheck.bind(this)));
	
			html.querySelectorAll('.passive-message').forEach(el => el.addEventListener("click", this._onRollPassiveCheck.bind(this)));
			
			//Roll Abillity Checks
			html.querySelectorAll('.ability-name').forEach(el => el.addEventListener("click", this._onRollAbilityCheck.bind(this)));
			
			//Roll Defence Checks
			html.querySelectorAll('.def-name').forEach(el => el.addEventListener("click", this._onRollDefenceCheck.bind(this)));
			
			//Open HP-Options
			html.querySelectorAll('.health-option').forEach(el => el.addEventListener("click", this._onHPOptions.bind(this)));
			
			//Open Skill-Bonus
			html.querySelectorAll('.skill-bonus').forEach(el => el.addEventListener("click", this._onSkillBonus.bind(this)));
			html.querySelectorAll('.death-save-bonus').forEach(el => el.addEventListener("click", this._onDeathSaveBonus.bind(this)));
			html.querySelectorAll('.roll-save-bonus').forEach(el => el.addEventListener("click", this._onSavingThrowBonus.bind(this)));
			html.querySelectorAll('.surge-bonus').forEach(el => el.addEventListener("click", this._onSurgeBonus.bind(this)));
			html.querySelectorAll('.envimental-loss-bonus').forEach(el => el.addEventListener("click", this._onSurgeEnv.bind(this)));
			html.querySelectorAll('.secondwind-bonus').forEach(el => el.addEventListener("click", this._onSecondWindBonus.bind(this)));
			html.querySelectorAll('.defence-bonus').forEach(el => el.addEventListener("click", this._onDefencesBonus.bind(this)));
			html.querySelectorAll('.init-bonus').forEach(el => el.addEventListener("click", this._onInitiativeBonus.bind(this)));
			html.querySelectorAll('.move-bonus').forEach(el => el.addEventListener("click", this._onMovementBonus.bind(this)));
			html.querySelectorAll('.passive-bonus').forEach(el => el.addEventListener("click", this._onPassiveBonus.bind(this)));
			html.querySelectorAll('.modifiers-bonus').forEach(el => el.addEventListener("click", this._onModifiersBonus.bind(this)));
			html.querySelectorAll('.resistances-bonus').forEach(el => el.addEventListener("click", this._onResistancesBonus.bind(this)));
			
			html.querySelectorAll('.movement-dialog').forEach(el => el.addEventListener("click", this._onMovementDialog.bind(this)));
			
			html.querySelectorAll('.custom-roll-descriptions').forEach(el => el.addEventListener("click", this._onCustomRolldDescriptions.bind(this)));
			
			//second wind
			html.querySelectorAll('.second-wind').forEach(el => el.addEventListener("click", this._onSecondWind.bind(this)));
	
			// heal menu
			html.querySelectorAll('.heal-menu').forEach(el => el.addEventListener("click", this._onHealMenuDialog.bind(this)));
	
			//action point
			html.querySelectorAll('.action-point').forEach(el => el.addEventListener("click", this._onActionPointDialog.bind(this)));
			html.querySelectorAll('.action-point-extra').forEach(el => el.addEventListener("click", this._onActionPointExtraDialog.bind(this)));
			
			//short rest
			html.querySelectorAll('.short-rest').forEach(el => el.addEventListener("click", this._onShortRest.bind(this)));
			
			//long rest
			html.querySelectorAll('.long-rest').forEach(el => el.addEventListener("click", this._onLongRest.bind(this)));		
			
			//death save
			html.querySelectorAll('.death-save').forEach(el => el.addEventListener("click", this._onDeathSave.bind(this)));
			html.querySelectorAll('.roll-save').forEach(el => el.addEventListener("click", this._onSavingThrow.bind(this)));
	
			//roll init
			html.querySelectorAll('.rollInitiative').forEach(el => el.addEventListener("click", this._onrollInitiative.bind(this)));
			
			// Trait Selector
			html.querySelectorAll('.trait-selector').forEach(el => el.addEventListener("click", this._onTraitSelector.bind(this)));
			html.querySelectorAll('.trait-selector-weapon').forEach(el => el.addEventListener("click", this._onTraitSelectorWeapon.bind(this)));
			html.querySelectorAll('.trait-selector-senses').forEach(el => el.addEventListener("click", this._onTraitSelectorSense.bind(this)));
			html.querySelectorAll('.list-string-input').forEach(el => el.addEventListener("click", this._onListStringInput.bind(this)));
			
			//save throw bonus
			html.querySelectorAll('.trait-selector-save').forEach(el => el.addEventListener("click", this._onTraitSelectorSaveThrow.bind(this)));
			
			//Inventory & Item management
			html.querySelectorAll('.item-create').forEach(el => el.addEventListener("click", this._onItemCreate.bind(this)));
			html.querySelectorAll('.item-edit').forEach(el => el.addEventListener("click", this._onItemEdit.bind(this)));
			html.querySelectorAll('.item-delete').forEach(el => el.addEventListener("click", this._onItemDelete.bind(this)));
			html.querySelectorAll('.item-uses input').forEach(el => el.addEventListener("change", this._onUsesChange.bind(this)));


			html.querySelectorAll('.power-create').forEach(el => el.addEventListener("click", this._onPowerItemCreate.bind(this)));
	
			html.querySelectorAll('.item-import').forEach(el => el.addEventListener("click", this._onItemImport.bind(this)));
	
			// Active Effect management
			// html.find(".effect-control").click(event => onManageActiveEffect(event, this.actor));
			html.querySelectorAll('.effect-control').forEach(el => el.addEventListener("click", event => ActiveEffect4e.onManageActiveEffect(event, this.actor)));
				
			// Item State Toggling
			html.querySelectorAll('.item-toggle').forEach(el => el.addEventListener("click", this._onToggleItem.bind(this)));
		
			//convert currency to it's largest form to save weight.
			html.querySelectorAll('.currency-convert').forEach(el => el.addEventListener("click", this._onConvertCurrency.bind(this)));
			
			// Item Rolling
			html.querySelectorAll('.item .item-image').forEach(el => el.addEventListener("click", event => this._onItemRoll(event)));
			html.querySelectorAll('.item .item-image').forEach(el => {
				el.addEventListener("mouseenter", this._onItemHoverEntry.bind(this));
				el.addEventListener("mouseleave", this._onItemHoverExit.bind(this));
			});
			html.querySelectorAll('.item .item-recharge').forEach(el => el.addEventListener("click", event => this._onItemRecharge(event)));
	
			// Effect-Specific Saves
			html.querySelectorAll('.effect-save').forEach(el => el.addEventListener("click", event => this._onRollEffectSave(event)));
	
			// Load Options
			html.querySelectorAll('.encumbrance-options').forEach(el => el.addEventListener("click", this._onEncumbranceDialog.bind(this)));
			
			// Conditional Attack Mod Config
			html.querySelectorAll('.con-bon-config').forEach(el => el.addEventListener("click", this._onConBonConfig.bind(this)));
			
			// Context Menus
			new foundry.applications.ux.ContextMenu.implementation(html, ".item-list .item", [], {onOpen: this._onItemContext.bind(this)});
		}
	
		//Disabels and adds warning to input fields that are being modfied by active effects
		for ( const override of this._getAllActorOverrides(["system.details.surges.value"]) ) {
			html.querySelectorAll(`input[name="${override}"],select[name="${override}"]`).forEach((el) => {
				el.disabled = true;
				el.dataset.tooltip = "DND4E.ActiveEffectOverrideWarning";
			});
		}
	}
	_initializeApplicationOptions(options) {
		options = super._initializeApplicationOptions(options);
		const numCustomSkills = game.settings.get("dnd4e", "custom-skills")?.length;
		if (numCustomSkills) {
			options.position.height += numCustomSkills * 27;
		}
		return options;
	}

	#createDragDropHandlers() {
		return (this.options.dragDrop ?? []).map((d) => {
			d.permissions = {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			};
			d.callbacks = {
				dragstart: this._onDragStart.bind(this),
				dragover: this._onDragOver.bind(this),
				drop: this._onDrop.bind(this),
			};
			return new foundry.applications.ux.DragDrop.implementation(d);
		});
	}

	_onDragStart(event) {
		const docRow = event.currentTarget.closest("li");
		if ("link" in event.target.dataset) return;

		if (!docRow) return;

		const dragData = this._getEmbeddedDocument(docRow)?.toDragData();
		if (!dragData) return;

		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
	}

	_getEmbeddedDocument(target) {
		const docRow = target.closest("li[data-item-id], li[data-effect-id]");
		if (!docRow) return;
		if (docRow.dataset.itemId) {
			return this.document.items.get(docRow.dataset.itemId);
		} else {
			const parentId = docRow.dataset.parentId;
			const parent =
				parentId && (parentId !== this.document.id)
					? this.document.items.get(parentId)
					: this.document;
			return parent.effects.get(docRow.dataset.effectId);
		}
	}

  /* -------------------------------------------- */

  /**
   * A set of item types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
   static unsupportedItemTypes = new Set();

  /* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const actor = this.actor.toObject(false);
		const actorData = actor.system;

		const isOwner = actor.isOwner;

		foundry.utils.mergeObject(context, {
			owner: isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: isOwner ? "editable" : "locked",
			isCharacter: actor.type === "Player Character",
			isNPC: actor.type === "NPC",
			isCreature: ["NPC","Player Character"].includes(actor.type),
			isCombatant: ["NPC","Player Character","Hazard"].includes(actor.type),
			hasWealth: ["NPC","Player Character"].includes(actor.type),
			hasSpeed: ["NPC","Player Character"].includes(actor.type),
			config: CONFIG.DND4E,
			// rollData: this.actor.getRollData(),
			actor,
			actorData,
			system: actorData
		});

		context.items = actor.items
			.filter(i => !this.actor.items.has(i.system.container))
			.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		for (let i of context.items) {
			const item = this.actor.items.get(i._id);
			i.labels = item.labels;
			i.chatData = await item.getChatData({secrets: this.actor.isOwner})
			if (item.type === "power" && item.system.autoGenChatPowerCard) {
				let attackBonus = null;
				if(item.hasAttack){
					attackBonus = await item.getAttackBonus();
				}
				let detailsText = Helper._preparePowerCardData(i.chatData, CONFIG, this.actor, attackBonus);
				i.detailsText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(detailsText, {
					async: true,
					relativeTo: this.actor
				});
			}
			i.collapsed = !this.#expandedItemIds.has(i._id); 
		}

		this._prepareItems(context);

		context.effects = ActiveEffect4e.prepareActiveEffectCategories(this.actor.getActiveEffects());

		if (context.isCombatant) {
			if(Object.entries(game.dnd4e.config.coreSkills).length != Object.entries(actorData.skills).length){
				const skillNames = Object.keys(actorData.skills);

				// Sort the skill names based on the label property
				skillNames.sort((a, b) => actorData.skills[a].label?.localeCompare(actorData.skills[b].label));
				
				const sortedSkills = skillNames.reduce((acc, skillName) => {
				  acc[skillName] = actorData.skills[skillName];
				  return acc;
				}, {});
				
				actorData.skills = sortedSkills;
			}

			for ( let [s, skl] of Object.entries(actorData.skills)) {
				// skl.ability = actorData.abilities[skl.ability].label.substring(0, 3).toLowerCase(); //what was this even used for again? I think it was some cobweb from 5e, can probably be safly deleted
				skl.icon = this._getTrainingIcon(skl.training);
				skl.hover = game.i18n.localize(DND4E.trainingLevels[skl.training]);
				skl.label = skl.label ? skl.label: DND4E.skills[s]?.label;
			}
			
			this._prepareDataSave(actorData.details,
				{"saves": CONFIG.DND4E.saves}
			);
		}

		if (context.isCharacter) {
			this._prepareDataProfs(actorData.details?.armourProf,
				{"profArmor": CONFIG.DND4E.profArmor}
			);
			this._prepareDataProfs(actorData.details?.weaponProf,
				{ weapons:Object.assign(
					CONFIG.DND4E.weaponProficiencies,
					CONFIG.DND4E.simpleM,
					CONFIG.DND4E.simpleR,
					CONFIG.DND4E.militaryM,
					CONFIG.DND4E.militaryR,
					CONFIG.DND4E.superiorM,
					CONFIG.DND4E.superiorR,
					CONFIG.DND4E.improvisedM,
					CONFIG.DND4E.improvisedR
				)}
			);
			this._prepareDataProfs(actorData.details?.implementProf, 
			{ implement:Object.assign(
					CONFIG.DND4E.implementProficiencies
				)}
			);
			// Resources
			actorData.resources = ["primary", "secondary", "tertiary"].reduce((obj, r) => {
				const res = actorData.resources[r] || {};
				res.name = r;
				res.placeholder = game.i18n.localize("DND4E.Resource"+r.titleCase());
				if (res.max <= 0 && !res.label) {
					delete res.max;
					delete res.value;
				} else if (res.value < 0) {
					res.value = 0;
				}
				obj[r] = res
				return obj;
			}, {});
		}

		if (context.hasWealth) {
			context.currencyGoldSum = this._currencyGoldSumLabel();
		}

		if (context.isCreature) {
			actorData.size = DND4E.actorSizes;

			this._prepareDataSense(actorData.senses,
				{"vision": CONFIG.DND4E.vision, "special": CONFIG.DND4E.special}
			);
			
			this._prepareDataTraits(actorData.languages, 
				{"spoken": CONFIG.DND4E.spoken, "script": CONFIG.DND4E.script}
			);
	
			context.biographyHTML = await TextEditor.enrichHTML(context.system.biography, {
				secrets: isOwner,
				async: true,
				relativeTo: this.actor
			});
		}

		if (context.hasSpeed) {
			this._prepareMovement(context);
		}

		context.system = actorData;

		return context;
	}
	
	_prepareDataTraits(data, map) {
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = choices[l];
				return obj;
			}, {});

			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
		}
	}

	_prepareDataProfs(data, map){
		for ( let [l, choices] of Object.entries(map) ) {

			let values = [];
			if ( data.value ) {
				values = data.value instanceof Array ? data.value : [data.value];
			}
			data.selected = values.reduce((obj, l) => {
				obj[l] = choices[l];
				return obj;
			}, {});
			data.selected

			// Add custom entry
			if ( data.custom ) {
				data.custom.split(";").forEach((c, i) => data.selected[`custom${i+1}`] = c.trim());
			}
			data.cssClass = !foundry.utils.isEmpty(data.selected) ? "" : "inactive";
		}
	}

	_prepareItems(data) {
		//define different item datasets
		const inventory = this.#configItemToDisplayConfig(DND4E.inventoryTypes);
		const features = this.#configItemToDisplayConfig(DND4E.featureTypes);
		const powers = this._generatePowerGroups();
		const rituals = this.#configItemToDisplayConfig(DND4E.ritualTypes);
		
		// Partition items by category
		let [items, pow, feats, rits] = data.items.reduce((arr, item) => {
			// Item details
			item.img = item.img || DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.system.quantity) && (item.system.quantity !== 1);

			// Item usage
			item.hasUses = item.system.uses && (item.system.preparedMaxUses > 0);
			// item.isOnCooldown = item.system.recharge && !!item.system.recharge.value && (item.system.recharge.charged === false);
			item.isDepleted = item.isOnCooldown && (item.system.uses?.per && (item.system.uses?.value > 0));
			//Causing error in v10, only getter no setter now.
			// item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));
			// item.hasTarget = !!item.system.target && !(["none",""].includes(item.system.target.type));

			// Item toggle state
			this._prepareItemToggleState(item);

			// Classify items into types
			if ( Object.keys(inventory).includes(item.type ) ) arr[0].push(item);
			// else if ( Object.keys(powers).includes(item.type ) ) arr[1].push(item);
			else if ( item.type === "feature" ) arr[2].push(item);
			else if ( item.type === "ritual" ) arr[3].push(item);
			else if ( item.type === "power" ) arr[1].push(item);
			return arr;
		}, [[], [], [], [], []]);

		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);
		pow = this._filterItems(pow, this._filters.powers);
		feats = this._filterItems(feats, this._filters.features);
		rits = this._filterItems(rits, this._filters.rituals);

		// Organize items
		for ( let i of items ) {
			const item = this.actor.items.get(i._id);
			i.system.quantity = i.system.quantity || 0;
			i.system.weight = i.system.weight || 0;
			i.totalWeightLable = item.totalWeight.toNearest(0.01);
			inventory[i.type].items.push(i);
		}

		for ( let f of feats ) {
			features[f.system.featureType].items.push(f);
		}

		for ( let p of pow ) {
			powers[this._groupPowers(p,powers)].items.push(p);
		}
		for ( let r of rits ) {
			rituals[r.system.category].items.push(r);
		}

		data.inventory = Object.values(inventory);
		data.powers = Object.values(powers);
		data.features = Object.values(features);
		data.rituals = Object.values(rituals);

		for (const [key, group] of Object.entries(powers)) {
			group.items?.forEach(item => {
				this._preparePowerRangeText(item);
				this._checkPowerAvailable(item);
			});
		}

		this._sortinventory(inventory);
		this._sortPowers(powers);
		this._sortFeatures(features);
		this._sortRituals(rituals);

	}
	
	_prepareMovement(data) {
		if (!data.hasSpeed) return;
		data.moveTitle = `<p style="text-align:left">
${parseInt(data.system.movement.walk.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedWalking")}
<br>${parseInt(data.system.movement.charge.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedCharging")}
<br>${parseInt(data.system.movement.run.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedRunning")}
<br>${parseInt(data.system.movement.shift.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedShifting")}`;
		if(data.system.movement.burrow.value) data.moveTitle += `<br>${parseInt(data.system.movement.burrow.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedBurrowing")}`;
		if(data.system.movement.climb.value) data.moveTitle += `<br>${parseInt(data.system.movement.climb.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedClimbing")}`;
		if(data.system.movement.fly.value) data.moveTitle += `<br>${parseInt(data.system.movement.fly.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedFlying")}`;
		if(data.system.movement.swim.value) data.moveTitle += `<br>${parseInt(data.system.movement.swim.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedSwimming")}`
		if(data.system.movement.teleport.value) data.moveTitle += `<br>${parseInt(data.system.movement.teleport.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedTeleporting")}`;

		if(data.system.movement.custom){
			const moveCustom = [];
			data.system.movement.custom.split(";").forEach((c, i) => (c ? moveCustom[i] = c.trim() : null) );
			data.system.moveCustom = moveCustom;
			moveCustom.forEach((c) => data.moveTitle += `<br>${c.trim()}`);
		}
		if(data.system.movement.ignoredDifficultTerrain){
			data.system.movement.ignoredDifficultTerrain.forEach((t) => {
				const terrainLabel = CONFIG.DND4E.ignoredDifficultTerrainTypes[t].label;
				data.moveTitle += `<br>${terrainLabel}`
			})
		}
	}	

	_compareValues(key, order = 'asc') {
		return function innerSort(a, b) {
			if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {	
				let varA;
				let varB;
				if (DND4E.sortValues[key]) {
					varA = DND4E.sortValues[key][a[key]];
					varB = DND4E.sortValues[key][b[key]];
				}
				else {
					varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
					varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
				}
	
				let comparison = 0;
				if (varA > varB) {
					comparison = 1;
				}
				else if (varA < varB) {
					comparison = -1;
				}
				else if( varA === varB){
					comparison = a.name.toUpperCase().localeCompare(b.name.toUpperCase());
				}
				return (order === 'desc') ? (comparison * -1) : comparison;
			} else if (a.system.hasOwnProperty(key) && b.system.hasOwnProperty(key)) {
				let varA;
				let varB;
				if (DND4E.sortValues[key]) {
					varA = DND4E.sortValues[key][a.system[key]];
					varB = DND4E.sortValues[key][b.system[key]];
				}
				else {
					varA = (typeof a.system[key] === 'string') ? a.system[key].toUpperCase() : a.system[key];
					varB = (typeof b.system[key] === 'string') ? b.system[key].toUpperCase() : b.system[key];
				}
				let comparison = 0;
				if (varA > varB) {
					comparison = 1;
				}
				else if (varA < varB) {
					comparison = -1;
				}
				else if( varA === varB){
					// comparison = a.name.toUpperCase().localeCompare(b.name.toUpperCase());
					if(a.sort > b.sort) comparison = 1;
					else if(a.sort < b.sort) comparison = -1;
				}
				return (order === 'desc') ? (comparison * -1) : comparison;
			}
			return 0;

		};
	};

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * Overriders core to fix some minnor issues
   * @param {Event} event
   * @param {Object} itemData
   * @Override
   */
	_onSortItem(event, itemData) {

		// Get the drag source and its siblings
		const source = this.actor.items.get(itemData._id);
		const siblings = this.actor.items.filter(i => {
			return (i.type === source.type) && (i._id !== source._id);
		});

		// Get the drop target
		const dropTarget = event.target.closest("[data-item-id]");
		const targetId = dropTarget ? dropTarget.dataset.itemId : null;
		const target = siblings.find(s => s._id === targetId);

		// Ensure we are only sorting like-types
		if (!target || (source.type !== target.type)) return; // changed from if (target && (source.data.type !== target.data.type)) return;

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings, sortBefore: (source.sort > target.sort)}); //Changed from const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings});
		const updateData = sortUpdates.map(u => {
			const update = u.update;
			update._id = u.target._id;
			return update;
		});

		// Perform the update
		return this.actor.updateEmbeddedDocuments("Item", updateData);
	}

	/* -------------------------------------------- */

	_sortinventory(inventory) {
		const sort = this.document.system.featureSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(inventory)) {
			group.items.sort((a,b) => a.sort - b.sort);
		}
	}

	/* -------------------------------------------- */

	_sortFeatures(features) {
		const sort = this.document.system.featureSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(features)) {
			group.items.sort(this._compareValues(sort));
		}
	}

	/* -------------------------------------------- */

	_sortPowers(powers) {
		const sort = this.document.system.powerSortTypes || "actionType";
		for (const [keyy, group] of Object.entries(powers)) {
			if(sort === "none"){
				group.items.sort((a,b) => a.sort - b.sort);
			} else {
				group.items.sort(this._compareValues(sort));
			}
		}
	}
	
	_sortRituals(rituals) {
		const sort = this.document.system.ritualSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(rituals)) {
			group.items.sort(this._compareValues(sort));
		}
	}

	/* -------------------------------------------- */

	_groupPowers(power, powerGroups) {
		if(this.document.system.powerGroupTypes === "action" || !this.document.system.powerGroupTypes) {
			if(Object.keys(powerGroups).includes(power.system.actionType) ) return power.system.actionType;
		}
		else if(this.document.system.powerGroupTypes === "actionMod") {
			if(power.system.trigger){
				return "triggered";
			}
			else if(Object.keys(powerGroups).includes(power.system.actionType)){
				return power.system.actionType;
			}	
			return "other";
		}
		else if(this.document.system.powerGroupTypes === "type") {
			if(Object.keys(powerGroups).includes(power.system.powerType) )return power.system.powerType;
		}
		else if(this.document.system.powerGroupTypes === "powerSubtype") {
			if(Object.keys(powerGroups).includes(power.system.powerSubtype) )return power.system.powerSubtype;
		}
		else if(this.document.system.powerGroupTypes === "usage") {
			if(Object.keys(powerGroups).includes(power.system.useType) ) return power.system.useType;
		}
		return "other";
	}

	_generatePowerGroups() {
		const actorData = this.document.system;
		const powerGroupTypes = actorData.powerGroupTypes ?? "usage"
		const groups = DND4E.powerGroupings[powerGroupTypes] ?? DND4E.powerGroupings["usage"]  // paranoid defensive, but ensure we always return something
		return this.#configItemToDisplayConfig(groups)
	}

	#configItemToDisplayConfig = (config) => {
		const displayConfig = {}
		for (const [key, value] of Object.entries(config)) {
			displayConfig[key] = {
				...value,
				items: [],
				dataset: {type: key}
			}
		}
		return displayConfig
	}

	_checkPowerAvailable(itemData) {
		if( (!itemData.system.uses.value && itemData.system.preparedMaxUses) || !itemData.system.prepared) {
			itemData.system.notAvailable = true;
		}
		
		//If there's a consumed asset, check its availability	
		const consume = itemData.system.consume || {};
		if ( consume.type && consume.target && consume.amount) {
			//console.debug(`${itemData.name} has consume type and target: ${consume.type} ${consume.target}`);
			const actor = this.actor;
			const amount =  parseInt(consume.amount) || parseInt(consume.amount) === 0 ? parseInt(consume.amount) : 0;

			// Identify the consumed resource and its quantity
			let consumed = null;
			let quantity = 0;
			switch ( consume.type ) {
				case "resource":
				case "attribute":
					consumed = foundry.utils.getProperty(actor.system, consume.target);
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

			// Mark unavailable is the needed resource is insufficient
			if ( ![null, undefined].includes(consumed) ) {
				let remaining = quantity - amount;
				if ( remaining < 0) {
					itemData.system.notAvailable = true;
				}
			}
		}			
	
	}
  /* -------------------------------------------- */
	/**
   * A helper method to generate the text for the range of difrent powers
   * @param {itemData} itemData
   * @private
   */
	 _preparePowerRangeText(itemData) {

		const C = CONFIG.DND4E; 
		let area;
		if(itemData.system.area) {
			try{
				let areaForm = game.helper.commonReplace(`${itemData.system.area}`, this.actor);
				area = Roll.safeEval(areaForm);
			} catch (e) {
				area = itemData.system.area;
			}
		} else {
			area = 0;
		}

		if(itemData.system.rangeType === "range") {
			itemData.system.rangeText = `${C.rangeType.range.label} ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = C.rangeType.range.abbr
			itemData.system.rangeTextBlock = `${itemData.system.rangePower}`
			if(itemData.system.range.long) {
				itemData.system.rangeText += `/${itemData.system.range.long}`
				itemData.system.rangeTextBlock += `/${itemData.system.range.long}`
			}
		} else if(itemData.system.rangeType === "closeBurst") {
			itemData.system.rangeText = `${C.rangeType.closeBurst.label} ${area}`
			itemData.system.rangeTextShort = C.rangeType.closeBurst.abbr
			itemData.system.rangeTextBlock = `${area}`
		} else if(itemData.system.rangeType === "rangeBurst") {
			itemData.system.rangeText = `${C.rangeType.rangeBurst.label} ${area} ${game.i18n.localize('DND4E.RangeWithin')} ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = C.rangeType.rangeBurst.abbr
			itemData.system.rangeTextBlock = `${area}(${itemData.system.rangePower})`
		} else if(itemData.system.rangeType === "closeBlast") {
			itemData.system.rangeText = `${C.rangeType.closeBlast.label} ${area}`
			itemData.system.rangeTextShort = C.rangeType.closeBlast.abbr
			itemData.system.rangeTextBlock = `${area}`
		} else if(itemData.system.rangeType === "rangeBlast") {
			itemData.system.rangeText = `${C.rangeType.rangeBlast.label} ${area} ${game.i18n.localize('DND4E.RangeWithin')} ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = C.rangeType.rangeBlast.abbr
 			itemData.system.rangeTextBlock = `${area}(${itemData.system.rangePower})`
		} else if(itemData.system.rangeType === "wall") {
			itemData.system.rangeText = `${C.rangeType.wall.label} ${area} ${game.i18n.localize('DND4E.RangeWithin')} ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = C.rangeType.wall.abbr
			itemData.system.rangeTextBlock = `${area}(${itemData.system.rangePower})`
		} else if(itemData.system.rangeType === "personal") {
			itemData.system.rangeText = C.rangeType.personal.label
			itemData.system.rangeTextShort = C.rangeType.personal.abbr
		} else if(itemData.system.rangeType === "special") {
			itemData.system.rangeText = C.rangeType.special.label
			itemData.system.rangeTextShort = C.rangeType.special.abbr
		} else if(itemData.system.rangeType === "touch") {
			itemData.system.rangeTextShort = C.rangeType.touch.abbr;
			itemData.system.rangeText = C.rangeType.touch.label;
		} else if(itemData.system.rangeType === "melee"){
			itemData.system.rangeTextShort = C.rangeType.melee.abbr;
			if(itemData.system.rangePower === undefined || itemData.system.rangePower === null){
				itemData.system.rangeText = C.rangeType.melee.label;
			} else {
				itemData.system.rangeText = `${C.rangeType.melee.label} ${itemData.system.rangePower}`;
				itemData.system.rangeTextBlock = `${itemData.system.rangePower}`
			}
		} else if(itemData.system.rangeType === "reach"){
			itemData.system.rangeText = `${C.rangeType.reach.label} ${itemData.system.rangePower}`;
			itemData.system.rangeTextShort = C.rangeType.reach.abbr;
			itemData.system.rangeTextBlock = `${itemData.system.rangePower}`
			
		} else if(itemData.system.rangeType === "weapon") {

			try {
				const weaponUse = Helper.getWeaponUse(itemData.system, this.actor);
				if(weaponUse.system.isRanged) {
					itemData.system.rangeText = `${game.i18n.localize('DND4E.rangeWeaponRanged')} - ${weaponUse.name}`
					itemData.system.rangeTextShort = game.i18n.localize('DND4E.rangeWeaponRangedAbbr')
					itemData.system.rangeTextBlock = `${weaponUse.system.range.value}/${weaponUse.system.range.long}`
				} else {
					itemData.system.rangeText = `${game.i18n.localize('DND4E.rangeWeaponMelee')} - ${weaponUse.name}`;
					itemData.system.rangeTextShort = game.i18n.localize('DND4E.rangeWeaponMeleeAbbr');
					
					if(itemData.system.rangePower == null){
						itemData.system.rangeTextBlock = (weaponUse.system.properties.rch ? '2' : '')
					} else {
						itemData.system.rangeTextBlock = `${itemData.system.rangePower}`;
					}
				}

			} catch {
				itemData.system.rangeText = "Weapon";
				itemData.system.rangeTextShort = game.i18n.localize('DND4E.rangeWeaponMeleeAbbr')
				itemData.system.rangeTextBlock = `${itemData.system.rangePower}`

				if(itemData.system.rangePower == null){
					itemData.system.rangeTextBlock = '';
				} else {
					itemData.system.rangeTextBlock = `${itemData.system.rangePower}`;
				}
			}

		} else {
			itemData.system.rangeText = game.i18n.localize("DND4E.NotAvalible");
			itemData.system.rangeTextShort = game.i18n.localize("DND4E.NotAvalibleShort");
		}
	}
  /* -------------------------------------------- */

  /**
   * A helper method to establish the displayed preparation state for an item
   * @param {Item} item
   * @private
   */
  _prepareItemToggleState(item) {
	const power = ["power","atwill","encounter","daily","utility"];
	if (power.includes(item.type)) {
	  // const isAlways = foundry.utils.getProperty(item.data, "preparation.mode") === "always";
	  const isPrepared =  foundry.utils.getProperty(item.system, "prepared");
	  item.toggleClass = isPrepared ? "active" : "";
	  // if ( isAlways ) item.toggleClass = "fixed";
	  // if ( isAlways ) item.toggleTitle = CONFIG.DND4E.spellPreparationModes.always;
	  // else if ( isPrepared ) item.toggleTitle = CONFIG.DND4E.spellPreparationModes.prepared;
	  if ( isPrepared ) item.toggleTitle = game.i18n.localize("DND4E.PowerPrepared");
	  else item.toggleTitle = game.i18n.localize("DND4E.PowerUnPrepared");
	}
	else {
	  const isActive = foundry.utils.getProperty(item.system, "equipped");
	  item.toggleClass = isActive ? "active" : "";
	  item.toggleTitle = game.i18n.localize(isActive ? "DND4E.Equipped" : "DND4E.Unequipped");
	}
  }
	_prepareDataSense(data, map) {
		
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = l[1] != "" ? `${choices[l[0]]} ${l[1]} sq` : choices[l[0]];
				return obj;
			}, {});
			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
			
		}
	}
	_prepareDataSave(data, map) {
		
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = l[1] > 0 ? `${choices[l[0]]} +${l[1]}` : l[1] != "" ? `${choices[l[0]]} ${l[1]}` : choices[l[0]];
				// obj[l] = l[1] != "" ? `${choices[l[0]]} ${l[1]}` : choices[l[0]];
				return obj;
			}, {});
			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
			
		}
	}
	
  /* -------------------------------------------- */

  /**
   * Determine whether an Owned Item will be shown based on the current set of filters
   * @return {boolean}
   * @private
   */
  _filterItems(items, filters) {
	return items.filter(item => {
	  const system = item.system;

	  // Action usage
	  for ( let f of ["action", "bonus", "reaction"] ) {
		if ( filters.has(f) ) {
		  if ((system.activation && (system.activation.type !== f))) return false;
		}
	  }

	  // Equipment-specific filters
	  if ( filters.has("equipped") ) {
		if ( system.equipped !== true ) return false;
	  }
	  return true;
	});
  }	

	_getTrainingIcon(level) {
		const icons = {
			0: '<i class="far fa-circle"></i>',
			5: '<i class="fas fa-check"></i>',
			8: '<i class="fas fa-check-double"></i>'
			};
		return icons[level];
	}
	
	/* -------------------------------------------- */
	/**
	 * Retrieve the list of fields that are currently modified by Active Effects on the Actor.
	 * @returns {string[]}
	 * @protected
	 */
	_getActorOverrides() {
		return Object.keys(foundry.utils.flattenObject(this.document.overrides || {}));
	}


		/* -------------------------------------------- */
	/**
	 * Retrieve the list of fields that are directly modified by Active Effects, or indirectly modified via feat, item etc. bonuses.
	 * @param excluded Array of candidate keys to exclude.
	 * @returns {string[]}
	 */
	_getAllActorOverrides(excluded = []) {
		const overrides = new Set(this._getActorOverrides());
		const actorKeys = new Set(Object.keys(foundry.utils.flattenObject(this.actor)));
		const candidateKeys = new Set();
		const accumulatorSuffixes = [".value", ".max"]; // Suffixes used for the accumulation of feat, item etc. bonuses.
		const bonusSuffixes = [/.feat$/, /.item$/, /.power$/, /.race$/, /.untyped$/]; // Suffixes for bonuses.

		// Construct a list of candidate keys
		for (const key of overrides) {
			for (const bonus of bonusSuffixes) {
				// accumulatorSuffixes.forEach(accumulator => candidateKeys.add(key.replace(bonus, accumulator)));
				if(key.includes("system.attributes.hp.")){ //Exception for HP as to not block 
					candidateKeys.add(key.replace(bonus, ".max"));
				} else {
					accumulatorSuffixes.forEach(accumulator => candidateKeys.add(key.replace(bonus, accumulator)));
				}
			}
		}

		// Remove excluded keys
		for (const key of excluded) {
			candidateKeys.delete(key);
		}

		// Return keys that exist in the actor
		return Array.from(overrides.union(candidateKeys).intersection(actorKeys));
	}

	/* -------------------------------------------- */

	/**
	 * Handle input changes to numeric form fields, allowing them to accept delta-typed inputs
	 * @param event
	 * @private
	 */
	_onChangeInputDelta(event) {
		const input = event.target;
		const value = input.value;

		if(/^[0-9]+$/.test(value)) {
			return;
		}
		
		if(!/^[\-=+ 0-9]+$/.test(value)) {
			input.value = foundry.utils.getProperty(this.actor, input.name)
			return;
		}

		if ( ["+"].includes(value[0]) ) {
			let delta = parseFloat(value.replace(/[^0-9]/g, ""));
			input.value = foundry.utils.getProperty(this.actor, input.name) + delta || foundry.utils.getProperty(this.actor, input.name);
		}
		else if ( ["-"].includes(value[0]) ) {
			let delta = parseFloat(-value.replace(/[^0-9]/g, ""));
			input.value = foundry.utils.getProperty(this.actor, input.name) + delta || foundry.utils.getProperty(this.actor, input.name);
		} else if ( value[0] === "=" ) {
			input.value = value.replace(/[^\-0-9]/g, "");
		} else{
			input.value = foundry.utils.getProperty(this.actor, input.name)
		}
	}

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to its roll method
   * @private
	 * @this {ActorSheet4e}
   */
	static async #onItemSummary(event, target) {
		event.preventDefault();
		if (!this.options.viewPermission) return;
		const li = target.closest(".item");
		if (li) {
			li.classList.toggle("collapsed");
			if (li.classList.contains("collapsed")) {
				this.#expandedItemIds.delete(li.dataset.itemId);
			} else {
				this.#expandedItemIds.add(li.dataset.itemId);
			}
		}
	}

  /* -------------------------------------------- */

	static #onDisplayActorArt() {
		const p = new foundry.applications.apps.ImagePopout({src: this.document.img});
		p.render(true);
	}
  
  /* -------------------------------------------- */

	static async #onEditImage() {
		const defaultArtwork = this.document.constructor.getDefaultArtwork?.(this.document._source) ?? {};
		const defaultImage = foundry.utils.getProperty(defaultArtwork, 'img');
		const fp = new CONFIG.ux.FilePicker({
			current: this.document.img,
			type: 'image',
			redirectToRoot: defaultImage ? [defaultImage] : [],
			callback: (path) => this.document.update({ img: path }),
			top: this.position.top + 40,
			left: this.position.left + 10
		});
		await fp.browse();
	}

  /* -------------------------------------------- */

  /**
   * Handle toggling the state of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  _onToggleItem(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		const power = ["power","atwill","encounter","daily","utility"];
		const attr = power.includes(item.type) ? "system.prepared" : "system.equipped";
		return item.update({[attr]: !foundry.utils.getProperty(item, attr)});
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
	_onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		const subType = header.dataset?.subtype || null;
		const itemData = {
			name: game.i18n.format("DND4E.ItemNew", {type: type.capitalize()}),
			type: type,
			system: foundry.utils.duplicate(header.dataset)
		};
		if(type === 'feature' && subType){
			itemData.system.featureType = subType;
		}else if(type === 'ritual' && subType){
			itemData.system.category = subType;
		}
		//console.debug(itemData)
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	_onItemImport(event) {
		event.preventDefault();
		new ItemImporterDialog(this.actor).render(true);
	}

	_onPowerItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		const itemData = {
			name: `${game.i18n.format("DND4E.ItemNew", {type: type.capitalize()})} Power`,
			type: "power",
			system: foundry.utils.duplicate(header.dataset)
		};

		if(this.document.system.powerGroupTypes === "action" || !this.document.system.powerGroupTypes) {
			itemData.system.actionType = type;
		}
		else if(this.document.system.powerGroupTypes === "type") {
			itemData.system.powerType = type;
		}
		else if(this.document.system.powerGroupTypes === "usage") {
			itemData.system.useType = type;
			if(["encounter", "daily", "recharge", "item"].includes(type)) {
				itemData.system.uses = {
					value: 1,
					max: 1,
					per: ["encounter", "charges", "round"].includes(type)  ? "enc" : "day"
					// per: type === "encounter" ? "enc" : "day"
				};
			}
		}

		itemData.system.autoGenChatPowerCard = game.settings.get("dnd4e", "powerAutoGenerateLableOption");
		
		if(this.actor.type === "NPC"){
			
			itemData.system.weaponType = "none";
			itemData.system.weaponUse = "none";

			itemData.system.attack = {
				formula:"5 + @atkMod",
				ability:"form"
			};
			itemData.system.hit  = {
				formula:"@powBase + @dmgMod",
				critFormula:"@powMax",
				baseDiceType: "d8",
				detail: "1d8 damage."
			};
		}

		if(game.settings.get("dnd4e", "halfLevelOptions")){
			if(this.actor.type === "NPC"){
				itemData.system.attack.formula = ""; 
			} else {
				itemData.system.attack = {
					formula:"@wepAttack + @powerMod + @atkMod"
				}
			}
		}
		
		console.log(itemData)
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemEdit(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		item.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		if ( item )  {
			let shouldDelete = true;
			if (game.settings.get("dnd4e", "itemDeleteConfirmation")) {
				shouldDelete = await foundry.applications.api.Dialog.confirm({
					window: {
						title: game.i18n.format("DND4E.DeleteConfirmTitle", {name: item.name}),
					},
					content: game.i18n.format("DND4E.DeleteConfirmContent", {name: item.name}),
					yes: {default: true}
				});
			}
			if (shouldDelete) return item.delete();
		}
  }
  
  /* -------------------------------------------- */

  /**
   * Change the uses amount of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
	async _onUsesChange(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		const uses = Math.clamp(0, parseInt(event.target.value), item.system.preparedMaxUses);
		event.target.value = uses;
		return item.update({ 'system.uses.value': uses });
	}
  
	/* -------------------------------------------- */
  
	/**
	*Opens dialog config window for HP options 
	*turns on/off auto calculation of HP based on class stats
	*keep or reset tempHP on short rest.
	*/
	_onHPOptions(event) {
		event.preventDefault();

		new HPOptions({ document: this.actor }).render(true)
	}
	
	/* -------------------------------------------- */
	/**
	* Opens bonuses dialog config window for selected Skills
	*/
	
	_onSkillBonus(event) {
		event.preventDefault();
		const skillName = event.currentTarget.parentElement.dataset.skill;
		const target = `system.skills.${skillName}`;
		const options = { document: this.actor, target: target, label: `${game.i18n.format('DND4E.SkillBonusTitle', { skill: this.actor.system.skills[skillName].label } ) }`, skill: true };
		new AttributeBonusDialog(options).render(true);
	}
	/* -------------------------------------------- */

	_onDeathSaveBonus(event) {
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.deathsavebon`, label: game.i18n.localize('DND4E.DeathSavingThrowBonus')};
		new AttributeBonusDialog(options).render(true);		
	}
	
	_onSurgeBonus(event) {
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.surgeBon`, label: game.i18n.localize('DND4E.HealingSurgeBonus') };
		new AttributeBonusDialog(options).render(true);		
	}
	
	_onSurgeEnv(event) {
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.surgeEnv`, label: `${game.i18n.localize('DND4E.HealingSurges')} ${game.i18n.localize('DND4E.SurgeEnv')}`};
		new AttributeBonusDialog(options).render(true);		
	}

	_onSecondWindBonus(event) {
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.secondwindbon`, label: game.i18n.localize('DND4E.SecondWindBonus'), secondWind: true };
		new AttributeBonusDialog(options).render(true);		
	}
	
	_onDefencesBonus(event) {
		event.preventDefault();
		const defName = event.currentTarget.parentElement.dataset.defence;
		const target = `system.defences.${defName}`;
		const options = { document: this.actor, target: target, label: `${game.i18n.format('DND4E.DefenceBonus',{def:this.actor.system.defences[defName].label})}`, ac: (defName ==="ac")  };
		new AttributeBonusDialog(options).render(true);		
	}
	
	_onInitiativeBonus(event) {
		event.preventDefault();
		const options = { document: this.actor, target: `system.attributes.init`, label: game.i18n.localize('DND4E.InitiativeBonus'), init: true };
		new AttributeBonusDialog(options).render(true);		
	}
	
	_onMovementBonus(event) {
		event.preventDefault();
		const moveName = event.currentTarget.parentElement.dataset.movement;
		const target = `system.movement.${moveName}`;
		const options = { document: this.actor, target: target, label: `${game.i18n.format('DND4E.MovementBonus',{mode: moveName})}` };
		new AttributeBonusDialog(options).render(true);		
	}
	
	_onMovementDialog(event) {
		event.preventDefault();
		new MovementDialog(this.actor).render(true)
	}
	
	_onConBonConfig(event) {
		event.preventDefault();
		new ConBonConfig(this.actor).render(true)
	}

	_onHealMenuDialog(event) {
		event.preventDefault();
		new HealMenuDialog(this.actor).render(true)
	}

	_onEncumbranceDialog(event) {
		event.preventDefault();
		new EncumbranceDialog(this.actor).render(true);
	}

	_onPassiveBonus(event) {
		event.preventDefault();
		const passName = event.currentTarget.parentElement.dataset.passive;
		const skillName = this.actor.system.passive[passName].skill;
		const target = `system.passive.${passName}`;
		const options = { document: this.actor, target: target, label: `${game.i18n.format('DND4E.PasBonus',{skill: this.actor.system.skills[skillName].label})}` };
		new AttributeBonusDialog(options).render(true);		
	}	

	_onModifiersBonus(event) {
		event.preventDefault();
		const modifierName = event.currentTarget.parentElement.dataset.modifiers;
		const target = `system.modifiers.${modifierName}`;
		const options = { document: this.actor, target: target, label: this.actor.system.modifiers[modifierName].label };
		new AttributeBonusDialog(options).render(true);
	}	

	_onResistancesBonus(event) {
		event.preventDefault();
		const resName = event.currentTarget.parentElement.dataset.res;
		const target = `system.resistances.${resName}`;
		const options = { document: this.actor, target: target, label: `${game.i18n.format('DND4E.DamResVulnBonus',{type: this.actor.system.resistances[resName].label})}` };
		new AttributeBonusDialog(options).render(true);
	}
	
	_onCustomRolldDescriptions(event) {
		event.preventDefault();
		const options = {data: this.actor};
		new CustomRolldDescriptions(this.actor).render(true, options);
	}
	/**
	* Opens dialog window to spend Second Wind
	*/
	_onSecondWind(event) {
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.secondWind(event,{isFF});
		}
		new SecondWindDialog(this.actor).render(true);		
	}
	
	/* -------------------------------------------- */

	_onActionPointDialog(event) {
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.actionPoint(event,{isFF});
		}
		new ActionPointDialog(this.actor).render(true);
	}

	_onActionPointExtraDialog(event) {
		event.preventDefault();
		new ActionPointExtraDialog(this.actor).render(true);
	}

	/**
	*Opens dialog window to short rest.
	*Spend n number of healin surges,
	*reset encounter powers, action point ussage, second wind ussage.
	*/
	_onShortRest(event) {
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.shortRest(event,{isFF});
		}
		new ShortRestDialog(this.actor).render(true);
	}
	
	/* -------------------------------------------- */
  
	/**
	*Opens dialog window to long rest.
	*reset HP, surges, encounter powers, daily powers, magic item use, actions points set to default.
	*/
	_onLongRest(event) {
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.longRest(event,{isFF});
		}
		new LongRestDialog(this.actor).render(true)
	}

	_onDeathSave(event) {
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.rollDeathSave(event,{isFF});
		}
		new DeathSaveDialog(this.actor).render(true);
	}

	_onrollInitiative(event) {
		event.preventDefault();
		return this.actor.rollInitiative({createCombatants: true},{event: event});
	}

	_onSavingThrow(event) {
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.rollSave(event,{isFF});
		}
		return new SaveThrowDialog(this.actor).render(true);
	}

	_onSavingThrowBonus(event) {
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.saves`, label: game.i18n.localize('DND4E.SavingThrowBonus') };
		new AttributeBonusDialog(options).render(true);	
	}

	static #onCycleSkillProficiency(event, target) {
		event.preventDefault();
		const field = target.parentNode.querySelector('input[type="hidden"]');

		// Get the current level and the array of levels
		const level = parseFloat(field.value);
		const levels = [0, 5, 8];
		let idx = levels.indexOf(level);

		// Toggle next level - forward on click, backwards on right
		if ( event.button === 0 ) {
			field.value = levels[(idx === levels.length - 1) ? 0 : idx + 1];
		} else {
			field.value = levels[(idx === 0) ? levels.length - 1 : idx - 1];
		}

		// Update the field value and save the form
		this.submit({preventClose: true});
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	 * @private
	 */
	_onItemRoll(event,variance={}) {
		event.preventDefault();
		//console.debug(variance)
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		
		if ( item.type === "power") {
			const fastForward = Helper.isRollFastForwarded(event);
			return this.actor.usePower(item, {
				'configureDialog': !fastForward, 
				'fastForward': fastForward,
				//Temporary traits from special roll modes
				'variance': variance
				});
		}
		// Otherwise roll the Item directly
		return item.roll();
	}

	async _onItemHoverEntry(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		
		if (item && item.type === "power" && item.hasAttack) {
			const bonus = await item.getAttackBonus();

			const d = {"ac": game.i18n.localize('DND4E.DefAC'), "ref": game.i18n.localize('DND4E.DefRef'), "wil": game.i18n.localize('DND4E.DefWil'), "fort": game.i18n.localize('DND4E.DefFort')};
			const defence = d[item.system.attack.def];

			if (bonus && defence){
				game.tooltip.activate(event.target, {text: `+ ${String(bonus)} ${game.i18n.localize('DND4E.VS')} ${defence}`, direction: "RIGHT"});
			}
		}
	}

	_onItemHoverExit(event) {
		event.preventDefault();
		game.tooltip.deactivate();
	}

	/* -------------------------------------------- */

	_onRollEffectSave(event){
		event.preventDefault();
		//console.debug("roll Save Throw v Effect!");

		const effectId = event.currentTarget.closest(".item").dataset.effectId;
		const effect = this.actor.effects.get(effectId);

		let save = new SaveThrowDialog(this.actor, {effectSave:true, effectId: effectId}).render(true);

		// console.debug(save)
		// console.debug(effectId);
		// console.debug(this.actor.effects.get(effectId));
	}
	/* -------------------------------------------- */

	async _onItemRecharge(event){
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);

		if ( item.type === "power") {

			if(item.system.rechargeRoll || (!item.system.rechargeRoll && !item.system.rechargeCondition)){
				const r = new Roll("1d6");
				r.options.async = true;
				r.dice[0].options.recharge = true;
				r.dice[0].options.critical = item.system.rechargeRoll || 6;
				r.dice[0].options.fumble = r.dice[0].options.critical -1;
				// r.evaluate({async: false});
				await r.evaluate();
	
				let flav = `${game.i18n.format('DND4E.PowerRechargeFail',{type: item.name})}`;
				if(r.total >= r.dice[0].options.critical){
					this.document.updateEmbeddedDocuments("Item", [{_id:itemId, "system.uses.value": item.system.preparedMaxUses}]);
					flav = `${game.i18n.format('DND4E.PowerRechargeSuccess',{type: item.name})}`;
				}

				r.toMessage({
					user: game.user.id,
					speaker: {actor: this.document, alias: this.document.name},
					flavor: flav,
					rollMode: game.settings.get("core", "rollMode"),
					messageData: {"flags.dnd4e.roll": {type: "other", itemId: this.id }}
				});

			} else if (item.system.rechargeCondition) {

				this.document.updateEmbeddedDocuments("Item", [{_id:itemId, "system.uses.value": item.system.preparedMaxUses}]);

				ChatMessage.create({
					user: game.user.id,
					speaker: {actor: this.document, alias: this.document.name},
					flavor: `${item.name}—${game.i18n.localize('DND4E.PowerRecharge')}`,
					content: `${game.i18n.format('DND4E.PowerRechargeSuccessCondition',{type: item.name,condition:item.system.rechargeCondition})}`
				});
			}
		}
		return;
	}

  /* -------------------------------------------- */

	/**
	 * Handle mouse click events to convert currency to the highest possible denomination
	 * @param {MouseEvent} event    The originating click event
	 * @private
	 */
	async _onConvertCurrency(event) {
		event.preventDefault();
		let shouldConvert = await foundry.applications.api.Dialog.confirm({
			window: {title: `${game.i18n.localize("DND4E.CurrencyConvert")}`},
			content: `<p>${game.i18n.localize("DND4E.CurrencyConvertHint")}</p>`
		});
		if (shouldConvert) return this.convertCurrency();
	}


	/**
	 * Returns the sum amount in GP that the character is currently holding
	 * @private
	 */
	_currencyGoldSumLabel(){
		let goldSum = 0;
		for(const [type,value] of Object.entries(this.actor.system.currency)){
			goldSum += value * CONFIG.DND4E.currencyConversion[type]?.gp;
		}
		return game.i18n.localize("DND4E.GoldWealth") + (Math.round(goldSum*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
	}
  /* -------------------------------------------- */

  /**
   * Convert all carried currency to the highest possible denomination to reduce the number of raw coins being
   * carried by an Actor.
   * @return {Promise<Actor4e>}
   */
  convertCurrency() {
		const curr = foundry.utils.duplicate(this.actor.system.currency);
		const convert = CONFIG.DND4E.currencyConversion;
		for ( let [c, t] of Object.entries(convert) ) {
			let change = Math.floor(curr[c] / t.each);
			curr[c] -= (change * t.each);
			curr[t.into] += change;
		}
		return this.document.update({"system.currency": curr});
  }
  
  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
	_onTraitSelector(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4E[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices};
		new TraitSelector(this.actor, options).render(true);
	}

	_onTraitSelectorWeapon(event){
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4E.weaponProficienciesMap;
		const options = { name: a.dataset.target, title: label.innerText, choices, datasetOptions: a.dataset.options, config:CONFIG};
		new TraitSelector(this.actor, options).render(true);
	}

	_onTraitSelectorSense(event) {
		event.preventDefault();
		const a = event.currentTarget;
		// const label = a.parentElement.parentElement.querySelector("h4");
		const label = a.parentElement.querySelector("span");
		const choices = CONFIG.DND4E[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		new TraitSelectorSense(this.actor, options).render(true);
	}
	
	_onListStringInput(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("span");
		const options = { name: a.dataset.target, title: label.innerText};
		new ListStringInput(this.actor, options).render(true);
	}
	
	_onTraitSelectorSaveThrow(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const choices = CONFIG.DND4E[a.dataset.options];
		const options = { name: a.dataset.target, title: "Saving Throw Mods", choices };
		new TraitSelectorSave(this.actor, options).render(true);
	}

  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
	const position = super.setPosition(options);
	// const sheetBody = this.element.find(".sheet-body");
	// const bodyHeight = position.height - 345;
	// sheetBody.css("height", bodyHeight);
	return position;
  }

	/* -------------------------------------------- */

	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollSkillCheck(event) {
		event.preventDefault();
		const skill = event.currentTarget.parentElement.dataset.skill;
		this.actor.rollSkill(skill, {event: event});
	}
  /* -------------------------------------------- */
  
  /**
   * Handle posting a chat message for displaying passive skills.
   * @param {Event} event   The originating click event
   * @private
   */
	_onRollPassiveCheck(event) {
		event.preventDefault();
		const passName = event.currentTarget.parentElement.dataset.passive;
		const skillName = this.actor.system.passive[passName].skill;

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this.document, alias: this.document.name},
			content: `${game.i18n.format('DND4E.PasCheck',{skill:this.actor.system.skills[skillName].label})}: <strong>${this.document.system.passive[passName].value}</strong>`
		});	
	}


	/* -------------------------------------------- */

	/**
	 * Handle activation of a context menu for an embedded Item or ActiveEffect document.
	 * Dynamically populate the array of context menu options.
	 * @param {HTMLElement} element       The HTML element for which the context menu is activated
	 * @protected
	 */
	_onItemContext(element) {

		// Active Effects
		if ( element.classList.contains("effect") ) {
			const effect = this.actor.effects.get(element.dataset.effectId);
			if ( !effect ) return;
			ui.context.menuItems = this._getActiveEffectContextOptions(effect);
			Hooks.call("DND4E.getActiveEffectContextOptions", effect, ui.context.menuItems);
		}

		// Items
		else {
			const item = this.actor.items.get(element.dataset.itemId);
			if ( !item ) return;
			ui.context.menuItems = this._getItemContextOptions(item);
			Hooks.call("DND4E.getItemContextOptions", item, ui.context.menuItems);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Prepare an array of context menu options which are available for owned ActiveEffect documents.
	 * @param {ActiveEffect4e} effect         The ActiveEffect for which the context menu is activated
	 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the ActiveEffect
	 * @protected
	 */	

	/* -------------------------------------------- */
	_getActiveEffectContextOptions(effect) {
		return [
			{
				name: "DND4E.ContextMenuActionEdit",
				icon: "<i class='fas fa-edit fa-fw'></i>",
				callback: () => effect.sheet.render(true)
			},
			{
				name: "DND4E.ContextMenuActionDuplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				callback: () => effect.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: effect.name})}, {save: true})
			},
			{
				name: "DND4E.ContextMenuActionDelete",
				icon: "<i class='fas fa-trash fa-fw'></i>",
				callback: () => effect.deleteDialog()
			},
			{
				name: effect.disabled ? "DND4E.ContextMenuActionEnable" : "DND4E.ContextMenuActionDisable",
				icon: effect.disabled ? "<i class='fas fa-check fa-fw'></i>" : "<i class='fas fa-times fa-fw'></i>",
				callback: () => effect.update({disabled: !effect.disabled})
			}
		];
	}

	/**
	 * Prepare an array of context menu options which are available for owned Item documents.
	 * @param {Item4e} item                   The Item for which the context menu is activated
	 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the Item
	 * @protected
	 */
	_getItemContextOptions(item) {
		// Standard Options
		const options = [
		{
			name: "DND4E.ContextMenuActionToChat",
			icon: "<i class='fas fa-share-from-square fa-fw'></i>",
			callback: () => item.toChat()
		},
		{
			name: "DND4E.ContextMenuActionEdit",
			icon: "<i class='fas fa-edit fa-fw'></i>",
			callback: () => item.sheet.render(true)
		},
		{
			name: "DND4E.ContextMenuActionDuplicate",
			icon: "<i class='fas fa-copy fa-fw'></i>",
			condition: () => !["race", "background", "class", "subclass"].includes(item.type),
			callback: () => item.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: item.name})}, {save: true})
		},
		{
			name: "DND4E.ContextMenuActionDelete",
			icon: "<i class='fas fa-trash fa-fw'></i>",
			callback: () => item.deleteDialog()
		}
		];

		// Toggle Attunement State
		if ( ("attunement" in item.system) && (item.system.attunement !== CONFIG.DND4E.attunementTypes.NONE) ) {
			const isAttuned = item.system.attunement === CONFIG.DND4E.attunementTypes.ATTUNED;
			options.push({
				name: isAttuned ? "DND4E.ContextMenuActionUnattune" : "DND4E.ContextMenuActionAttune",
				icon: "<i class='fas fa-sun fa-fw'></i>",
				callback: () => item.update({
					"system.attunement": CONFIG.DND4E.attunementTypes[isAttuned ? "REQUIRED" : "ATTUNED"]
				})
			});
		}

		// Toggle Equipped State
		if ( "equipped" in item.system ) options.push({
			name: item.system.equipped ? "DND4E.ContextMenuActionUnequip" : "DND4E.ContextMenuActionEquip",
			icon: "<i class='fas fa-shield-alt fa-fw'></i>",
			callback: () => item.update({"system.equipped": !item.system.equipped})
		});

		// Toggle Prepared State
		if ( ("prepared" in item.system)) options.push({
			name: item.system?.prepared ? "DND4E.ContextMenuActionUnprepare" : "DND4E.ContextMenuActionPrepare",
			icon: "<i class='fas fa-sun fa-fw'></i>",
			callback: () => item.update({"system.prepared": !item.system.prepared})
		});
		
		// Special Roll Options for Basic and Tagged Attacks
		if ( item.type == 'power' && (item.system?.attack?.isBasic || item.system?.attack?.canCharge)) {
			options.unshift({
				name: game.i18n.localize('DND4E.AttackModeCharge'),
				icon: "<i class='fas fa-angles-right'></i>",
				callback: () => this._onItemRoll(event,{isCharge:true})
			});
		}
		if ( item.type == 'power' && (item.system?.attack?.isBasic || item.system?.attack?.canOpp)) {
			options.unshift({
				name: game.i18n.localize('DND4E.AttackModeOpp'),
				icon: "<i class='fas fa-triangle-exclamation'></i>",
				callback: () => this._onItemRoll(event,{isOpp:true})
			});
		}

		return options;
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling a ability check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollAbilityCheck(event) {
		event.preventDefault();
		let ability = event.currentTarget.parentElement.dataset.ability;
		this.actor.rollAbility(ability, {event: event});
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling a defences check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollDefenceCheck(event) {
		event.preventDefault();
		const def = event.currentTarget.parentElement.dataset.defence;
		this.actor.rollDef(def, {event: event});
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of an item reference or item data onto an Actor Sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
	 * @protected
	 */
	async _onDropItem(event, data) {
		if ( !this.actor.isOwner ) return false;
		const item = await Item.implementation.fromDropData(data);

		// Handle moving out of container & item sorting
		if ( this.actor.uuid === item.parent?.uuid ) {
			if ( item.system.container !== null ) await item.update({"system.container": null});
			return this._onSortItem(event, item.toObject());
		}

		return this._onDropItemCreate(item);
		// return super._onDropItem(event, data);
	}

	/** @override */
	async _onDropFolder(event, data) {
		// return super._onDropFolder(event, data);
		
		if ( !this.actor.isOwner ) return [];
		const folder = await Folder.implementation.fromDropData(data);
		if ( folder.type !== "Item" ) return [];
		const droppedItemData = await Promise.all(folder.contents.map(async item => {
			if ( !(item instanceof Item) ) item = await fromUuid(item.uuid);
			return item;
		}));
		return this._onDropItemCreate(droppedItemData);
	}

	/**
	 * Handle the final creation of dropped Item data on the Actor.
	 * @param {Item4e[]|Item4e} itemData     The item or items requested for creation
	 * @returns {Promise<Item4e[]>}
	 * @protected
	 */
	async _onDropItemCreate(itemData) {
		let items = itemData instanceof Array ? itemData : [itemData];
		const itemsWithoutAdvancement = items.filter(i => !i.system.advancement?.length);
		const multipleAdvancements = (items.length - itemsWithoutAdvancement.length) > 1;
		if ( multipleAdvancements && !game.settings.get("dnd4e", "disableAdvancements") ) {
			ui.notifications.warn(game.i18n.format("DND4E.WarnCantAddMultipleAdvancements"));
			items = itemsWithoutAdvancement;
		}
	
		// Filter out items already in containers to avoid creating duplicates
		const containers = new Set(items.filter(i => i.type === "backpack").map(i => i._id));
		items = items.filter(i => !containers.has(i.system.container));
	
		// Create the owned items & contents as normal
		const toCreate = await Item4e.createWithContents(items, {
			transformFirst: item => this._onDropSingleItem(item.toObject())
		});
		return Item4e.createDocuments(toCreate, {pack: this.actor.pack, parent: this.actor, keepId: true});
	}

	/* -------------------------------------------- */

	/**
	 * Handles dropping of a single item onto this character sheet.
	 * @param {object} itemData					The item data to create.
	 * @returns {Promise<object|boolean>}		The item data to create after processing, or false if the item should not be
	 * 											created or creation has been otherwise handled.
	 * @protected
	 */
	async _onDropSingleItem(itemData) {
		// Clean up data
		this._onDropResetData(itemData);

		// Stack identical consumables
		const stacked = this._onDropStackConsumables(itemData);
		if ( stacked ) return false;

		return itemData;
	}

	/* -------------------------------------------- */

	/**
	 * Reset certain pieces of data stored on items when they are dropped onto the actor.
	 * @param {object} itemData    The item data requested for creation. **Will be mutated.**
	 */
	_onDropResetData(itemData) {
		if ( !itemData.system ) return;
		// ["equipped", "proficient", "prepared"].forEach(k => delete itemData.system[k]);
		// if ( "attunement" in itemData.system ) {
		// 	itemData.system.attunement = Math.min(itemData.system.attunement, CONFIG.DND5E.attunementTypes.REQUIRED);
		// }
	}

	/* -------------------------------------------- */

	/**
	 * Stack identical consumables when a new one is dropped rather than creating a duplicate item.
	 * @param {object} itemData         The item data requested for creation.
	 * @returns {Promise<Item4e>|null}  If a duplicate was found, returns the adjusted item stack.
	 */
	_onDropStackConsumables(itemData) {

		const droppedSourceId = itemData.flags.core?.sourceId;
		if ( itemData.type !== "consumable" || !droppedSourceId ) return null;
		const similarItem = this.actor.items.find(i => {
			const sourceId = i._stats.compendiumSource;
			return sourceId && (sourceId === droppedSourceId) && (i.type === "consumable") && (i.name === itemData.name);
		});
		if ( !similarItem ) return null;
		console.log(similarItem.system.quantity)
		console.log(itemData.system.quantity)
		return similarItem.update({
			"system.quantity": similarItem.system.quantity + Math.max(itemData.system.quantity, 1)
		});
	}
}
