const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CoinListRequestSchema = new Schema({
    userId: { type: String, default: "" },
    coin_name: { type: String, default: "" },
    coin_ticker: { type: String, default: "" },
    date_of_issuance: { type: String, default: "" },
    coin_logo: { type: String, default: "" },
    coin_website: { type: String, default: "" },
    website_faq: { type: String, default: "" },
    coin_forum: { type: String, default: "" },
    bitcoin_talk: { type: String, default: "" },
    whitepaper_business: { type: String, default: "" },
    whitepaper_technical: { type: String, default: "" },
    stack_channel: { type: String, default: "" },
    official_gitHub_repository_link: { type: String, default: "" },
    team_contact: { type: String, default: "" },
    team_bio: { type: String, default: "" },
    headquarter_address: { type: String, default: "" },
    wallet_source_code: { type: String, default: "" },
    node_source_code: { type: String, default: "" },
    official_blockchain_explorer_link: { type: String, default: "" },
    max_coin_supply: { type: String, default: "" },
    tx_Fee_for_transaction: { type: String, default: "" },
    social_media_links: { type: String, default: "" },
    code_review_audit_trusted_community: { type: String, default: "" },
    deployment_process: { type: String, default: "" },
    premined_coin_amount: { type: String, default: "" },
    premined_coin_in_escrow: { type: String, default: "" },
    number_of_addresses_coins_were_distributed: { type: String, default: "" },
    segwit_exhibition: { type: String, default: "" },
    blockspeed: { type: String, default: "" },
    core_algorithm: { type: String, default: "" },
    amount_raised_during_pre_ico: { type: String, default: "" },
    advisory: { type: String, default: "" },
    number_of_blocks_mined: { type: String, default: "" },
    dev_language: { type: String, default: "" },
    erc_20_compliant: { type: String, default: "" },
    difficulty: { type: String, default: "" },
    wallet: { type: String, default: "" },
    usual_cost: { type: String, default: "" },
    if_this_coin_is_a_security: { type: String, default: "" },
    coin_type: { type: String, default: "" },
    coin_address: { type: String, default: "" },
    coin_description: { type: String, default: "" },
    coin_short_name: { type: String, default: "" },
    decimal: { type: String, default: "" },
    total_supply: { type: String, default: "" },
    circulating_supply: { type: String, default: "" },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    address: { type: String, default: "" },
    address_line_2: { type: String, default: "" },
    City: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    project_name: { type: String, default: "" },
    project_website_link: { type: String, default: "" },
    do_you_have_an_active_community: { type: String, default: "" },
    information_on_how_funds_were_raised: { type: String, default: "" },
    current_listing_on_other_exchanges: { type: String, default: "" },
    date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now },
    created_by: { type: String },
    modified_by: { type: String }
});

module.exports = coinListRequest = mongoose.model('coinListRequest', CoinListRequestSchema);