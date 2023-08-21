export default class DocumentSheet4e extends DocumentSheet {

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

        //Disabels and adds warning to input fields that are being modfied by active effects
		if (this.isEditable) {
			for ( const override of this._getActorOverrides() ) {
				html.find(`input[name="${override}"],select[name="${override}"]`).each((i, el) => {
					el.disabled = true;
					el.dataset.tooltip = "DND4EBETA.ActiveEffectOverrideWarning";
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
		return Object.keys(foundry.utils.flattenObject(this.object.overrides || {}));
	}

}