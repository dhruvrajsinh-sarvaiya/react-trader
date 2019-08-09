// Added by Jayesh Pathak 26-10-2018 for adding language module - start
const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateAddLanguageInput = function(data) {

  let errors = {};
  
  if (typeof data == 'undefined')
  {
    errors.message = 'Invalid Request';
  }
  else
  {

	  if( !data.language_name || typeof data.language_name == 'undefined' || data.language_name == "" || data.language_name.length == 0 || Validator.isEmpty(data.language_name+'' )) {
		errors.language_name = 'languages.languageform.error.language_nameReq';
	  } else if (!Validator.isAlpha(Validator.blacklist(data.language_name, ' ')+'')) {
		errors.language_name = 'languages.languageform.error.language_nameChar';
	  } else if (!Validator.isLength(data.language_name+'', { min: 2, max: 100 })) {
		errors.language_name = 'languages.languageform.error.language_nameCharLimit';
	  }
	  
	  if( !data.code || typeof data.code == 'undefined' || data.code == "" || data.code.length == 0 || Validator.isEmpty(data.code+'')) {
		errors.code = 'languages.languageform.error.codeReq';
	  } else if (!Validator.isAlpha(data.code+'')) {
		errors.code = 'languages.languageform.error.language_nameChar';
	  } else if (!Validator.isLength(data.code+'', { min: 2, max: 2 })) {
		errors.code = 'languages.languageform.error.codeCharLimit';
	  }
	  
	  if( !data.locale || typeof data.locale == 'undefined' || data.locale == "" || data.locale.length == 0 || Validator.isEmpty(data.locale+'' )) {
		errors.locale = 'languages.languageform.error.localeReq';
	  } else if (!Validator.isAlphanumeric(Validator.blacklist(data.locale, ' ')+'')) {
		errors.locale = 'languages.languageform.error.localeChar';
	  } else if (!Validator.isLength(data.locale+'', { min: 2, max: 255 })) {
		errors.locale = 'languages.languageform.error.localeCharLimit';
	  }
	  
	  if( !data.sort_order || typeof data.sort_order == 'undefined' || data.sort_order == "" || data.sort_order.length == 0 || Validator.isEmpty(data.sort_order+'')) {
		errors.sort_order = 'languages.languageform.error.sort_orderReq';
	  } else if (!Validator.isInt(data.sort_order+'', { min: 1 })) {
		errors.sort_order = 'languages.languageform.error.sort_orderNum';
	  }
	  
	  if( !data.status || typeof data.status == 'undefined' || data.status == "" || data.status.length == 0 || Validator.isEmpty(data.status+'')) {
		errors.status = 'languages.languageform.error.statusReq';
	  } else if (!Validator.isInt(data.status+'', { min: 0, max: 1 })) {
		errors.status = 'languages.languageform.error.statusNum';
	  }

  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  };
  
};


exports.validateGetLanguageByIdInput = function(data) {
 
  let errors = {};
  
  if (typeof data == 'undefined')
  {
    errors.message = 'Invalid Request';
  }
  else
  {
	  if( !data.id || typeof data.id == 'undefined' || data.id == "" || data.id.length == 0 || Validator.isEmpty(data.id+'')) {
		errors.id = 'languages.languageform.error.idReq';
	  } else if (!Validator.isInt(data.id+'', { min: 1 })) {
		errors.id = 'languages.languageform.error.idNum';
	  }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
  
};

exports.validateUpdateLanguageInput = function(data) {
  
  let errors = {};
  
  if (typeof data == 'undefined')
  {
    errors.message = 'Invalid Request';
  }
  else
  {

	  if( !data.language_name || typeof data.language_name == 'undefined' || data.language_name == "" || data.language_name.length == 0 || Validator.isEmpty(data.language_name+'')) {
		errors.language_name = 'languages.languageform.error.language_nameReq';
	  } else if (!Validator.isAlpha(Validator.blacklist(data.language_name, '\\ \\,\\-')+'')) {
		errors.language_name = 'languages.languageform.error.language_nameChar';
	  } else if (!Validator.isLength(data.language_name+'', { min: 2, max: 100 })) {
		errors.language_name = 'languages.languageform.error.language_nameCharLimit';
	  }
	  

	  if( !data.code || typeof data.code == 'undefined' || data.code == "" || data.code.length == 0 || Validator.isEmpty(data.code+'')) {
		errors.code = 'languages.languageform.error.codeReq';
	  } else if (!Validator.isAlpha(data.code+'')) {
		errors.code = 'languages.languageform.error.language_nameChar';
	  } else if (!Validator.isLength(data.code+'', { min: 2, max: 2 })) {
		errors.code = 'languages.languageform.error.codeCharLimit';
	  }
	  
	  if( !data.locale || typeof data.locale == 'undefined' || data.locale == "" || data.locale.length == 0 || Validator.isEmpty(data.locale+'' )) {
		errors.locale = 'languages.languageform.error.localeReq';
	  } else if (!Validator.isAlphanumeric(Validator.blacklist(data.locale, '\\ \\,\\-')+'')) {
		errors.locale = 'languages.languageform.error.localeChar';
	  } else if (!Validator.isLength(data.locale+'', { min: 2, max: 255 })) {
		errors.locale = 'languages.languageform.error.localeCharLimit';
	  }
	  
	  if( !data.sort_order || typeof data.sort_order == 'undefined' || data.sort_order == "" || data.sort_order.length == 0 || Validator.isEmpty(data.sort_order+'')) {
		errors.sort_order = 'languages.languageform.error.sort_orderReq';
	  } else if (!Validator.isInt(data.sort_order+'', { min: 1 })) {
		errors.sort_order = 'languages.languageform.error.sort_orderNum';
	  }

	  if(typeof data.status == 'undefined' || data.status.length == 0 || Validator.isEmpty(data.status+'')) {
		errors.status = 'languages.languageform.error.statusReq';
	  } else if (!Validator.isInt(data.status+'', { min: 0, max: 1 })) {
		errors.status = 'languages.languageform.error.statusNum';  
	  }

	  if( !data.id || typeof data.id == 'undefined' || data.id == "" || data.id.length == 0 || Validator.isEmpty(data.id+'')) {
		errors.id = 'languages.languageform.error.idReq';
	  } else if (!Validator.isInt(data.id+'', { min: 1 })) {
		errors.id = 'languages.languageform.error.idNum';
	  }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
  
};

/* exports.validateDeleteLanguageInput = function(data) {
 
 let errors = {};
  
  if( !data.id || typeof data.id == 'undefined' || data.id == "" || data.id.length == 0 || Validator.isEmpty(data.id+'')) {
    errors.id = 'languages.languageform.error.idReq';
  } else if (!Validator.isInt(data.id+'', { min: 1 })) {
    errors.id = 'languages.languageform.error.idNum';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
  
}; */
// Added by Jayesh Pathak 26-10-2018 for adding language module - end