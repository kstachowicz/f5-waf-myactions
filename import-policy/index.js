const core = require('@actions/core');
const github = require('@actions/github');
const httpClient = require("@actions/http-client");
const axios = require("axios");
const fs = require("fs");


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const wafAddress = core.getInput('waf-address');
const username = core.getInput('username');
const password = core.getInput('password');
const policyName = core.getInput('policy-name');


main();



async function main() {
    try {

        let policyUrl = `https://${wafAddress}/mgmt/tm/asm/tasks/import-policy/`;

        auth = {
            username: username,
            password: password
        };

       
        const data = {
            "filename": "policy.json",
            "policy": {
                "fullPath": `/Common/${policyName}`
            }
        }

        var config = {
            method: 'post',
            url: policyUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            auth: auth
        };

        const instance = axios.create(config);

        const method = 'post';

        const requestData = {
            auth,
            method,
            data
        };

        const response = await instance.request(requestData);
        console.log(response.status);
        console.log(response.data)



    } catch (error) {
        core.setFailed(error.message);
        core.setFailed(`Error - Github Actions failure: ${error}`);
    }
}
