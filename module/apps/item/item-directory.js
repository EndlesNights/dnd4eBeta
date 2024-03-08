import Item4e from "../../item/item-document.js";

/**
 * Items sidebar with added support for item containers.
 */
export default class ItemDirectory4e extends ItemDirectory {
	/** @inheritdoc */
	async _handleDroppedEntry(target, data) {
		// Obtain the dropped Document
		let item = await this._getDroppedEntryFromData(data);
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
		if ( oldContainer ){
			await item.update({"system.container": null});
		}

		// Let parent method perform sorting
		super._handleDroppedEntry(target, item.toDragData());
	}
}