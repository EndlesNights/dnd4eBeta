import { Helper } from "../helper.js"

export default class CustomSkillConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
	#customSkills;
	#originalIds;
	#needsReload = false;

	constructor(...args) {
		super(...args);
		this.#customSkills = foundry.utils.duplicate(game.settings.get("dnd4e", "custom-skills"));
		this.#originalIds = this.#customSkills.map(i => i.id);
	}

	static DEFAULT_OPTIONS = {
		id: "config-custom-skill-config",
		classes: ["dnd4e","custom-skill-config","standard-form","default"],
		window: {
			title: "SETTINGS.4eCustomSkillsL",
			resizable: true
		},
		position: {
			width: 480,
			height: "auto"
		},
		tag: "form",
		form: {
			handler: CustomSkillConfig.#onSubmit,
			closeOnSubmit: true,
			submitOnChange: false,
			submitOnClose: false
		},
		actions: {
			createSkill: CustomSkillConfig.#onCreateSkill,
			deleteSkill: CustomSkillConfig.#onDeleteSkill,
			cancel: CustomSkillConfig.#onCancel
		}
	}

	static PARTS = {
		main: {
			template: "systems/dnd4e/templates/apps/custom-skill-config.hbs",
			scrollable: [""]
		},
		footer: { template: "templates/generic/form-footer.hbs" }
	}

	/**
	 * @this {CustomSkillConfig}
	 */
	static #onCreateSkill(event, target) {
		this.#customSkills.push({
			ability: "none",
			armourCheck: false,
			id: "",
			label: ""
		});
		this.#needsReload = true;
		this.render();
	}

	/**
	 * @this {CustomSkillConfig}
	 */
	static #onDeleteSkill(event, target) {
		const li = target.closest("[data-row-id]");
		if (!li) return;
		const rowId = li.dataset.rowId;
		this.#customSkills.splice(rowId, 1);
		this.#needsReload = true;
		this.render();
	}

	/**
	 * @this {CustomSkillConfig}
	 */
	static #onCancel() {
		this.close();
	}

	_onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		const target = event.target;
		const li = target?.closest("[data-row-id]");
		if (!li) return;
		const rowId = li.dataset.rowId;
		if (target.name === "id") {
			if (target.value !== "" && this.#customSkills.find(i => i.id === target.value)) target.value = "";
		}
		this.#customSkills[rowId][target.name] = target.type === "checkbox" ? target.checked : target.value;
		this.render();
	}

	/**
	 * @this {CustomSkillConfig}
	 */
	static async #onSubmit(event, form, formData) {
		const validSkills = this.#customSkills.filter(i => i.id.trim().length && i.label.trim().length);
		await game.settings.set("dnd4e", "custom-skills", validSkills);
		if (this.#needsReload) await SettingsConfig.reloadConfirm({world: true});
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.customSkills = this.#customSkills;
		context.originalIds = this.#originalIds;
		context.abilities = CONFIG.DND4E.abilities;
		context.buttons = [
			{type: "submit", icon: "far fa-save", label: "DND4E.Save"},
			{type: "button", icon: "fas fa-ban", label: "DND4E.Cancel", action: "cancel"}
		];
		return context;
	}
}