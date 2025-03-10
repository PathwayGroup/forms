import { cookies } from '@eightshift/frontend-libs/scripts/helpers';
import { prefix, setStateWindow } from './state-init';

/**
 * Geolocation class.
 */
export class Geolocation {
	constructor(utils) {
		/** @type {import('./utils').Utils} */
		this.utils = utils;
		/** @type {import('./state').State} */
		this.state = this.utils.getState();

		// Set all public methods.
		this.publicMethods();
	}

	////////////////////////////////////////////////////////////////
	// Public methods
	////////////////////////////////////////////////////////////////

	/**
	 * Init one action.
	 *
	 * @returns {void}
	 */
	initOne(formId) {
		// Check if enrichment is used.
		if (!this.state.getStateGeolocationIsUsed()) {
			return;
		}

		// Set select fields based on geolocation.
		window?.addEventListener(
			this.state.getStateEvent('formJsLoaded'),
			this.onSetSelectField
		);
	}


	////////////////////////////////////////////////////////////////
	// Other
	////////////////////////////////////////////////////////////////

	/**
	 * Remove all event listeners from elements.
	 * 
	 * @returns {vodi}
	 */
	removeEvents(formId) {
		window?.removeEventListener(
			this.state.getStateEvent('formJsLoaded'),
			this.onSetSelectField
		);
	}

	////////////////////////////////////////////////////////////////
	// Events callback
	////////////////////////////////////////////////////////////////

	/**
	 * Detect if we have country cookie and set value to the select.
	 *
	 * @param {object} event Event callback.
	 *
	 * @returns {void}
	 */
	onSetSelectField = (event) => {
		const { formId } = event.detail;
		const countryCookie = cookies?.getCookie('esForms-country')?.toLocaleLowerCase();

		if (!countryCookie) {
			return;
		}

		[
			...this.state.getStateElementByTypeField('select', formId),
			...this.state.getStateElementByTypeField('country', formId),
		].forEach((select) => {
			const name = select.name;

			const custom = this.state.getStateElementCustom(name, formId);

			const selectValue = this.getSelectSelectedValueByCustomData(countryCookie, custom);

			if (selectValue) {
				this.utils.setManualSelectValue(formId, name, [
					{
						value: selectValue?.value ?? '',
						meta: selectValue?.customProperties ?? {},
					}
				]);
			}
		});

		[...this.state.getStateElementByTypeField('phone', formId)].forEach((phone) => {
			const name = phone.name;

			const custom = this.state.getStateElementCustom(name, formId);

			const selectValue = this.getSelectSelectedValueByCustomData(countryCookie, custom);

			if (selectValue) {
				this.utils.setManualPhoneValue(formId, name, {
					prefix: selectValue?.value ?? '',
					value: '',
					meta: selectValue?.customProperties ?? {},
				});
			}
		});
	};

	/**
	 * Get selected value by custom data of select for country and phone.
	 *
	 * @param {string} type Type for field.
	 * @param {string} value Value to check.
	 * @param {object} choices Choices object.
	 *
	 * @returns {string}
	 */
	getSelectSelectedValueByCustomData(value, choices) {
		return choices?.config?.choices?.find((item) => item?.customProperties?.[this.state.getStateAttribute('selectCountryCode')] === value);
	}

	////////////////////////////////////////////////////////////////
	// Private methods - not shared to the public window object.
	////////////////////////////////////////////////////////////////

	/**
	 * Set all public methods.
	 *
	 * @returns {void}
	 */
	publicMethods() {
		setStateWindow();

		if (window[prefix].geolocation) {
			return;
		}

		window[prefix].geolocation = {
			initOne: () => {
				this.initOne();
			},
			removeEvents: (formId) => {
				this.removeEvents(formId);
			},
			onSetSelectField: (event) => {
				this.onSetSelectField(event);
			},
		};
	}
}
