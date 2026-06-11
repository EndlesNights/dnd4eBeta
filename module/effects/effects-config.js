import ActiveEffect4e from "../effects/effects.js";
import { DND4E } from "../config.js";
import { Helper } from "../helper.js";

export default class ActiveEffectConfig4e extends foundry.applications.sheets.ActiveEffectConfig {

	static DEFAULT_OPTIONS = {
		classes: ["sheet", "dnd4e", "default"],
		position: {
			width: 580,
			height: 565,
		},
		window: {
			resizable: true,
		},
		actions: {
			addDot: ActiveEffectConfig4e.#onEffectDotControl,
			deleteDot: ActiveEffectConfig4e.#onEffectDotControl,
			addStatus: ActiveEffectConfig4e.#onEffectStatusControl,
			copyAll: ActiveEffectConfig4e.#onEffectStatusControl,
			copyName: ActiveEffectConfig4e.#onEffectStatusControl,
			copyIcon: ActiveEffectConfig4e.#onEffectStatusControl,
			copyDesc: ActiveEffectConfig4e.#onEffectStatusControl,
			copyMods: ActiveEffectConfig4e.#onEffectStatusControl,
			copyClFlags: ActiveEffectConfig4e.#onEffectStatusControl,
			deleteStatus: ActiveEffectConfig4e.#onEffectStatusControl,
			addKeyword: ActiveEffectConfig4e.#onEffectKeywordControl,
			deleteKeyword: ActiveEffectConfig4e.#onEffectKeywordControl,
		},
	};

	static PARTS = {
		header: { template: "templates/sheets/active-effect/header.hbs" },
		tabs: { template: "templates/generic/tab-navigation.hbs" },
		description: {
			template: "systems/dnd4e/templates/sheets/active-effect/description.hbs",
			scrollable: [".scrollable"],
		},
		details: {
			template: "systems/dnd4e/templates/sheets/active-effect/details.hbs", 
			scrollable: [".scrollable"],
		},
		activation: {
			template: "systems/dnd4e/templates/sheets/active-effect/activation.hbs",
			scrollable: [".scrollable"],
		},
		changes: {
			template: "systems/dnd4e/templates/sheets/active-effect/changes.hbs", 
			scrollable: [".scrollable"],
		},
		footer: { template: "templates/generic/form-footer.hbs" },
	};
	
	static TABS = {
		sheet: {
			tabs: [
				{ id: "description", label: "DND4E.Sheet.Description" },
				{ id: "details", label: "DND4E.Sheet.Details" },
				{ id: "changes", label: "EFFECT.TABS.changes" },
				{ id: "activation", label: "DND4E.Sheet.Activation" },
			],
			initial: "details",
		},
	};

	/* ----------------------------------------- */

	/** @inheritDoc */
	async _preparePartContext(partId, context) {
		const partContext = await super._preparePartContext(partId, context);
		if (partId in partContext.tabs) partContext.tab = partContext.tabs[partId];
		const effect = this.document;
		context.config = {
			...CONFIG.DND4E,
			statusEffects: CONFIG.statusEffects,
			keywords: {
				...CONFIG.DND4E.effectTypes,
				...CONFIG.DND4E.damageTypes,
				...CONFIG.DND4E.powerSource,
			},
		};
		const damageTypes = { ...CONFIG.DND4E.damageTypes };
		switch (partId) {
			case "description":
				partContext.showIconOptions = Object.entries(CONST.ACTIVE_EFFECT_SHOW_ICON).map(([k, value]) => ({
					value, label: _loc(`EFFECT.SHOW_ICON.${k.toLowerCase()}`),
				})).reverse();
				break;
			case "details":
				partContext.isActorEffect = effect.parent?.documentName === "Actor";
				partContext.isItemEffect = effect.parent?.documentName === "Item";
				delete damageTypes.ongoing;
				context.dotDamageTypes = damageTypes;
				break;
			case "activation": {
				partContext.powerParent = ["power", "consumable"].includes(this.document.parent?.type);
				partContext.start = await this._prepareStartContext();
				partContext.hasDuration = typeof context.source.duration.value === "number";
				const groups = {
					time: _loc("EFFECT.DURATION.UNITS.GROUPS.time"),
					combat: _loc("EFFECT.DURATION.UNITS.GROUPS.combat"),
				};
				partContext.durationUnits = CONST.ACTIVE_EFFECT_DURATION_UNITS.map(
					value => ({
						value,
						label: _loc(`EFFECT.DURATION.UNITS.${value}`),
						group: CONST.ACTIVE_EFFECT_TIME_DURATION_UNITS.includes(value) ? groups.time : groups.combat,
					}),
				);
				partContext.expiryEvents = Object.entries(ActiveEffect4e.EXPIRY_EVENTS)
					.map(([value, label]) => ({ value, label: _loc(label) }))
					.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
					.reduce((events, { value, label }) => {
						events[value] = label;
						return events;
					}, {});
				break;
			}
			case "changes": {
				const fields = effect.system.schema.fields.changes.element.fields;
				const changeTypes = Object.entries(ActiveEffect4e.CHANGE_TYPES)
					.map(([type, { label }]) => ({ type, label: _loc(label) }))
					.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
					.reduce((types, { type, label }) => {
						types[type] = label;
						return types;
					}, {});
				partContext.changes = await Promise.all(foundry.utils.deepClone(context.source.changes).map((change, index) => {
					const defaultPriority = ActiveEffect4e.CHANGE_TYPES[change.type]?.defaultPriority;
					return this._renderChange({ change, index, fields, defaultPriority, changeTypes });
				}));
				partContext.cltEnabled = context.config.statusEffects.length !== Object.keys(context.config.statusEffect).length;
				partContext.statuses = Object.values(CONFIG.statusEffects)
					.map(s => ({ value: s.id, label: _loc(s.name) }));
				break;
			}
			case "footer":
				partContext.buttons = [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "EFFECT.Submit" }];
				break;
			case "tabs":
				partContext.tabClasses = "top-tabs";
				break;
		}
		return partContext;
	}

	/* ----------------------------------------- */

	async _onRender(context, options) {
		await super._onRender(context, options);
		this.element.querySelectorAll(".refreshes").forEach(el => el.addEventListener("change", this._refresh.bind(this)));
	}

	/* ----------------------------------------- */

	/** @inheritDoc */
	_onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		if (event.target?.name === "transfer") {
			this._refresh(event);
		}
	}

	/* ----------------------------------------- */

	/**
	* Handling for mouse clicks on DOT control buttons - adapted from _onEffectControl
	* Delegate responsibility out to action-specific handlers depending on the button action.
	* @param {PointerEvent} event      	The originating click event
	* @param {HTMLElement} target				The target of the event
	* @this {ActiveEffectConfig4e}
	*/
	static #onEffectDotControl(event, target) {
		event.preventDefault();
		switch (target.dataset.action) {
			case "addDot":
				return this._addEffectDot();
			case "deleteDot":
				target.closest(".effect-dot").remove();
				return this.submit({ preventClose: true }).then(() => this.render());
		}
	}

	/* ----------------------------------------- */

	/**
	* Handling for mouse clicks on status control buttons - adapted from _onEffectControl
	* Delegate responsibility out to action-specific handlers depending on the button action.
	* @param {PointerEvent} event      	The originating click event
	* @param {HTMLElement} target				The target of the event
	* @this {ActiveEffectConfig4e}
	*/
	static #onEffectStatusControl(event, target) {
		event.preventDefault();
		const statusId = target.closest(".effect-status").getAttribute("data-status-id");
		switch (target.dataset.action) {
			case "copyName":
			case "copyIcon":
			case "copyDesc":
			case "copyMods":
			case "copyClFlags":
			case "copyAll":
				return this._copyStatusDetails(statusId, target.dataset.action).then(() => this.render());
			case "addStatus":
				return this._addEffectStatus();
			case "deleteStatus":
				target.closest(".effect-status").remove();
				return this.submit({ preventClose: true }).then(() => this.render());
		}
	}

	/* ----------------------------------------- */

	/**
	* Handling for mouse clicks on Keyword control buttons - adapted from _onEffectControl
	* Delegate responsibility out to action-specific handlers depending on the button action.
	* @param {PointerEvent} event      	The originating click event
	* @param {HTMLElement} target				The target of the event
	* @this {ActiveEffectConfig4e}
	*/
	static #onEffectKeywordControl(event, target) {
		event.preventDefault();
		switch (target.dataset.action) {
			case "addKeyword":
				return this._addEffectKeyword();
			case "deleteKeyword":
				target.closest(".effect-keyword").remove();
				return this.submit({ preventClose: true }).then(() => this.render());
		}
	}

	/* ----------------------------------------- */
	
	/**
	* Handle adding a new dot to the dots array - adapted from _addEffectChange
	*/
	async _addEffectDot() {
		return this.submit({ preventClose: true, updateData: {
			["system.dots"]: [{ amount: 0, types: new Set() }],
		} });
	}

	/* ----------------------------------------- */

	/**
	* Handle adding a new status to the statuses array - adapted from _addEffectChange
	*/
	async _addEffectStatus() {
		const i = this.document.statuses.size;
		return this.submit({ preventClose: true, updateData: {
			statuses: [...this.document.statuses, "none"],
		} });
	}

	/* ----------------------------------------- */

	/**
	* Handle adding a new dot to the keywords array - adapted from _addEffectChange
	*/
	async _addEffectKeyword() {
		return this.submit({ preventClose: true, updateData: {
			["system.keywords"]: ["unknown"],
		} });
	}

	/* ----------------------------------------- */

	/**
	* Copy fluff to effect from status condition config
	*/
	async _copyStatusDetails(statusId, scope = "copy-all") {
		if (!statusId) return;
		
		const statuses = CONFIG.statusEffects;
		
		try {
			//I remembered error handling this time! This should be expected to fail if the status id isn't found, such as if you have remapped your conditions since setting up the effect.
			
			const statusIndex = statuses.findIndex((x) => x.id == statusId);
			let effectUpdates = {};
			
			if ((scope == "copyName") || (scope == "copyAll")) {
				effectUpdates.name = _loc(statuses[statusIndex].name);
			}
			if ((scope == "copyIcon") || (scope == "copyAll")) {
				effectUpdates.img = statuses[statusIndex].img;
				Helper.debugLog(effectUpdates);
			}
			if ((scope == "copyDesc") || (scope == "copyAll")) {
				effectUpdates.description = _loc(statuses[statusIndex].description);
			}
			if ((scope == "copyMods") || (scope == "copyAll")) {
				effectUpdates.changes = statuses[statusIndex].changes;
			}
			if (game.modules.get("condition-lab-triggler")?.active) {
				if ((scope == "copyClFlags") || (scope == "copyAll")) {
					if (statuses[statusIndex].flags["condition-lab-triggler"]) {
						effectUpdates.conditionLab = statuses[statusIndex].flags["condition-lab-triggler"];
					}
				}
			}
			
			return this.submit({ preventClose: true, updateData: effectUpdates });
			
		} catch(err) {
			ui.notifications.error(_loc("ERROR.4eCopyStatusDetails"));
			Helper.debugLog(err);
		}
	}

	/* ----------------------------------------- */

	_prepareSubmitData(event, form, formData, updateData) {
		const submitData = this._processFormData(event, form, formData);
		if (updateData) {
			foundry.utils.mergeObject(submitData, updateData, { applyOperators: true });
			foundry.utils.mergeObject(submitData, updateData, { applyOperators: false });
		}

		// CHANGES FROM CORE START HERE
		submitData.changes = Array.from(Object.values(submitData.changes || {}));
		submitData.statuses = Array.from(Object.values(submitData.statuses || {})).filter(x => x);
		// The form throws an error if it's updated while there is an unselected status condition row. 
		// I can't find a way to catch it, so instead I'm just trimming - Fox
		
		if (submitData.conditionLab) {
			// This doesn't like merging directly, seemingly because of the hyphens in the property name. 
			//	Storing it in a separate property and updating manually seems to work. - Fox
			submitData.flags["condition-lab-triggler"] = submitData.conditionLab;
		}
		
		submitData.system.dots = Array.from(Object.values(submitData.system.dots || {}));
		if (submitData.system.dots.length) {
			for (let [i, dot] of submitData.system.dots.entries()) {
				submitData.system.dots[i].amount = dot.amount;
				submitData.system.dots[i].types = new Set(Array.from(dot.types).sort());
			}
		}
		
		submitData.system.keywords = Array.from(Object.values(submitData.system.keywords || {})).filter(x => x);
		// CHANGES FROM CORE END HERE

		this.document.validate({ changes: submitData, clean: true, fallback: false });
		return submitData;
	}
	
	/* ----------------------------------------- */

	/**
	* Allows changing a field to re-render the form (such as for the DOT damage type selector/dropdown)
	* @param {MouseEvent} event      The originating change event
	*/
	_refresh(event) {
		return this.submit({ preventClose: true }).then(() => this.render());
	}
	
}
