import { BonusField, Dnd4eBonusesField } from "../fields/_module.mjs";
import MappingField from "../../fields/mapping-field.mjs";
import SpeedTemplate from "./speed.mjs";
import DetailsField from "./details.mjs";
import AttributesField from "./attributes.mjs";

const { ArrayField, BooleanField, DocumentUUIDField, NumberField, SchemaField, StringField } = foundry.data.fields;

export default class CombatantTemplate extends SpeedTemplate {
	/** Getter for defence data. */
	static get defences() {
		const numberConfig = { required: true, nullable: false, integer: true };
		return {
			value: new NumberField({ ...numberConfig, initial: 10 }),
			ability: new StringField({ initial: "" }),
			armour: new NumberField({ ...numberConfig, initial: 0 }),
			class: new NumberField({ ...numberConfig, initial: 0 }),
			enhance: new NumberField({ ...numberConfig, initial: 0 }),
			shield: new NumberField({ ...numberConfig, initial: 0 }),
			bonus: new BonusField(),
			temp: new NumberField({ ...numberConfig, initial: 0 }),
			light: new StringField({ initial: "auto" }),
			altability: new StringField({ initial: "" }),
			condition: new StringField({ initial: "Conditional Bonuses." }),
			chat: new StringField({ initial: "@name defends" }),
		};
	}

	/** @inheritDoc */
	static defineSchema() {
		const numberConfig = { required: true, nullable: false, integer: true };
		return {
			abilities: new MappingField(new SchemaField({
				value: new NumberField({ ...numberConfig, initial: 10 }),
				check: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 0 }),
					bonus: new BonusField(),
				}),
				chat: new StringField({ required: true, nullable: false, initial: "@name uses @label." }),
			}), { initialKeys: CONFIG.DND4E.abilities, initialKeysOnly: true, label: "DND4E.AbilityScores" }),
			attributes: new SchemaField(AttributesField.common),
			actionpoints: new SchemaField({
				value: new NumberField({ ...numberConfig, initial: 1 }),
				encounteruse: new BooleanField({ initial: false }),
				effects: new StringField({ initial: "" }),
				notes: new StringField({ initial: "" }),
				custom: new StringField({ initial: "" }),
			}),
			defences: new MappingField(new Dnd4eBonusesField(this.defences), {
				initialKeys: CONFIG.DND4E.defensives,
				initialKeysOnly: true,
				initialValue: this._initialDefencesValue,
				label: "DND4E.Defences",
			}),
			modifiers: new MappingField(new Dnd4eBonusesField({
				value: new NumberField({ ...numberConfig, initial: 0 }),
				class: new NumberField({ ...numberConfig, initial: 0 }),
				bonus: new BonusField(),
			}), { initialKeys: CONFIG.DND4E.modifiers, initialKeysOnly: true, label: "DND4E.Modifiers" }),
			skills: new MappingField(new Dnd4eBonusesField({
				value: new NumberField({ ...numberConfig, initial: 0 }),
				base: new NumberField({ ...numberConfig, initial: 0 }),
				training: new NumberField({ ...numberConfig, initial: 0 }),
				bonus: new BonusField(),
				ability: new StringField({ initial: "" }),
				armourCheck: new BooleanField({ initial: false }),
				chat: new StringField({ initial: "@name uses @label." }),
			}), {
				initialKeys: CONFIG.DND4E.skills,
				initialKeysOnly: true,
				initialValue: this._initialSkillValue,
				label: "DND4E.Skills",
			}),
			skillTraining: new SchemaField({
				untrained: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 0 }),
				}),
				trained: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 5 }),
				}),
				expertise: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 8 }),
				}),
			}),
			passive: new SchemaField({
				pasprc: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 0 }),
					skill: new StringField({ initial: "prc" }),
					bonus: new BonusField(),
				}),
				pasins: new Dnd4eBonusesField({
					value: new NumberField({ ...numberConfig, initial: 0 }),
					skill: new StringField({ initial: "ins" }),
					bonus: new BonusField(),
				}),
			}),
			details: new SchemaField(DetailsField.combatant),
			resistances: new MappingField(new SchemaField({
				value: new NumberField({ ...numberConfig, initial: 0 }),
				res: new NumberField({ ...numberConfig, initial: 0 }),
				vuln: new NumberField({ ...numberConfig, initial: 0 }),
				armour: new NumberField({ ...numberConfig, initial: 0 }),
				immune: new BooleanField({ initial: false }),
				bonus: new BonusField(),
			}), { initialKeys: CONFIG.DND4E.damageTypes, initialKeysOnly: true, label: "DND4E.DamResVuln" }),
			untypedResistances: new SchemaField({
				resistances: new ArrayField(new StringField(), { initial: [] }, { label: "DND4E.UntypedRes" }),
				vulnerabilities: new ArrayField(new StringField(), { initial: [] }, { label: "DND4E.UntypedVuln" }),
				immunities: new ArrayField(new StringField(), { initial: [] }, { label: "DND4E.UntypedImm" }),
			}),
			commonAttackBonuses: new MappingField(new Dnd4eBonusesField({
				value: new NumberField({ ...numberConfig, initial: 0 }),
				bonus: new BonusField(),
			}), {
				initialKeys: CONFIG.DND4E.commonAttackBonuses,
				initialKeysOnly: true,
				initialValue: this._initialCabValue,
				label: "DND4E.CommonAttackBonuses",
			}),
			marker: new DocumentUUIDField({ type: "Actor", required: true, nullable: true, initial: null }),
			powerGroupTypes: new StringField({ initial: "actionMod" }),
			powerSortTypes: new StringField({ initial: "actionType" }),
			ritualSortTypes: new StringField({ initial: "level" }),
			featureSortTypes: new StringField({ initial: "level" }),
			inventorySortTypes: new StringField({ initial: "level" }),
		};
	}

	/* -------------------------------------------- */

	/**
   * Populate the proper initial chat for the defences.
   * @param {string} key      Key for which the initial data will be created.
   * @param {Object} initial  The initial defence object created by the data model.
   * @returns {Object}        Initial defence object with the chat defined.
   * @private
   */
	static _initialDefencesValue(key, initial) {
		if (CONFIG.DND4E.defensives[key]?.chat) initial.chat = CONFIG.DND4E.defensives[key].chat;
		return initial;
	}

	/* -------------------------------------------- */

	/**
   * Populate the proper initial abilities & armourCheck for the skills.
   * @param {string} key      Key for which the initial data will be created.
   * @param {Object} initial  The initial skill object created by the data model.
   * @returns {Object}        Initial skill object with the ability defined.
   * @private
   */
	static _initialSkillValue(key, initial) {
		if (CONFIG.DND4E.skills[key]) {
			initial.ability = CONFIG.DND4E.skills[key].ability;
			initial.armourCheck = CONFIG.DND4E.skills[key].armourCheck;
		}
		return initial;
	}

	/* -------------------------------------------- */

	/**
   * Populate the proper initial value for the common attack bonuses.
   * @param {string} key      Key for which the initial data will be created.
   * @param {Object} initial  The initial CAB object created by the data model.
   * @returns {Object}        Initial CAB object with the value defined.
   * @private
   */
	static _initialCabValue(key, initial) {
		if (CONFIG.DND4E.commonAttackBonuses[key]) {
			initial.value = CONFIG.DND4E.commonAttackBonuses[key].value;
		}
		return initial;
	}
}
