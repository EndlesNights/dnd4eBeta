import ActorSheet4e from "./actor-sheet.mjs";
import SourceConfig from "../apps/source-config.mjs";

export default class ActorSheet4eNPC extends ActorSheet4e {

	static DEFAULT_OPTIONS = {
		classes: ["NPC"],
		position: {
			width: 680,
			height: 680,
		},
		actions: {
			configureSource: ActorSheet4eNPC.#onConfigureSource,
    }
	};

	static PARTS = {
		sheet: {
			template: "systems/dnd4e/templates/actors/npc-sheet.hbs",
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
				"systems/dnd4e/templates/actors/tabs/biography.hbs",
				"systems/dnd4e/templates/actors/tabs/skills.hbs",
				"systems/dnd4e/templates/actors/tabs/inventory.hbs",
				"systems/dnd4e/templates/actors/tabs/features.hbs",
				"systems/dnd4e/templates/actors/tabs/powers.hbs",
				"systems/dnd4e/templates/actors/tabs/effects.hbs",
				"templates/generic/tab-navigation.hbs",
			],
		},
		limited: {
			template: "systems/dnd4e/templates/actors/npc-sheet-limited.hbs",
			templates: [
				"systems/dnd4e/templates/actors/tabs/biography.hbs",
			],
		},
	};

	static TABS = {
		sheet: {
			tabs: [
				{ id: "biography", label: "DND4E.Sheet.Biography" },
				{ id: "skills", label: "DND4E.Sheet.Skills" },
				{ id: "inventory", label: "DND4E.Sheet.Inventory" },
				{ id: "features", label: "DND4E.Sheet.Features" },
				{ id: "powers", label: "DND4E.Sheet.Powers" },
				{ id: "effects", label: "DND4E.Sheet.Effects" },
			],
			initial: "powers",
		},
	};

	/** @inheritDoc */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		if (this.document.limited) {
			options.parts = ["limited"];
		} else {
			options.parts = ["sheet"];
		}
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.sourceLabel = this.document.system.source.label;
    
		return context;
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
