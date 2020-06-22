const core = require('@actions/core');
const github = require('@actions/github');
const axios = require("axios");
const fs = require("fs");


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const wafAddress = core.getInput('WAF-address');
const policyFilePath = core.getInput('policy-filepath');
const username = core.getInput('username');
const password = core.getInput('password');
const policyName = core.getInput('policy-name');


main();



async function main() {
    try {

        let suggestionsUrl = `https://${wafAddress}/mgmt/tm/asm/tasks/export-suggestions/`;
        let policyUrl = `https://${wafAddress}/mgmt/tm/asm/policies?$filter=name+eq+${policyName}`;

        auth = {
            username: username,
            password: password
        };
        //const data = fs.readFileSync(policyFilePath).toString();

        var newData = "{ \"cos\": \"tak\", items: [ ] }";
        //var das123 = JSON.stringify(newData);
        //das123.cos = "nie"; 
        //var results22 = fs.writeFileSync(policyFilePath, das123);

     



       let policies = await getResponse(policyUrl, 'get', auth, {});
        let policyId = policies.items[0].id;
        console.log("PolicyId: " + policyId);

        let suggestions = await getResponse(suggestionsUrl, 'post', auth, {
            "policyReference": {
                "link": `https://${wafAddress}/mgmt/tm/asm/policies/${policyId}`
            },
            "inline": true,
            "filter": "score gt '0' and entityKind eq 'tm:asm:policies:filetypes:filetypestate'"
        });
        let suggestionId = suggestions.id;
        console.log("suggestionId: " + suggestionId);

        let policy_modifications = await getResponse(`${suggestionsUrl}${suggestionId}?ver=15.1.0`, 'get',
        auth, {});
        saveModificationsInPolicyFile(policy_modifications);


    } catch (error) {
        core.setFailed(error.message);
        core.setFailed(`Error - Github Actions failure: ${error}`);
    }
}

function saveModificationsInPolicyFile(policy_modifications) {
    let modification_results = policy_modifications.result.suggestions;

    // read file and make object
    let content = JSON.parse(fs.readFileSync(policyFilePath, 'utf8'));
    // edit or add property
    modification_results.forEach((value, index, array) => {
        content.modifications.push(value);
    });
    //write file
    fs.writeFileSync(policyFilePath, JSON.stringify(content));
}

async function getResponse(url, method, auth, data ) {
    var config = {
        url: url,
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data,
        auth: auth
    };
    const instance = axios.create(config);

    const requestData = {
        auth,
        method,
        data
    };

    const response = await instance.request(requestData);
    console.log(response.status);
    console.log("BODY: " + response.data);

    return response.data;
}


