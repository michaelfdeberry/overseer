# Development Guide

## Running the Application Locally

This guide covers how to run the Overseer application locally for development purposes.

### Prerequisites

- Node.js and npm (for the frontend)
- .NET SDK (for the backend)

### Frontend (Angular Client)

The frontend is an Angular application located in `src/Overseer.Client/`.

#### Initial Setup

Navigate to the client directory and install dependencies:

```bash
cd src/Overseer.Client
npm install
```

#### Running the Development Server

Start the Angular development server:

```bash
npm start
```

The application will be available at `http://localhost:4200/` by default. The dev server will automatically reload when you make changes to the source files.

#### Other Available Scripts

- `npm run build` - Build the project for production
- `npm run test` - Run unit tests
- `npm run lint` - Lint the codebase

### Backend (.NET Server)

The backend is a .NET application located in `src/Overseer.Server/`.

#### Running with Development Configuration

Navigate to the server directory:

```bash
cd src/Overseer.Server
```

Run the application with the development configuration using `dotnet watch`:

```bash
dotnet watch --Environment=Development
```

This will:

- Start the server with the Development configuration
- Use settings from `appsettings.Development.json`
- Automatically rebuild and restart when code changes are detected
- Enable detailed error pages and logging

The API will typically be available at `http://localhost:9000/`.

#### Alternative: Running without Watch Mode

If you don't need automatic rebuilding, you can run directly:

```bash
dotnet run --Environment=Development
```

#### Building the Solution

To build the entire solution:

```bash
dotnet build Overseer.Server.sln
```

#### Publishing for Deployment

To create a production build:

```bash
dotnet publish Overseer.Server.sln --configuration Release
```

### Running Both Frontend and Backend

#### Using the start-dev Script (Recommended)

The `src/start-dev.ps1` PowerShell script handles building the server, building and publishing any local plugins, then launching the server and client in separate terminal windows. After startup it stays open with an interactive prompt so you can restart processes without leaving the terminal:

```powershell
cd src
./start-dev.ps1
```

**Script parameters:**

| Parameter      | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| `-SkipPlugins` | Skip the plugin build/publish step                          |
| `-SkipClient`  | Start the server only, without launching the Angular client |

**What the script does:**

1. Builds the .NET server (`dotnet build --configuration Debug`)
2. Discovers and publishes each plugin from the sibling `plugins/` directory into `bin/Debug/<tfm>/Plugins/`
3. Generates `plugin.json` metadata for each plugin (from the plugin repo, or by reading `.csproj` properties and cross-referencing `overseer.plugin-registry`)
4. Opens the server in a new window running `dotnet watch --Environment=Development`
5. Opens the client in a new window running `npm start`
6. Stays open at an `overseer>` interactive prompt for process management

**Interactive commands:**

| Command                              | Action                                     |
| ------------------------------------ | ------------------------------------------ | --- | ----------------------------------- | --------------------------------------- |
| `rb`, `restart backend`, `server`    | Restart the .NET server window             |
| `rf`, `restart frontend`, `client`   | Restart the Angular client window          |
| `ra`, `restart all`, `restart`       | Restart both server and client             |     | `sb`, `stop backend`, `stop server` | Stop the .NET server without restarting |
| `sf`, `stop frontend`, `stop client` | Stop the Angular client without restarting |     | `q`, `quit`, `exit`                 | Stop all processes and exit             |
| `?`, `help`                          | Show command reference                     |

#### Manual Startup

If you prefer to start each process manually:

1. In one terminal, start the backend:

   ```bash
   cd src/Overseer.Server
   dotnet watch --Environment=Development
   ```

2. In another terminal, start the frontend:
   ```bash
   cd src/Overseer.Client
   npm start
   ```

### Plugin Development

#### Directory Structure

The start-dev script expects plugins to live in a `plugins/` directory that is a **sibling of the `overseer` repository root**. The optional plugin registry lives in a sibling `overseer.plugin-registry/` directory:

```
<workspace-root>/
├── overseer/                        ← this repository
│   └── src/
│       └── start-dev.ps1
├── plugins/                         ← local plugin checkouts
│   ├── overseer.octoprint/
│   │   └── src/
│   │       ├── Overseer.OctoPrint.slnx
│   │       └── Overseer.OctoPrint/
│   │           └── Overseer.OctoPrint.csproj
│   └── my-plugin/
│       ├── plugin.json              ← optional metadata
│       └── src/
│           ├── Overseer.MyPlugin.slnx
│           └── Overseer.MyPlugin/
│               └── Overseer.MyPlugin.csproj
└── overseer.plugin-registry/        ← optional registry for metadata
    └── plugins.json
```

**Plugin directory rules:**

- Each plugin is a subdirectory of `plugins/` named after the plugin (e.g. `overseer.octoprint`)
- The plugin must have a `src/` subdirectory containing a `.sln` or `.slnx` solution file
- Any `.csproj` inside `src/` whose directory name does **not** match `Test` or `Tests` is treated as the plugin project and published
- Built output is written to `<server-bin>/Plugins/<plugin-name>/`

#### Plugin Metadata (`plugin.json`)

Each published plugin directory needs a `plugin.json` file. The script resolves it in this priority order:

1. `plugin.json` at the plugin repository root (`plugins/<name>/plugin.json`)
2. `plugin.json` inside the `src/` directory
3. `plugin.json` next to the `.csproj` file
4. Auto-generated from `.csproj` `<Version>`, `<Description>`, and `<Authors>` properties, cross-referenced against `overseer.plugin-registry/plugins.json`

A minimal `plugin.json`:

```json
{
  "name": "My Plugin",
  "author": "Your Name",
  "description": "What this plugin does.",
  "license": "MIT",
  "githubRepository": "https://github.com/yourorg/my-plugin",
  "version": "1.0.0"
}
```
