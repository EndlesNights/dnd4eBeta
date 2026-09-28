/**
 * An extension of DialogV2 that adjusts the defaults for the system.
 */
export default class Dialog4e extends foundry.applications.api.Dialog {
	/** @inheritdoc */
	static DEFAULT_OPTIONS = {
		classes: ["dnd4e", "dialog", "default"],
		position: {
			width: 400,
			height: "auto",
		},
	};
}
