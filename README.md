# mcp
A simple custom implementation of mcp server for Chainaim and Actus related content/development


## Setup Instructionc
Clone the repo
```bash
git clone https://github.com/chainaim3003/mcp
```

Choose your desired mcp server (ocr, weather, simulator) 
Note: The `servers` folder has modelcontextprotocol from anthropic implementation of simple mcp server.

```bash
cd ocr
```
or 
```bash
cd weather
```

### Running the weather example

install the dependencies
```bash
npm install
```

Build the project
```bash
npm run build
```


### Configuring claude_desktop_config.json
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/Users/kaleel/Documents/projects/mcp/weather/build/index.js"]
    },
    "filesystem": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount",
        "type=bind,src=/Users/username/Desktop,dst=/projects/Desktop",
        "--mount",
        "type=bind,src=/Users/username/Documents/mcp,dst=/projects/mcp",
        "mcp/filesystem",
        "/projects"
      ]
    },
    "OCR": {
      "command": "node",
      "args": ["/Users/username/Documents/projects/mcp/ocr/build/index.js"],
      "timeout": 30000
    },
    "sqlite": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-v",
        "mcp-test:/mcp",
        "mcp/sqlite",
        "--db-path",
        "/mcp/test.db"
      ]
    }
  }
}
```

