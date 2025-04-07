import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { request } from "http";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

// Create server instance
const server = new Server({
   name: "weather",
   version: "1.0.0"
}, {
   capabilities: {
      resources: {},
      tools: {},
   },
});

// Helper function for making NWS API requests
async function makeNWSRequest<T>(url: string): Promise<T | null> {
   const headers = {
      "User-Agent": USER_AGENT,
      Accept: "application/geo+json",
   };

   try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T;
   } catch (error) {
      console.error("Error making NWS request:", error);
      return null;
   }
}

interface AlertFeature {
   properties: {
      event?: string;
      areaDesc?: string;
      severity?: string;
      status?: string;
      headline?: string;
   };
}

// Format alert data
function formatAlert(feature: AlertFeature): string {
   const props = feature.properties;
   return [
      `Event: ${props.event || "Unknown"}`,
      `Area: ${props.areaDesc || "Unknown"}`,
      `Severity: ${props.severity || "Unknown"}`,
      `Status: ${props.status || "Unknown"}`,
      `Headline: ${props.headline || "No headline"}`,
      "---",
   ].join("\n");
}

interface ForecastPeriod {
   name?: string;
   temperature?: number;
   temperatureUnit?: string;
   windSpeed?: string;
   windDirection?: string;
   shortForecast?: string;
}

interface AlertsResponse {
   features: AlertFeature[];
}

interface PointsResponse {
   properties: {
      forecast?: string;
   };
}

interface ForecastResponse {
   properties: {
      periods: ForecastPeriod[];
   };
}


// register tools 
server.setRequestHandler(ListToolsRequestSchema, async () => {
   return {
      tools: [{
         name: "get-alerts",
         description: "Get weather alerts for a state",
         inputSchema: {
            type: "object", // should be "object"
            properties: {
               state: { type: "string" },
            },
            required: ["state"],
         }
      },
      {
         name: "get-forecast",
         description: "Get weather forecast for a location",
         inputSchema: {
            type: "object", // should be "object"
            properties: {
               latitude: { type: "number" },
               longitude: { type: "number" },
            },
            required: ["latitude", "longitude"],
         }
      }]
   }
});

// get alerts
const getAlert = async (state: string) => {
   const stateCode = state.toUpperCase();
   const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
   const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

   if (!alertsData) {
      throw new McpError(ErrorCode.ConnectionClosed, "Failed to retrieve");
   }

   const features = alertsData.features || [];
   if (features.length === 0) {
      throw new McpError(ErrorCode.MethodNotFound, "No alerts found for the specified state");
   }

   const formattedAlerts = features.map(formatAlert);
   const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

   return {
      toolResult: alertsText,
   };
}

// get forecast
const getForecast = async ({ latitude, longitude }: { latitude: number, longitude: number }) => {

   const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
   const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

   if (!pointsData) {
      throw new McpError(ErrorCode.ConnectionClosed, "Failed to retrieve grid point data");
   }

   const forecastUrl = pointsData.properties?.forecast;
   if (!forecastUrl) {
      throw new McpError(ErrorCode.MethodNotFound, "No forecast URL found in grid point data");
   }

   // Get forecast data
   const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
   if (!forecastData) {
      throw new McpError(ErrorCode.MethodNotFound, "No forecast data available");
   }


   // Format forecast periods
   const periods = forecastData.properties?.periods || [];
   const formattedForecast = periods.map((period: ForecastPeriod) =>
      [
         `${period.name || "Unknown"}:`,
         `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
         `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
         `${period.shortForecast || "No forecast available"}`,
         "---",
      ].join("\n"),
   );

   const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
   return {
      toolResult: forecastText,
   };
}


// Handle tool requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
   if (request.params.name === "get-alerts") {
      const arg = request.params.arguments as { state: string };
      const state = arg.state;
      return getAlert(state)
   }
   if (request.params.name === "get-forecast") {
      const arg = request.params.arguments as { latitude: number, longitude: number };
      const latitude = arg.latitude;
      const longitude = arg.longitude;
      return getForecast({ latitude, longitude });
   }
   throw new McpError(ErrorCode.MethodNotFound, "Tool not found")
});


const transport = new StdioServerTransport();
await server.connect(transport);