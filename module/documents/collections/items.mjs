/**
 * Custom items collection to hide items in containers automatically.
 */
export default class Items4e extends foundry.documents.collections.Items {

	/** @inheritDoc */
	_getVisibleTreeContents(entry) {
		return this.contents.filter(c => c.visible && !this.has(c.system?.container));
	}
}
