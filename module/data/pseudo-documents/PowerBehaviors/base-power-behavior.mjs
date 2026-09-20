import TypedPseudoDocument from "../typed-pseudo-document.mjs";
import PowerBehaviorSheet from "../../../applications/sheets/pseudo-documents/power-behavior.mjs";

/**
 * @import { Actor4e, Item4e } from "../../../documents/_module.mjs";
 */

/**
 * Pseudodocument used by abilities to represent the tiered results of a power roll.
 */
export default class BasePowerBehavior extends TypedPseudoDocument {
	/** @inheritdoc */
	static get metadata() {
		return {
			...super.metadata,
			documentName: "PowerBehavior",
			icon: "fa-solid fa-child-reaching",
			sheetClass: PowerBehaviorSheet,
		};
	}

	/* -------------------------------------------------- */

	/** @inheritdoc */
	static defineSchema() {
		return Object.assign(super.defineSchema(), {});
	}

	/* -------------------------------------------------- */

	/**
	 * Reference to the grandparent item.
	 * @type {Item4e}
	 */
	get item() {
		return this.document;
	}

	/* -------------------------------------------------- */

	/**
	 * Reference to the great-grandparent actor.
	 * @type {Actor4e}
	 */
	get actor() {
		return this.item?.actor;
	}
}
