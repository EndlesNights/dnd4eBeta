/**
 * Custom items collection to hide items in containers automatically.
 */
export default class Items4e extends foundry.documents.collections.Items {

	_getVisibleTreeContents(entry) {
		return this.contents.filter(c => c.visible && !this.has(c.system?.container));
	}
}