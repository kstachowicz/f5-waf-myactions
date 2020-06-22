const core = require('@actions/core');
const github = require('@actions/github');
const httpClient = require("@actions/http-client");
const axios = require("axios");
const fs = require("fs");
var cors = require('cors');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const wafAddress = core.getInput('WAF-address');
const policyFilePath = core.getInput('policy-filepath');
const username = core.getInput('username');
const password = core.getInput('password');
const fileSize = core.getInput('policy-file-size');



main();



async function main() {
    try {

        let policyUrl = `https://${wafAddress}/mgmt/tm/asm/file-transfer/uploads/policy.json`;

        auth = {
            username: username,
            password: password
        };

        const data = fs.readFileSync(policyFilePath).toString();
        fileSize = data.length;

        var config = {
            method: 'post',
            url: policyUrl,
            headers: {
                'Content-Range': fileSize,
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



    } catch (error) {
        core.setFailed(error.message);
        core.setFailed(`Error - Github Actions failure: ${error}`);
    }
}
