export default class CustomStatusConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
	#customStatuses;
	#originalIds;
	#needsReload = false;

	constructor(...args) {
		super(...args);
		this.#customStatuses = foundry.utils.duplicate(game.settings.get("dnd4e", "custom-statuses"));
		this.#originalIds = this.#customStatuses.map(i => i.id);
	}

	static DEFAULT_OPTIONS = {
		id: "config-custom-status-config",
		classes: ["dnd4e", "custom-status-config", "standard-form", "default"],
		window: {
			title: "SETTINGS.4eCustomStatusesL",
			resizable: true,
		},
		position: {
			width: 480,
			height: "auto",
		},
		tag: "form",
		form: {
			handler: CustomStatusConfig.#onSubmit,
			closeOnSubmit: true,
			submitOnChange: false,
			submitOnClose: false,
		},
		actions: {
			editImage: CustomStatusConfig.#onEditImage,
			createStatus: CustomStatusConfig.#onCreateStatus,
			deleteStatus: CustomStatusConfig.#onDeleteStatus,
			cancel: CustomStatusConfig.#onCancel,
		},
	};

	static PARTS = {
		main: {
			template: "systems/dnd4e/templates/apps/custom-status-config.hbs",
			scrollable: [""],
		},
		footer: { template: "templates/generic/form-footer.hbs" },
	};

	/* -------------------------------------------- */

	/**
	 * @this {CustomStatusConfig}
	 */
	static async #onEditImage(event, target) {
		if (!game.user.isGM) return;
		const defaultArtwork = { img: "icons/svg/aura.svg" };
		const defaultImage = foundry.utils.getProperty(defaultArtwork, "img");
		const li = target?.closest("[data-row-id]");
		if (!li) return;
		const rowId = li.dataset.rowId;
		const fp = new CONFIG.ux.FilePicker({
			current: this.#customStatuses[rowId].img,
			type: "image",
			redirectToRoot: defaultImage ? [defaultImage] : [],
			callback: (path) => {
				this.#customStatuses[rowId].img = path;
				this.#needsReload = true;
				this.render();
			},
			top: this.position.top + 40,
			left: this.position.left + 10,
		});
		await fp.browse();
	}

	/**
	 * @this {CustomStatusConfig}
	 */
	static #onCreateStatus(event, target) {
		this.#customStatuses.push({
			name: "",
			id: "",
			description: "",
			img: "icons/svg/aura.svg",
		});
		this.#needsReload = true;
		this.render();
	}

	/**
	 * @this {CustomStatusConfig}
	 */
	static #onDeleteStatus(event, target) {
		const li = target.closest("[data-row-id]");
		if (!li) return;
		const rowId = li.dataset.rowId;
		this.#customStatuses.splice(rowId, 1);
		this.#needsReload = true;
		this.render();
	}

	/**
	 * @this {CustomStatusConfig}
	 */
	static #onCancel() {
		this.close();
	}

	/** @inheritDoc */
	_onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		const target = event.target;
		const li = target?.closest("[data-row-id]");
		if (!li) return;
		const rowId = li.dataset.rowId;
		if (target.name === "id") {
			if ((target.value !== "") && this.#customStatuses.find(i => i.id === target.value)) target.value = "";
		}
		this.#customStatuses[rowId][target.name] = target.value;
		this.render();
	}

	/**
     * @this {CustomStatusConfig}
     * @param {Event} event
     * @param {Object} form
     * @param {Object} formData
     */
	static async #onSubmit(event, form, formData) {
		const validStatuses = this.#customStatuses.filter(i => i.id.trim().length && i.name.trim().length);
		await game.settings.set("dnd4e", "custom-statuses", validStatuses);
		if (this.#needsReload) await foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true });
	}

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.customStatuses = this.#customStatuses;
		context.originalIds = this.#originalIds;
		context.buttons = [
			{ type: "submit", icon: "far fa-save", label: "DND4E.Save" },
			{ type: "button", icon: "fas fa-ban", label: "DND4E.Cancel", action: "cancel" },
		];
		return context;
	}
}
