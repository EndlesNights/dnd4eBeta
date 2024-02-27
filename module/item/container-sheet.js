// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import {Helper} from "../helper.js";
import ItemSheet4e from "./item-sheet.js";

/**
 * Override and extend the core ItemSheet implementation to handle specific item types
 * @extends {ItemSheet4e}
 */
export default class ContainerItemSheet extends ItemSheet4e {
	constructor(...args) {
		super(...args);
	}

	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
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
				initial: "container"
			}],
			dragDrop: [
				{dragSelector: "[data-effect-id]", dropSelector: null},
				{dragSelector: ".item-list .item", dropSelector: null}
			],
			elements: {inventory: "dnd4e-inventory"}
			
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

		if(data.document.contents.size){
			data.containerContents = data.document.contents;

			// Organize items
			for ( let i of data.containerContents ) {
				i.system.quantity = i.system.quantity || 0;
				i.system.weight = i.system.weight || 0;
				i.totalWeight = Math.round(i.system.quantity * i.system.weight * 10) / 10;
			}
		}

		return data;
	}
	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		const item = this.item;

		console.log(event)
		console.log(data)
		console.log(item)

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
		case "Item":
			return this._onDropItemContainer(event, data.uuid, item);		
		}
	}
	/* -------------------------------------------- */

	/**
	 * Handle the dropping of an Item data onto a containerItem Sheet
	 * @param {DragEvent} event					The concluding DragEvent which contains drop data
	 * @param {string} droppedItemUUID			The  UUID for the item being dropped
	 * @param {object} targetItem				The container object
	 * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
	 * @protected
	 */

	async _onDropItemContainer(event, droppedItemUUID, targetItem){
		console.log(droppedItemUUID)
		const droppedItem = await fromUuid(droppedItemUUID);
		const oldContainer = droppedItem.container || false;
		
		//Check if the object is a valid "physical" item type
		if(!["weapon", "equipment", "consumable", "tool", "loot", "backpack", ].includes(droppedItem.type)){
			console.log("Not phsyical item, can not place in contrainer")
			return;
		}

		if(droppedItem.parent === targetItem.parent) {
			console.log("Parent Match!");
			await droppedItem.update({"system.container": targetItem.id}); 
			
			console.log(targetItem.id)
		} else {
			console.log("No Parent Match")
		}

		// refresh any container sheets if open... TODO, this doesn't refresh the sheet for others veiwing it.
		oldContainer.sheet.render(oldContainer.sheet.rendered);
		targetItem.sheet.render(targetItem.sheet.rendered);
		
	}
}
