const fs = require('fs');
const axios = require('axios');

// 🔐 CONFIGURATION (edit if needed)
const CLOUD_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYWYxMTczNS1jYTI4LTQ2NjctODIwOC0wY2ViOGMxMGI1ZWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzNjkyNDM0LCJleHAiOjE3NDYyNDg0MDB9.Y0--1eGg3tC9lAu0h0g9-oAXgqWG0ztYUlZY9i1ZPxc';
const CLOUD_URL = 'https://confer.app.n8n.cloud';
const LOCAL_URL = 'http://localhost:5678';
const LOCAL_API_KEY = ''; // Add if your local n8n has auth

async function syncCredentials() {
  try {
    console.log('Fetching credentials from cloud...');
    const cloudCredsRes = await axios.get(`${CLOUD_URL}/rest/credentials`, {
      headers: {
        'Authorization': `Bearer ${CLOUD_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });

    console.log('Raw credentials response:', JSON.stringify(cloudCredsRes.data, null, 2));

    if (cloudCredsRes.status === 401) {
      throw new Error(`Authentication failed: ${cloudCredsRes.data.message}`);
    }

    const credentials = cloudCredsRes.data;
    if (!credentials || !Array.isArray(credentials)) {
      throw new Error('Invalid credentials data format in response');
    }

    console.log(`Found ${credentials.length} credentials in cloud`);

    fs.writeFileSync('cloud-credentials.json', JSON.stringify(credentials, null, 2));
    console.log(`✔️  Fetched and saved ${credentials.length} credentials.`);

    for (const cred of credentials) {
      try {
        console.log(`Attempting to import credential: ${cred.name}`);
        const response = await axios.post(`${LOCAL_URL}/rest/credentials`, cred, {
          headers: {
            Authorization: LOCAL_API_KEY ? `Bearer ${LOCAL_API_KEY}` : undefined,
            'Content-Type': 'application/json',
          },
          validateStatus: function (status) {
            return status < 500;
          }
        });

        if (response.status === 200 || response.status === 201) {
          console.log(`✅ Imported credential: ${cred.name}`);
        } else {
          console.error(`❌ Failed to import credential: ${cred.name}`, response.data);
        }
      } catch (err) {
        console.error(`❌ Credential import failed: ${cred.name}`);
        console.error('Error details:', err.response?.data || err.message);
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error syncing credentials:');
    console.error('Error details:', err.response?.data || err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
      console.error('Request URL:', err.config?.url);
      console.error('Request headers:', err.config?.headers);
    }
  }
}

async function syncWorkflows() {
  try {
    console.log('Fetching workflows from cloud...');
    const cloudFlowsRes = await axios.get(`${CLOUD_URL}/rest/workflows`, {
      headers: {
        'Authorization': `Bearer ${CLOUD_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('Raw workflows response:', JSON.stringify(cloudFlowsRes.data, null, 2));

    if (cloudFlowsRes.status === 401) {
      throw new Error(`Authentication failed: ${cloudFlowsRes.data.message}`);
    }

    const workflows = cloudFlowsRes.data;
    if (!workflows || !Array.isArray(workflows)) {
      throw new Error('Invalid workflows data format in response');
    }

    console.log(`Found ${workflows.length} workflows in cloud`);

    fs.writeFileSync('cloud-workflows.json', JSON.stringify(workflows, null, 2));
    console.log(`✔️  Fetched and saved ${workflows.length} workflows.`);

    for (const flow of workflows) {
      try {
        console.log(`Attempting to import workflow: ${flow.name}`);
        const response = await axios.post(`${LOCAL_URL}/rest/workflows`, flow, {
          headers: {
            Authorization: LOCAL_API_KEY ? `Bearer ${LOCAL_API_KEY}` : undefined,
            'Content-Type': 'application/json',
          },
          validateStatus: function (status) {
            return status < 500;
          }
        });

        if (response.status === 200 || response.status === 201) {
          console.log(`✅ Imported workflow: ${flow.name}`);
        } else {
          console.error(`❌ Failed to import workflow: ${flow.name}`, response.data);
        }
      } catch (err) {
        console.error(`❌ Workflow import failed: ${flow.name}`);
        console.error('Error details:', err.response?.data || err.message);
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error syncing workflows:');
    console.error('Error details:', err.response?.data || err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
      console.error('Request URL:', err.config?.url);
      console.error('Request headers:', err.config?.headers);
    }
  }
}

async function main() {
  console.log('\n🔄 Starting sync from cloud to local n8n...\n');
  console.log('Cloud URL:', CLOUD_URL);
  console.log('Local URL:', LOCAL_URL);
  await syncCredentials();
  await syncWorkflows();
  console.log('\n🚀 All done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
