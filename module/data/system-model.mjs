/**
 * @import SubtypeMetadata from "./_types.mjs";
 */

/**
 * Subclass of TypeDataModel that adds handling for pseudo documents.
 */
export default class SystemModel4e extends foundry.abstract.TypeDataModel {
	/**
     * Metadata for this document subtype.
     * @type {SubtypeMetadata}
     */
	static get metadata() {
		return {
			embedded: {},
		};
	}
}
