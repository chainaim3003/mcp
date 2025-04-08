# mcp
A simple custom implementation of mcp server for Chainaim and Actus related content/development


## Setup Instruction
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
To configure your mcp in the claude desktop app, navigate to your `cluade_desktop_config.json` file on machine.

**For windows:**  code $env:AppData\Claude\claude_desktop_config.json

**For MacOs:** code ~/Library/Application\ Support/Claude/claude_desktop_config.json

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
        "type=bind,src=/Users/USERNAME/Desktop,dst=/projects/Desktop",
        "--mount",
        "type=bind,src=/Users/USERNAME/Documents/mcp,dst=/projects/mcp",
        "mcp/filesystem",
        "/projects"
      ]
    },
    "OCR": {
      "command": "node",
      "args": ["/Users/USERNAME/Documents/projects/mcp/ocr/build/index.js"],
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


OPEN your claude Desktop app and click on the hammer icon to list the mcp servers you have. 

You can collaborate and work on this project, kindly send an email if you have any questions [mail](mail:pixelhubster@gmail.com)
