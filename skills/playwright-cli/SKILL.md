---
name: playwright-mcp
description: Browser automation via Playwright CLI. Open pages, interact with elements, take screenshots, and more. Ideal for coding agents and automated testing workflows.
metadata: {"clawdbot":{"emoji":"🎭","requires":{"bins":["playwright-mcp"]},"install":[{"id":"node","kind":"node","package":"@playwright/mcp","bins":["playwright-mcp"],"label":"Install Playwright CLI (npm)"}]}}
---

# Playwright CLI

Browser automation via Playwright. Token-efficient CLI for coding agents.

## Installation

```bash
npm install -g @playwright/mcp@latest
playwright-mcp --help
```

## Core Commands

| Command | Description |
|---------|-------------|
| `playwright-mcp open <url>` | Open URL in browser |
| `playwright-mcp close` | Close the page |
| `playwright-mcp type <text>` | Type text into editable element |
| `playwright-mcp click <ref> [button]` | Click on element |
| `playwright-mcp dblclick <ref> [button]` | Double click |
| `playwright-mcp fill <ref> <text>` | Fill text into field |
| `playwright-mcp drag <startRef> <endRef>` | Drag and drop |
| `playwright-mcp hover <ref>` | Hover over element |
| `playwright-mcp check <ref>` | Check checkbox/radio |
| `playwright-mcp uncheck <ref>` | Uncheck checkbox |
| `playwright-mcp select <ref> <val>` | Select dropdown option |
| `playwright-mcp snapshot` | Capture page snapshot for refs |

## Navigation

```bash
playwright-mcp go-back           # Go back
playwright-mcp go-forward        # Go forward
playwright-mcp reload            # Reload page
```

## Keyboard & Mouse

```bash
playwright-mcp press <key>       # Press key (a, arrowleft, enter...)
playwright-mcp keydown <key>     # Key down
playwright-mcp keyup <key>       # Key up
playwright-mcp mousemove <x> <y> # Move mouse
playwright-mcp mousedown [button] # Mouse down
playwright-mcp mouseup [button]   # Mouse up
playwright-mcp mousewheel <dx> <dy> # Scroll
```

## Save & Export

```bash
playwright-mcp screenshot [ref]  # Screenshot page or element
playwright-mcp pdf               # Save as PDF
```

## Tabs

```bash
playwright-mcp tab-list          # List all tabs
playwright-mcp tab-new [url]     # Open new tab
playwright-mcp tab-close [index] # Close tab
playwright-mcp tab-select <index> # Switch tab
```

## DevTools

```bash
playwright-mcp console [min-level]  # View console messages
playwright-mcp network              # View network requests
playwright-mcp run-code <code>      # Run JS snippet
playwright-mcp tracing-start        # Start trace
playwright-mcp tracing-stop         # Stop trace
```

## Sessions

```bash
playwright-mcp session-list         # List sessions
playwright-mcp session-stop [name]  # Stop session
playwright-mcp session-stop-all     # Stop all
playwright-mcp session-delete [name] # Delete session data
```

## Headed Mode

```bash
playwright-mcp open https://example.com --headed
```

## Examples

```bash
# Open and interact
playwright-mcp open https://example.com
playwright-mcp type "search query"
playwright-mcp press Enter
playwright-mcp screenshot

# Use sessions
playwright-mcp open https://site1.com
playwright-mcp --session=project-a open https://site2.com
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PLAYWRIGHT_MCP_BROWSER` | Browser: chrome, firefox, webkit, msedge |
| `PLAYWRIGHT_MCP_HEADLESS` | Run headless (default: headed) |
| `PLAYWRIGHT_MCP_ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `PLAYWRIGHT_MCP_CONFIG` | Path to config file |

## Configuration

Create `playwright-mcp.json` for persistent settings:

```json
{
  "browser": {
    "browserName": "chromium",
    "headless": false
  },
  "outputDir": "./playwright-output",
  "console": {
    "level": "info"
  }
}
```

## Notes

- **Cross-platform** — requires Node.js 18+ (Linux, macOS, Windows)
- Sessions persist cookies/storage by default
- Use `--session` flag for isolated browser instances
- Snapshots return element refs for subsequent commands

## Source

https://github.com/microsoft/playwright-mcp
