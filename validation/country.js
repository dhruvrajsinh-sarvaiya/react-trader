// Added by Jayesh Pathak 09-10-2018 for adding country module - start
const Validator = require('validator');

exports.validateAddCountryInput = function (data) {
	let errors = {};

	if (typeof data == 'undefined') {
		errors.message = 'common.api.invalidrequest';
	}
	else {

		let localeerror = false;

		Object.keys(data.locale).forEach((lg, index) => {

			errors[lg] = {};

			if (!(data.locale[lg]) || typeof (data.locale[lg]) == 'undefined' || (data.locale[lg]) == "" || data.locale[lg].length == 0 || Validator.isEmpty(data.locale[lg] + '')) {
				errors[lg] = 'countries.countryform.error.countryNameReq';
				localeerror = true;
			}

			else if (!Validator.isLength(data.locale[lg] + '', { min: 2, max: 100 })) {
				errors[lg] = 'countries.countryform.error.countryNameCharLimit';
				localeerror = true;
			}

			if (!localeerror) {
				delete errors[lg];
			}
		});


		if (!data.countryCode || typeof data.countryCode == 'undefined' || data.countryCode == "" || data.countryCode.length == 0 || Validator.isEmpty(data.countryCode.trim() + '')) {
			errors.countryCode = 'countries.countryform.error.countryCodeReq';
		} else if (!Validator.isAlpha(data.countryCode + '')) {
			errors.countryCode = 'countries.countryform.error.countryNameChar';
		} else if (!Validator.isLength(data.countryCode + '', { min: 2, max: 2 })) {
			errors.countryCode = 'countries.countryform.error.countryCodeCharLimit';
		}

		if (typeof data.status == 'undefined' || data.status.length == 0 || Validator.isEmpty(data.status + '')) {
			errors.status = 'countries.countryform.error.statusReq';
		} else if (!Validator.isInt(data.status + '', { min: 0, max: 1 })) {
			errors.status = 'countries.countryform.error.statusNum';
		}
	}

	return {
		errors,
		isValid: Object.keys(errors).length > 0 ? false : true
	};

};


exports.validateGetCountryByIdInput = function (data) {

	let errors = {};

	if (typeof data == 'undefined') {
		errors.message = 'common.api.invalidrequest';
	}
	else {

		if (!data.countryId || typeof data.countryId == 'undefined' || data.countryId == "" || data.countryId.length == 0 || Validator.isEmpty(data.countryId + '')) {
			errors.countryId = 'countries.countryform.error.countryIdReq';
		} else if (!Validator.isInt(data.countryId + '', { min: 1 })) {
			errors.countryId = 'countries.countryform.error.countryIdNum';
		}
	}
	return {
		errors,
		isValid: Object.keys(errors).length > 0 ? false : true
	};

};

exports.validateUpdateCountryInput = function (data) {

	let errors = {};

	if (typeof data == 'undefined') {
		errors.message = 'common.api.invalidrequest';
	}
	else {

		let localeerror = false;

		Object.keys(data.locale).forEach((lg, index) => {

			errors[lg] = {};

			if (!(data.locale[lg]) || typeof (data.locale[lg]) == 'undefined' || (data.locale[lg]) == "" || data.locale[lg].length == 0 || Validator.isEmpty(data.locale[lg] + '')) {
				errors[lg] = 'countries.countryform.error.countryNameReq';
				localeerror = true;
			}

			else if (!Validator.isLength(data.locale[lg] + '', { min: 2, max: 100 })) {
				errors[lg] = 'countries.countryform.error.countryNameCharLimit';
				localeerror = true;
			}

			if (!localeerror) {
				delete errors[lg];
			}
		});

		if (!data.countryCode || typeof data.countryCode == 'undefined' || data.countryCode == "" || data.countryCode.length == 0 || Validator.isEmpty(data.countryCode.trim() + '')) {
			errors.countryCode = 'countries.countryform.error.countryCodeReq';
		} else if (!Validator.isAlpha(data.countryCode + '')) {
			errors.countryCode = 'countries.countryform.error.countryNameChar';
		} else if (!Validator.isLength(data.countryCode + '', { min: 2, max: 2 })) {
			errors.countryCode = 'countries.countryform.error.countryCodeCharLimit';
		}

		if (typeof data.status == 'undefined' || data.status.length == 0 || Validator.isEmpty(data.status + '')) {
			errors.status = 'countries.countryform.error.statusReq';
		} else if (!Validator.isInt(data.status + '', { min: 0, max: 1 })) {
			errors.status = 'countries.countryform.error.statusNum';
		}

		if (!data.countryId || typeof data.countryId == 'undefined' || data.countryId == "" || data.countryId.length == 0 || Validator.isEmpty(data.countryId + '')) {
			errors.countryId = 'countries.countryform.error.countryIdReq';
		} else if (!Validator.isInt(data.countryId + '', { min: 1 })) {
			errors.countryId = 'countries.countryform.error.countryIdNum';
		}
	}
	return {
		errors,
		isValid: Object.keys(errors).length > 0 ? false : true
	};

};
// Added by Jayesh Pathak 09-10-2018 for adding country module - end