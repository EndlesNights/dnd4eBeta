export default class CustomStatusConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
	#customStatuses;
	#originalIds;
	#needsReload = false;

	static LEGACY_STATUSES = {
		curse: {
			name: "EFFECT.statusCurse",
			img: "systems/dnd4e/icons/statusEffects/curse.svg",
			description: "EFFECTDESC.curse",
		},
		oath: {
			name: "EFFECT.statusOath",
			img: "systems/dnd4e/icons/statusEffects/oath.svg",
			description: "EFFECTDESC.oath",
		},
		hunter_mark: {
			name: "EFFECT.statusHunterMark",
			img: "systems/dnd4e/icons/statusEffects/hunter_mark.svg",
			description: "EFFECTDESC.huntermark",
		},
		sneaking: {
			name: "EFFECT.statusSneaking",
			img: "systems/dnd4e/icons/statusEffects/sneaking.svg",
			description: "EFFECTDESC.sneaking",
		},
		target: {
			name: "EFFECT.statusTarget",
			img: "systems/dnd4e/icons/statusEffects/target.svg",
			description: "EFFECTDESC.target",
		},
		ongoing_1: {
			name: "EFFECT.statusOngoing1",
			img: "systems/dnd4e/icons/statusEffects/ongoing_1.svg",
			description: "EFFECTDESC.ongoing",
		},
		ongoing_2: {
			name: "EFFECT.statusOngoing2",
			img: "systems/dnd4e/icons/statusEffects/ongoing_2.svg",
			description: "EFFECTDESC.ongoing",
		},
		ongoing_3: {
			name: "EFFECT.statusOngoing3",
			img: "systems/dnd4e/icons/statusEffects/ongoing_3.svg",
			description: "EFFECTDESC.ongoing",
		},
		regen: {
			name: "EFFECT.statusRegen",
			img: "systems/dnd4e/icons/statusEffects/regen.svg",
			description: "EFFECTDESC.regen",
		},
		attack_up: {
			name: "EFFECT.statusAttackUp",
			img: "systems/dnd4e/icons/statusEffects/attack_up.svg",
			description: "EFFECTDESC.attackUp",
		},
		attack_down: {
			name: "EFFECT.statusAttackDown",
			img: "systems/dnd4e/icons/statusEffects/attack_down.svg",
			description: "EFFECTDESC.attackDown",
		},
		defUp: {
			name: "EFFECT.statusDefUp",
			img: "systems/dnd4e/icons/statusEffects/def_up.svg",
			description: "EFFECTDESC.defUp",
		},
		defDown: {
			name: "EFFECT.statusDefDown",
			img: "systems/dnd4e/icons/statusEffects/def_down.svg",
			description: "EFFECTDESC.defDown",
		},
		mark_2: {
			name: "EFFECT.statusMark2",
			img: "systems/dnd4e/icons/statusEffects/mark_2.svg",
			description: "EFFECTDESC.mark",
		},
		mark_3: {
			name: "EFFECT.statusMark3",
			img: "systems/dnd4e/icons/statusEffects/mark_3.svg",
			description: "EFFECTDESC.mark",
		},
		mark_4: {
			name: "EFFECT.statusMark4",
			img: "systems/dnd4e/icons/statusEffects/mark_4.svg",
			description: "EFFECTDESC.mark",
		},
		mark_5: {
			name: "EFFECT.statusMark5",
			img: "systems/dnd4e/icons/statusEffects/mark_5.svg",
			description: "EFFECTDESC.mark",
		},
		mark_6: {
			name: "EFFECT.statusMark6",
			img: "systems/dnd4e/icons/statusEffects/mark_6.svg",
			description: "EFFECTDESC.mark",
		},
		mark_7: {
			name: "EFFECT.statusMark7",
			img: "systems/dnd4e/icons/statusEffects/mark_7.svg",
			description: "EFFECTDESC.mark",
		},
		ammo_count: {
			name: "EFFECT.statusAmmoCount",
			img: "systems/dnd4e/icons/statusEffects/ammo_count.svg",
			description: "EFFECTDESC.ammoCount",
		},
		torch: {
			name: "EFFECT.statusTorch",
			img: "systems/dnd4e/icons/statusEffects/torch.svg",
			description: "EFFECTDESC.torch",
		},
		drunk: {
			name: "EFFECT.statusDrunk",
			img: "systems/dnd4e/icons/statusEffects/drunk.svg",
			description: "EFFECTDESC.drunk",
		},
		sleeping: {
			name: "EFFECT.statusSleeping",
			img: "systems/dnd4e/icons/statusEffects/sleeping.svg",
			description: "EFFECTDESC.sleeping",
		},
		disarmed: {
			name: "EFFECT.statusDisarmed",
			img: "systems/dnd4e/icons/statusEffects/disarmed.svg",
			description: "EFFECTDESC.disarmed",
		},
	};

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
			restoreLegacy: CustomStatusConfig.#onRestoreLegacyStatuses,
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
	static #onRestoreLegacyStatuses(event, target) {
		for (const statusId of Object.keys(this.constructor.LEGACY_STATUSES)) {
			const status = this.constructor.LEGACY_STATUSES[statusId];
			if (this.#customStatuses.some((s) => s.id === statusId)) continue;
			this.#customStatuses.push({
				name: _loc(status.name),
				id: statusId,
				description: _loc(status.description),
				img: status.img,
			});
		}
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
