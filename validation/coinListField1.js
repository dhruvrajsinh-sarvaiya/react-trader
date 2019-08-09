const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateCoinListFieldsInput = function(data) {
  let errors = {};
  if (typeof data == 'undefined')
  {
    errors.message = 'common.api.invalidrequest';
  }
  else
  { 
    data.forEach((info, index) => {
      if (Validator.isEmpty(info.fieldname+'')) {
        errors.fieldname = 'coinListField.error.fieldname';
      }
      if(typeof info.status == 'undefined') {
          errors.status = 'coinListField.error.status';
      } else if (!Validator.isInt(info.status+'', { min: 0, max: 1 })) {
          errors.status = 'coinListField.error.statusNum';
      }
    });
  }
  return {
    errors,
    isValid: Object.keys(errors).length > 0 ? true : false
  };
};

exports.validateCoinListRequestFormInput = function(data,coinListFields,userId) {
  let errors = {};
    if (typeof data == 'undefined')
    {
        errors.message = 'common.api.invalidrequest';
    }
    else if (typeof coinListFields == 'undefined')
    {
        errors.message = 'coinListRequestForm.error.common';
    }
    else if(typeof userId == 'undefined' || userId == "" || userId.length == 0 || Validator.isEmpty(userId+'')) {
        errors.message = 'surveys.surveyform.error.userIdReq';
    }
    else
    {
        //CoinName
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_name")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_name"))].status == 1)){
            if( !data.coin_name || typeof data.coin_name == 'undefined' || data.coin_name == "" || data.coin_name.length == 0 || Validator.isEmpty(data.coin_name.trim()+'')) {
                errors.coin_name = 'coinListRequestForm.error.CoinName';
            }else if (!Validator.isLength(data.coin_name+'', { min: 2, max: 100 })) {
                errors.coin_name = 'coinListRequestForm.error.CoinNameLimit';
            }      
        }
        //coin logo
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_logo")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_logo"))].status == 1)){
            if( !data.coin_logo || typeof data.coin_logo == 'undefined' || data.coin_logo == "" || data.coin_logo.length == 0 || Validator.isEmpty(data.coin_logo.trim()+'')) {
            errors.coin_logo = 'coinListRequestForm.error.coinLogo';
            }else if(!Validator.isURL(data.coin_logo+"",['http','https'])){
                errors.coin_logo = 'coinListRequestForm.error.validUrl';
            }
            
        }

        //coin_website
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_website")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_website"))].status == 1)){
            if( !data.coin_website || typeof data.coin_website == 'undefined' || data.coin_website == "" || data.coin_website.length == 0 || Validator.isEmpty(data.coin_website.trim()+'')) {
                errors.coin_website = 'coinListRequestForm.error.coinWebsite';
            }else if(!Validator.isURL(data.coin_website+"",['http','https'])){
                errors.coin_website = 'coinListRequestForm.error.validUrl';
            }
        }

        //Whitepaper business
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "whitepaper_business")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "whitepaper_business"))].status == 1)){
            if( !data.whitepaper_business || typeof data.whitepaper_business == 'undefined' || data.whitepaper_business == "" || data.whitepaper_business.length == 0 || Validator.isEmpty(data.whitepaper_business.trim()+'')) {
                errors.whitepaper_business = 'coinListRequestForm.error.whitepaper_business';
            }
        }

        //Whitepaper business
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "whitepaper_technical")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "whitepaper_technical"))].status == 1)){
            if( !data.whitepaper_technical || typeof data.whitepaper_technical == 'undefined' || data.whitepaper_technical == "" || data.whitepaper_technical.length == 0 || Validator.isEmpty(data.whitepaper_technical.trim()+'')) {
                errors.whitepaper_technical = 'coinListRequestForm.error.whitepaper_technical';
            }
        }
        //official_gitHub_repository_link
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "official_gitHub_repository_link")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "official_gitHub_repository_link"))].status == 1)){
            if(!data.official_gitHub_repository_link || typeof data.official_gitHub_repository_link == 'undefined' || data.official_gitHub_repository_link == "" || data.official_gitHub_repository_link.length == 0 || Validator.isEmpty(data.official_gitHub_repository_link.trim()+'')) {
                errors.official_gitHub_repository_link = 'coinListRequestForm.error.official_gitHub_repository_link';
            }else if(!Validator.isURL(data.official_gitHub_repository_link+"",['http','https'])){
                errors.official_gitHub_repository_link = 'coinListRequestForm.error.official_gitHub_repository_link_url';
            }
        }

        //team contact
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "team_contact")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "team_contact"))].status == 1)){
            if( !data.team_contact || typeof data.team_contact == 'undefined' || data.team_contact == "" || data.team_contact.length == 0 || Validator.isEmpty(data.team_contact.trim()+'')) {
                errors.team_contact = 'coinListRequestForm.error.team_contact';
            }
        }

        //headquarter_address
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "headquarter_address")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "headquarter_address"))].status == 1)){
            if( !data.headquarter_address || typeof data.headquarter_address == 'undefined' || data.headquarter_address == "" || data.headquarter_address.length == 0 || Validator.isEmpty(data.headquarter_address.trim()+'')) {
                errors.headquarter_address = 'coinListRequestForm.error.headquarter_address';
            }
        }

        //wallet_source_code
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "wallet_source_code")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "wallet_source_code"))].status == 1)){
            if(typeof data.wallet_source_code != 'undefined' && data.wallet_source_code !="" && data.wallet_source_code != null &&  !Validator.isURL(data.wallet_source_code+"",['http','https'])){
                errors.wallet_source_code = 'coinListRequestForm.error.validUrl';
            }
        }
        //node_source_code
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "node_source_code")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "node_source_code"))].status == 1)){
            if(typeof data.node_source_code != 'undefined' && data.node_source_code !="" && data.node_source_code != null &&  !Validator.isURL(data.node_source_code+"",['http','https'])){
                errors.node_source_code = 'coinListRequestForm.error.validUrl';
            }
        }

         //official_blockchain_explorer_link
         if((coinListFields.findIndex(coinListformField => (coinListformField.key === "official_blockchain_explorer_link")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "official_blockchain_explorer_link"))].status == 1)){
            if( !data.official_blockchain_explorer_link || typeof data.official_blockchain_explorer_link == 'undefined' || data.official_blockchain_explorer_link == "" || data.official_blockchain_explorer_link.length == 0 || Validator.isEmpty(data.official_blockchain_explorer_link.trim()+'')) {
                errors.official_blockchain_explorer_link = 'coinListRequestForm.error.official_blockchain_explorer_link';
            }else if(!Validator.isURL(data.official_blockchain_explorer_link+"",['http','https'])){
                errors.official_blockchain_explorer_link = 'coinListRequestForm.error.official_gitHub_repository_link_url';
            }
        }

        //max_coin_supply
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "max_coin_supply")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "max_coin_supply"))].status == 1)){
            if( !data.max_coin_supply || typeof data.max_coin_supply == 'undefined' || data.max_coin_supply == "" || data.max_coin_supply.length == 0 || Validator.isEmpty(data.max_coin_supply.trim()+'')) {
                errors.max_coin_supply = 'coinListRequestForm.error.max_coin_supply';
            }
        }
         //social_media_links
         if((coinListFields.findIndex(coinListformField => (coinListformField.key === "social_media_links")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "social_media_links"))].status == 1)){
            if(typeof data.social_media_links != 'undefined' && data.social_media_links !="" && data.social_media_links != null &&  !Validator.isURL(data.social_media_links+"",['http','https'])){
                errors.social_media_links = 'coinListRequestForm.error.validUrl';
            }
        }

        //code_review_audit_trusted_community
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "code_review_audit_trusted_community")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "code_review_audit_trusted_community"))].status == 1)){
            if( !data.code_review_audit_trusted_community || typeof data.code_review_audit_trusted_community == 'undefined' || data.code_review_audit_trusted_community == "" || data.code_review_audit_trusted_community.length == 0 || Validator.isEmpty(data.code_review_audit_trusted_community.trim()+'')) {
                errors.code_review_audit_trusted_community = 'coinListRequestForm.error.code_review_audit_trusted_community';
            }
        }

        //premined_coin_amount
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "premined_coin_amount")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "premined_coin_amount"))].status == 1)){
            if( !data.premined_coin_amount || typeof data.premined_coin_amount == 'undefined' || data.premined_coin_amount == "" || data.premined_coin_amount.length == 0 || Validator.isEmpty(data.premined_coin_amount.trim()+'')) {
                errors.premined_coin_amount = 'coinListRequestForm.error.premined_coin_amount';
            }else if(!Validator.isNumeric(data.premined_coin_amount+"")){
                errors.premined_coin_amount = 'my_account.err.fieldNum';
            }
        }

        //number_of_addresses_coins_were_distributed
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "number_of_addresses_coins_were_distributed")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "number_of_addresses_coins_were_distributed"))].status == 1)){
            if( !data.number_of_addresses_coins_were_distributed || typeof data.number_of_addresses_coins_were_distributed == 'undefined' || data.number_of_addresses_coins_were_distributed == "" || data.number_of_addresses_coins_were_distributed.length == 0 || Validator.isEmpty(data.number_of_addresses_coins_were_distributed.trim()+'')) {
                errors.number_of_addresses_coins_were_distributed = 'coinListRequestForm.error.number_of_addresses_coins_were_distributed';
            }
        }     
        //blockspeed
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "blockspeed")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "blockspeed"))].status == 1)){
            if( !data.blockspeed || typeof data.blockspeed == 'undefined' || data.blockspeed == "" || data.blockspeed.length == 0 || Validator.isEmpty(data.blockspeed.trim()+'')) {
                errors.blockspeed = 'coinListRequestForm.error.blockspeed';
            }
        }    
        //core_algorithm
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "core_algorithm")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "core_algorithm"))].status == 1)){
            if( !data.core_algorithm || typeof data.core_algorithm == 'undefined' || data.core_algorithm == "" || data.core_algorithm.length == 0 || Validator.isEmpty(data.core_algorithm.trim()+'')) {
                errors.core_algorithm = 'coinListRequestForm.error.core_algorithm';
            }
        }

        //dev_language
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "dev_language")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "dev_language"))].status == 1)){
            if( !data.dev_language || typeof data.dev_language == 'undefined' || data.dev_language == "" || data.dev_language.length == 0 || Validator.isEmpty(data.dev_language.trim()+'')) {
                errors.dev_language = 'coinListRequestForm.error.dev_language';
            }
        } 
         //erc_20_compliant
         if((coinListFields.findIndex(coinListformField => (coinListformField.key === "erc_20_compliant")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "erc_20_compliant"))].status == 1)){
            if( !data.erc_20_compliant || typeof data.erc_20_compliant == 'undefined' || data.erc_20_compliant == "" || data.erc_20_compliant.length == 0 || Validator.isEmpty(data.erc_20_compliant.trim()+'')) {
                errors.erc_20_compliant = 'coinListRequestForm.error.erc_20_compliant';
            }
        } 
        //wallet
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "wallet")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "wallet"))].status == 1)){
            if( !data.wallet || typeof data.wallet == 'undefined' || data.wallet == "" || data.wallet.length == 0 || Validator.isEmpty(data.wallet.trim()+'')) {
                errors.wallet = 'coinListRequestForm.error.wallet';
            }
        }
        //if_this_coin_is_a_security
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "if_this_coin_is_a_security")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "if_this_coin_is_a_security"))].status == 1)){
            if( !data.if_this_coin_is_a_security || typeof data.if_this_coin_is_a_security == 'undefined' || data.if_this_coin_is_a_security == "" || data.if_this_coin_is_a_security.length == 0 || Validator.isEmpty(data.if_this_coin_is_a_security.trim()+'')) {
                errors.if_this_coin_is_a_security = 'coinListRequestForm.error.wallet';
            }
        }
        //first_name
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "first_name")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "first_name"))].status == 1)){
            if( !data.first_name || typeof data.first_name == 'undefined' || data.first_name == "" || data.first_name.length == 0 || Validator.isEmpty(data.first_name.trim()+'')) {
                errors.first_name = 'coinListRequestForm.error.firstName';
            }else if(!Validator.isAlpha(data.first_name+"")){
                errors.first_name = 'coinListRequestForm.error.validAlpha';
            }
        }
        //last_name
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "last_name")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "last_name"))].status == 1)){
            if(typeof data.last_name != 'undefined' && data.last_name !="" && data.last_name != null && !Validator.isAlpha(data.last_name+"")){
                    errors.last_name = 'coinListRequestForm.error.validAlpha';
            }
        }
        //coin_type
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_type")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_type"))].status == 1)){
            if( !data.coin_type || typeof data.coin_type == 'undefined' || data.coin_type == "" || data.coin_type.length == 0 || Validator.isEmpty(data.coin_type.trim()+'')) {
                errors.coin_type = 'coinListRequestForm.error.coinType';
            }
        }
         //coin_address
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_address")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_address"))].status == 1)){
            if( !data.coin_address || typeof data.coin_address == 'undefined' || data.coin_address == "" || data.coin_address.length == 0 || Validator.isEmpty(data.coin_address.trim()+'')) {
                errors.coin_address = 'coinListRequestForm.error.coinAddress';
            }
        }
        
        //coin_description
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_description")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "coin_description"))].status == 1)){
            if( !data.coin_description || typeof data.coin_description == 'undefined' || data.coin_description == "" || data.coin_description.length == 0 || Validator.isEmpty(data.coin_description.trim()+'')) {
                errors.coin_description = 'coinListRequestForm.error.coinDescription';
            }
        }
        //decimal
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "decimal")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "decimal"))].status == 1)){
            if( !data.decimal || typeof data.decimal == 'undefined' || data.decimal == "" || data.decimal.length == 0 || Validator.isEmpty(data.decimal.trim()+'')) {
                errors.decimal = 'coinListRequestForm.error.decimal';
            }
        }
        //total_supply
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "total_supply")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "total_supply"))].status == 1)){
            if( !data.total_supply || typeof data.total_supply == 'undefined' || data.total_supply == "" || data.total_supply.length == 0 || Validator.isEmpty(data.total_supply.trim()+'')) {
                errors.total_supply = 'coinListRequestForm.error.totalSupply';
            }
        }
        //circulating_supply
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "circulating_supply")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "circulating_supply"))].status == 1)){
            if( !data.circulating_supply || typeof data.circulating_supply == 'undefined' || data.circulating_supply == "" || data.circulating_supply.length == 0 || Validator.isEmpty(data.circulating_supply.trim()+'')) {
                errors.circulating_supply = 'coinListRequestForm.error.circulatingSupply';
            }
        }
        //address
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "address")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "address"))].status == 1)){
            if( !data.address || typeof data.address == 'undefined' || data.address == "" || data.address.length == 0 || Validator.isEmpty(data.address.trim()+'')) {
                errors.address = 'coinListRequestForm.error.Address';
            }
        }
         //phone
         if((coinListFields.findIndex(coinListformField => (coinListformField.key === "phone")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "phone"))].status == 1)){
            if(typeof data.phone != 'undefined' && data.phone !="" && data.phone != null && !Validator.isNumeric(data.phone+"")){
                errors.phone = 'my_account.err.fieldNum';
            }
        }
        //tx_Fee_for_transaction
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "tx_Fee_for_transaction")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "tx_Fee_for_transaction"))].status == 1)){
            if( !data.tx_Fee_for_transaction || typeof data.tx_Fee_for_transaction == 'undefined' || data.tx_Fee_for_transaction == "" || data.tx_Fee_for_transaction.length == 0 || Validator.isEmpty(data.tx_Fee_for_transaction.trim()+'')) {
                errors.tx_Fee_for_transaction = 'coinListRequestForm.error.tx_Fee_for_transaction';
            }
        }
        //city
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "city")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "city"))].status == 1)){
            if( !data.city || typeof data.city == 'undefined' || data.city == "" || data.city.length == 0 || Validator.isEmpty(data.city.trim()+'')) {
                errors.city = 'coinListRequestForm.error.city';
            }
        }
        //state
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "state")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "state"))].status == 1)){
            if( !data.state || typeof data.state == 'undefined' || data.state == "" || data.state.length == 0 || Validator.isEmpty(data.state.trim()+'')) {
                errors.state = 'coinListRequestForm.error.state';
            }
        }
        //postalCode
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "postalCode")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "postalCode"))].status == 1)){
            if( !data.postalCode || typeof data.postalCode == 'undefined' || data.postalCode == "" || data.postalCode.length == 0 || Validator.isEmpty(data.postalCode.trim()+'')) {
                errors.postalCode = 'coinListRequestForm.error.postalCode';
            }
        }
        //country
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "country")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "country"))].status == 1)){
            if( !data.country || typeof data.country == 'undefined' || data.country == "" || data.country.length == 0 || Validator.isEmpty(data.country.trim()+'')) {
                errors.country = 'coinListRequestForm.error.country';
            }
        }
        //email
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "email")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "email"))].status == 1)){
            if( !data.email || typeof data.email == 'undefined' || data.email == "" || data.email.length == 0 || Validator.isEmpty(data.email.trim()+'')) {
                errors.email = 'coinListRequestForm.error.email';
            }
        }
        //project_name
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "project_name")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "project_name"))].status == 1)){
            if( !data.project_name || typeof data.project_name == 'undefined' || data.project_name == "" || data.project_name.length == 0 || Validator.isEmpty(data.project_name.trim()+'')) {
                errors.project_name = 'coinListRequestForm.error.project_name';
            }
        }
        //information_on_how_funds_were_raised
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "information_on_how_funds_were_raised")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "information_on_how_funds_were_raised"))].status == 1)){
            if( !data.information_on_how_funds_were_raised || typeof data.information_on_how_funds_were_raised == 'undefined' || data.information_on_how_funds_were_raised == "" || data.information_on_how_funds_were_raised.length == 0 || Validator.isEmpty(data.information_on_how_funds_were_raised.trim()+'')) {
                errors.information_on_how_funds_were_raised = 'coinListRequestForm.error.information_on_how_funds_were_raised';
            }
        }
        //project_website_link
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "project_website_link")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "project_website_link"))].status == 1)){
            if(typeof data.project_website_link != 'undefined' && data.project_website_link !="" && data.project_website_link != null &&  !Validator.isURL(data.project_website_link+"",['http','https'])){
                errors.project_website_link = 'coinListRequestForm.error.official_gitHub_repository_link_url';
            }
        }
        //amount_raised_during_pre_ico
        if((coinListFields.findIndex(coinListformField => (coinListformField.key === "amount_raised_during_pre_ico")) != -1 && coinListFields[coinListFields.findIndex(coinListformField => (coinListformField.key === "amount_raised_during_pre_ico"))].status == 1)){
            if(typeof data.amount_raised_during_pre_ico != 'undefined' && data.amount_raised_during_pre_ico !="" && data.amount_raised_during_pre_ico != null && !Validator.isNumeric(data.amount_raised_during_pre_ico+"")){
                errors.amount_raised_during_pre_ico = 'my_account.err.fieldNum';
            }
        }
  }
  return {
    errors,
    isValid: Object.keys(errors).length > 0 ? true:false
  };
  
};