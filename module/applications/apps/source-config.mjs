import DocumentSheet4e from "../sheets/DocumentSheet4e.mjs";

/**
 * Application for configuring the source data on actors and items.
 */
export default class SourceConfig extends DocumentSheet4e {
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: ["dnd4e", "source-config", "standard-form", "default"],
		sheetConfig: false,
		position: {
			width: 400,
		},
		form: {
			closeOnSubmit: true,
		},
	};

	/* -------------------------------------------- */

	/** @inheritDoc */
	static PARTS = {
		source: {
			template: "systems/dnd4e/templates/apps/source-config.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/** @inheritDoc */
	get title() {
		return _loc("DND4E.SOURCE.Action.Configure");
	}

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const source = this.document.system._source;
		context.buttons = [{ icon: "fa-regular fa-save", label: "Save", type: "Save" }];
		context.data = foundry.utils.getProperty(this.document, this.options.keyPath);
		context.fields = this.document.system.schema.getField("source").fields;
		context.keyPath = this.options.keyPath;
		context.source = source.source;
		context.sourceUuid = this.document._stats.compendiumSource;
		context.sourceAnchor = (await fromUuid(context.sourceUuid))?.toAnchor().outerHTML;
		if ("identifier" in this.document.system) context.identifier = {
			field: this.document.system.schema.getField("identifier"),
			placeholder: this.document.identifier,
			value: source.identifier,
		};
		return context;
	}
}
