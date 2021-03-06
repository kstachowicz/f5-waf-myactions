const core = require('@actions/core');
const github = require('@actions/github');
const axios = require("axios");
const fs = require("fs");


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let wafAddress = core.getInput('WAF-address');
let policyFilePath = core.getInput('policy-filepath');
let username = core.getInput('username');
let password = core.getInput('password');
let fileSize = core.getInput('policy-file-size');


main();



async function main() {
    try {

        let policyUrl = `https://${wafAddress}/mgmt/tm/asm/file-transfer/uploads/policy.json`;

        auth = {
            username: username,
            password: password
        };

        const data = fs.readFileSync(policyFilePath).toString();
        fileSize = data.length-1;

        var config = {
            method: 'post',
            url: policyUrl,
            headers: {
                'Content-Range': `0-${fileSize}/${data.length}`,
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
