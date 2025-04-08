import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import request from 'graphql-request';
const server = new Server({
    name: "blockchain server",
    description: "A server for blockchain",
    version: "0.0.1",
}, {
    capabilities: {
        tools: {}
    }
});
const headers = {
    Authorization: 'Bearer 6abc6de0d06cbf79f985314ef9647365',
};
async function getLastFewSwaps() {
    const SUBGRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum";
    try {
        // Execute the query
        const query = `{
  uniswapFactories(first: 5) {
    id
    pairCount
    totalVolumeUSD
    totalVolumeETH
  }
  tokens(first: 5) {
    id
    symbol
    name
    decimals
  }
}`;
        const data = await request(SUBGRAPH_URL, query, headers);
        console.log('Subgraph data:', data);
        return {
            content: [{
                    type: "text",
                    text: "Last few swaps from Uniswap"
                }]
        };
    }
    catch (error) {
        console.error('Error fetching data from subgraph:', error);
        return {
            isError: true,
            content: [{
                    type: "text",
                    text: "Error fetching data from subgraph"
                }]
        };
    }
}
// First, let's import axios
import axios from 'axios';
// The GraphQL query from your curl command
const query = `{
  uniswapFactories(first: 5) {
    id
    pairCount
    totalVolumeUSD
    totalVolumeETH
  }
  tokens(first: 5) {
    id
    symbol
    name
    decimals
  }
}`;
const SUBGRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum";
const apiKey = "6abc6de0d06cbf79f985314ef9647365"; // This should be filled with an actual API key
// Make the request
async function fetchUniswapData() {
    try {
        const response = await axios.post(SUBGRAPH_URL, {
            query,
            operationName: "Subgraphs",
            variables: {}
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(response.data, null, 2));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(response.data)
                }]
        };
    }
    catch (error) {
        console.error("Error fetching data:");
        return {
            isError: true,
            content: [{
                    type: "text",
                    text: "Error fetching data from subgraph" + (error instanceof Error ? error.message : String(error))
                }]
        };
    }
}
async function makeCustomQuery(query) {
    try {
        const response = await axios.post(SUBGRAPH_URL, {
            query,
            operationName: "Subgraphs",
            variables: {}
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(response.data)
                }]
        };
    }
    catch (error) {
        console.error("Error fetching data:");
        return {
            isError: true,
            content: [{
                    type: "text",
                    text: "Error fetching data from subgraph" + (error instanceof Error ? error.message : String(error))
                }]
        };
    }
}
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [{
                name: "get_last_few_swaps",
                description: "Get the last few swaps from Uniswap",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            }, {
                name: "make_custom_query",
                description: "Fetch a custom query from The Graph (uniswap v2)",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The GraphQL query to execute",
                        }
                    },
                    required: ["query"]
                }
            }]
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_last_few_swaps") {
        // const args = request.params.arguments as { token0: string, token1: string };
        // const { token0, token1 } = args;
        return fetchUniswapData();
    }
    if (request.params.name === "make_custom_query") {
        const args = request.params.arguments;
        const { query } = args;
        return makeCustomQuery(query);
    }
    throw new McpError(ErrorCode.MethodNotFound, "Method not found");
});
const transport = new StdioServerTransport();
server.connect(transport);
