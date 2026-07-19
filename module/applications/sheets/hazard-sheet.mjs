import ActorSheet4e from "./actor-sheet.mjs";
import SourceConfig from "../apps/source-config.mjs";

export default class ActorSheet4eHazard extends ActorSheet4e {

	static DEFAULT_OPTIONS = {
		classes: ["Hazard"],
		position: {
			width: 510,
			height: 680,
		},
		actions: {
			configureSource: ActorSheet4eHazard.#onConfigureSource,
    }
	};

	static PARTS = {
		sheet: {
			template: "systems/dnd4e/templates/actors/hazard-sheet.hbs",
			scrollable: [
				"",
				".inventory .inventory-list",
				".features .inventory-list",
				".powers .inventory-list",
				".section--sidebar",
				".section--tabs-content",
				".section--skills",
				".tab.active",
			],
			templates: [
				"systems/dnd4e/templates/actors/tabs/description.hbs",
				"systems/dnd4e/templates/actors/tabs/powers.hbs",
				"systems/dnd4e/templates/actors/tabs/effects.hbs",
				"templates/generic/tab-navigation.hbs",
			],
		},
	};

	static TABS = {
		sheet: {
			tabs: [
				{ id: "description", label: "DND4E.Sheet.Description" },
				{ id: "powers", label: "DND4E.Sheet.Powers" },
				{ id: "effects", label: "DND4E.Sheet.Effects" },
			],
			initial: "powers",
		},
	};

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		//console.debug(coreData);
		let hazardData = {};
		
		hazardData.descHTML = await CONFIG.ux.TextEditor.enrichHTML(context.system.description, {
			secrets: context.owner,
			relativeTo: this.actor,
		});
		
		hazardData.countersHTML = await CONFIG.ux.TextEditor.enrichHTML(context.system.details.countermeasures, {
			secrets: context.owner,
			relativeTo: this.actor,
		});
		
		hazardData.notesHTML = await CONFIG.ux.TextEditor.enrichHTML(context.system.details.notes, {
			secrets: context.owner,
			relativeTo: this.actor,
		});
		
		hazardData.sourceLabel = this.document.system.source.label;
    
		let combinedData = { ...context, ...hazardData };		
		return combinedData;
	}
  
	/* -------------------------------------------- */

	/**
   * Handle opening a configuration application.
   * @this {ItemSheet4e}
   * @param {Event} event         Triggering click event.
   * @param {HTMLElement} target  Button that was clicked.
   * @returns {any}
   */
	static #onConfigureSource(event, target) {
		return this._renderChild(new SourceConfig({ document: this.actor, keyPath: "system.source" }));
	}
  
	/* -------------------------------------------- */

	/**
     * Render an application in the same workspace as this one.
     * @param {ApplicationV2} app        The application to render.
     * @param {RenderOptions} [options]  Options passed to render.
     * @returns {Promise<ApplicationV2>}
     */
	_renderChild(app, options = {}) {
		if (this.parent) return this.parent.renderChild(app, options);
		if (this.window?.windowId) return app.render({
			force: true, window: { detached: true, windowId: this.window.windowId }, ...options,
		});
		return app.render({ force: true, ...options });
	}
}
