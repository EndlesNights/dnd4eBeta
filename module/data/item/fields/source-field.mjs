import { formatIdentifier } from "../../../utils/utils.mjs";

const { NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * @import { SourceData } from "./_types.mjs";
 */

/**
 * Data fields that stores information on the sourcebook where this document originated.
 */
export default class SourceField extends SchemaField {
	constructor(fields = {}, options = {}) {
		fields = {
			book: new StringField(),
			page: new StringField(),
			custom: new StringField(),
			revision: new NumberField({ initial: 1 }),
			...fields,
		};
		Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
		super(fields, { label: "DND4E.SOURCE.FIELDS.source.label", ...options });
	}

	/* -------------------------------------------- */
	/*  Data Preparation                            */
	/* -------------------------------------------- */

	/**
   * Prepare the source label.
   * @this {SourceData}
   */
	static prepareData() {
		this.bookPlaceholder = "";
		if (!this.book) this.book = this.bookPlaceholder;

		if (this.custom) this.label = this.custom;
		else {
			const page = Number.isNumeric(this.page)
				? _loc("DND4E.SOURCE.Display.Page", { page: this.page }) : (this.page ?? "");
			this.label = _loc("DND4E.SOURCE.Display.Full", { book: this.book, page }).trim();
		}

		this.value = this.book;
		this.slug = formatIdentifier(this.value);

		Object.defineProperty(this, "directlyEditable", {
			value: (this.custom ?? "") === this.label,
			configurable: true,
			enumerable: false,
		});
	}
}
