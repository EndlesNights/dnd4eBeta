export default class ActiveEffectConfig4e extends ActiveEffectConfig {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["sheet", "active-effect-sheet"],
			template: "templates/sheets/active-effect-config.html",
			width: 260,
			height: "auto",
			tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "details"}]
		});
	}
}
