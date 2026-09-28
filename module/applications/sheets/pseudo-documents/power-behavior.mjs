
import PsuedoDocumentSheet from "../../api/pseudo-document-sheet.mjs";
/**
 * @import {FormNode, FormFooterButton} from "../_types.mjs";
 * @import {DataSchema} from "@common/abstract/_types.mjs";
 */

/**
 * The Scene Region configuration application.
 * @extends DocumentSheetV2
 * @mixes HandlebarsApplication
 */
export default class PowerBehaviorSheet extends PsuedoDocumentSheet {
	constructor(options) {
		super(options);
		this.options.window.icon = CONFIG.RegionBehavior.typeIcons[this.pseudoDocument.type];
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: ["sheet", "region-behavior-config"],
	};

	/** @override */
	static PARTS = {
		form: {
			template: "templates/generic/form-fields.hbs",
			scrollable: [""],
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/* -------------------------------------------- */
	/*  Context Preparation                         */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		return Object.assign(context, {
			fields: this._getFields(),
			hint: CONFIG.RegionBehavior.typeHints[context.document.type],
			buttons: this._getButtons(),
		});
	}

	/* -------------------------------------------- */

	/**
	 * Prepare form field structure for rendering.
	 * @returns {FormNode[]}
	 * @protected
	 */
	_getFields() {
		const doc = this.pseudoDocument;
		const source = doc._source;
		const fields = doc.schema.fields;
		const { events, ...systemFields } = CONFIG.RegionBehavior.dataModels[doc.type].schema.fields;
		const fieldsets = [];

		// Identity
		fieldsets.push({
			fieldset: true,
			legend: "BEHAVIOR.SECTIONS.identity",
			fields: [
				{ field: fields.name, value: source.name },
			],
		});

		// Subscribed events
		if (events) {
			fieldsets.push({
				fieldset: true,
				legend: "BEHAVIOR.TYPES.base.SECTIONS.events",
				fields: [
					{ field: events, value: source.system.events },
				],
			});
		}

		// Other system fields
		const sf = { fieldset: true, legend: CONFIG.RegionBehavior.typeLabels[doc.type], fields: [] };
		this.#addSystemFields(sf, systemFields, source);
		if (sf.fields.length) fieldsets.push(sf);
		return fieldsets;
	}

	/* -------------------------------------------- */

	/**
	 * Recursively add system model fields to the fieldset.
	 * @param {boolean} fieldset
	 * @param {DataSchema} schema
	 * @param {object} source
	 * @param {string} [_path]
	 */
	#addSystemFields(fieldset, schema, source, _path = "system") {
		for (const field of Object.values(schema)) {
			const path = `${_path}.${field.name}`;
			if (field.constructor.hasFormSupport) {
				fieldset.fields.push({ field, value: foundry.utils.getProperty(source, path) });
			}
			else if (field instanceof foundry.data.fields.SchemaField) {
				this.#addSystemFields(fieldset, field.fields, source, path);
			}
		}
	}

	/* -------------------------------------------- */

	/**
	 * Get footer buttons for this behavior config sheet.
	 * @returns {FormFooterButton[]}
	 * @protected
	 */
	_getButtons() {
		return [
			{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "BEHAVIOR.ACTIONS.update" },
		];
	}
}
