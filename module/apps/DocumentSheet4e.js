export default class DocumentSheet4e extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheet) {

	/* -------------------------------------------- */

	/** @override */
	async _onRender(context, options) {
		await super._onRender(context, options);

        //Disables and adds warning to input fields that are being modfied by active effects
		if (this.isEditable) {
			for ( const override of this._getActorOverrides() ) {
				//html.find(`input[name="${override}"],select[name="${override}"]`).each((i, el) => {
                this.element.querySelectorAll(`input[name="${override}"],select[name="${override}"]`).forEach((el) => {
					el.disabled = true;
					el.dataset.tooltip = "DND4E.ActiveEffectOverrideWarning";
				});
			}
		}
	}

    /* -------------------------------------------- */
	/**
	 * Retrieve the list of fields that are currently modified by Active Effects on the Actor.
	 * @returns {string[]}
	 * @protected
	 */
	_getActorOverrides() {
		return Object.keys(foundry.utils.flattenObject(this.document.overrides || {}));
	}
}