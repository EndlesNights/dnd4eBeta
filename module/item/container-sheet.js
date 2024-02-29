// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import {Helper} from "../helper.js";
import ItemSheet4e from "./item-sheet.js";
import Item4e from "./item-document.js";

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
				".inventory .inventory-list",
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
	async getData(options={}) {
		const data = await super.getData(options);

		data.items = Array.from(await this.item.contents);
		data.encumbrance = await this.item._computeEncumbrance();
		
		data.itemData = {};

		for ( const i of data.items ) {
			const d = data.itemData[i.id] ??= {};
			d.totalWeight = (i.system.quantity * i.system.weight).toNearest(0.1); //(await i.system.totalWeight).toNearest(0.1);
			d.isExpanded = this._expanded.has(i.id);
			d.isStack = i.system.quantity > 1;
			d.expanded = this._expanded.has(i.id) ? await i.getChatData({secrets: this.item.isOwner}) : null;
		}
		data.isContainer = true;
		data.inventory = {
			contents: {
				label: "DND4E.Contents",
				items: data.items
			}
		};

		data.items = data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		return data;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Update Contents Item
		html.find('.item .item-image').click(event => this._onItemRoll(event));

		html.find('.item-quantity input').click(event => event.target.select()).change( event => {
			const li = $(event.currentTarget).parents(".item");
			const item = this.object.contents.get(li.data("itemId"));
			return item.update({'system.quantity': event.target.value});
		});
		
		html.find('.item-edit').click(event => {
			event.preventDefault();
			const li = $(event.currentTarget).parents(".item");
			const item = this.object.contents.get(li.data("itemId"));
			return item.sheet.render(true);
		});

		html.find('.item-delete').click(event => {
			event.preventDefault();
			const li = $(event.currentTarget).parents(".item");
			const item = this.object.contents.get(li.data("itemId"));
			if ( item )  {
				if (game.settings.get("dnd4e", "itemDeleteConfirmation")) {
					return Dialog.confirm({
						title: game.i18n.format("DND4E.DeleteConfirmTitle", {name: item.name}),
						content: game.i18n.format("DND4E.DeleteConfirmContent", {name: item.name}),
						yes: () => { return item.delete() },
						no: () => {},
						defaultYes: true
					});
				}
				else {
					return item.delete();
				}
			}
		});
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	 * @private
	 */
	_onItemRoll(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents(".item");
		const item = this.object.contents.get(li.data("itemId"));

		if(item.actor) return item.roll();
		return false;
	}

	/* -------------------------------------------- */
	/*  Drag & Drop                                 */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onDragStart(event) {
		const li = event.currentTarget;
		if ( event.target.classList.contains("content-link") ) return;
		if ( !li.dataset.itemId ) return super._onDragStart(event);

		const item = await this.item.getContainedItem(li.dataset.itemId);
		const dragData = item?.toDragData();
		if ( !dragData ) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		const item = this.item;

		if ( !["Item", "Folder"].includes(data.type) ) return super._onDrop(event, data);

		if ( Hooks.call("dnd4e.dropItemSheetData", this.item, this, data) === false ) return;

		if ( data.type === "Folder" ) return this._onDropFolder(event, data);
		return this._onDropItem(event, data);
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

}
