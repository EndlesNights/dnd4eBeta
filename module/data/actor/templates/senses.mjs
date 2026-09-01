const { BooleanField, SchemaField, NumberField, StringField } = foundry.data.fields;
import { default as MappingField } from "../../fields/mapping-field.mjs";

export default class SensesTemplate extends foundry.abstract.DataModel {
	/** Getter for sense data. */
	static get common() {
		const basicSight = {
			nv: CONFIG.DND4E.senses.nv,
			lv: CONFIG.DND4E.senses.lv,
			dv: CONFIG.DND4E.senses.dv,
			blind: { label: "DND4E.VisionBlind" },
		};
		const specialSenses = foundry.utils.duplicate(CONFIG.DND4E.senses);
		delete specialSenses.nv;
		delete specialSenses.lv;
		delete specialSenses.dv;
		return {
			basic: new StringField({ required: true, initial: "nv", choices: basicSight }),
			special: new MappingField(new SchemaField({
				value: new BooleanField({ initial: false }),
				range: new NumberField({ required: true, nullable: true, initial: null }),
			}), {
				initialKeys: CONFIG.DND4E.senses,
				initialKeysOnly: true,
				label: "DND4E.SpecialSenses",
			}),
			allAround: new BooleanField({ initial: false, label: "DND4E.SpecialSensesAA" }),
			custom: new StringField({ initial: "" }),
			notes: new StringField({ initial: "" }),
		};
	}

	/** @inheritDoc */
	static defineSchema() {
		return {
			senses: new SchemaField(this.common, { label: "DND4E.Senses" }),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/**
	 * Convert single macro into macro array.
	 * @param {Object} source  The candidate source data from which the model will be constructed.
	 */
	static migrateSenses(source) {
		if (source.senses?.special?.value) {
			const oldSenses = Array.from(source.senses?.special?.value);
			delete source.senses?.special?.value;
			if (oldSenses.length) {
				for (const sense of oldSenses) {
					source.senses.special[`${sense[0]}`] = { value: true, range: sense[1] };
				}
			}
		}

		if (source.senses?.special?.aa) {
			source.senses.allAround = source.senses.special.aa.value;
			delete source.senses.special.aa;
		}

		if (source.senses?.special?.bv) {
			source.senses.blind = source.senses.special.bv.value;
			delete source.senses.special.bv;
		}

		if (source.senses?.special && ("custom" in source.senses.special)) {
			source.senses.custom = source.senses.special.custom;
			delete source.senses.special.custom;
		}

		if (source.senses?.special?.nv.value) {
			source.senses.basic = "nv";
			delete source.senses.special.nv;
		}
		if (source.senses?.special?.lv.value) {
			source.senses.basic = "lv";
			delete source.senses.special.lv;
		}
		if (source.senses?.special?.dv.value) {
			source.senses.basic = "dv";
			delete source.senses.special.dv;
		}
		if (source.senses?.blind) {
			source.senses.basic = "blind";
			delete source.senses.blind;
		}
	}
}
