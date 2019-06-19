#addin "Cake.Npm"
#addin "Cake.FileHelpers"

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");
var clientBuildDir = Directory("../src/OverseerUI/dist-static");
var netCoreBuildDir = Directory("../src/Overseer.Daemon.Core/bin") + Directory(configuration);
var netFrameworkBuildDir = Directory("../src/Overseer.Daemon.Mono/bin") + Directory(configuration);
var publishDir = "../publish";
var workingDir = publishDir + "/temp";

Task("Clean")
    .Does(() => {        
        CleanDirectory(netCoreBuildDir);
        CleanDirectory(netFrameworkBuildDir);
    });

Task("NuGet")
    .IsDependentOn("Clean")
    .Does(() => {
        NuGetRestore("../src/Overseer.sln");
    });

Task("Version")
    .Does(() => {
        var versionPattern = "(\\d+\\.){2,3}(\\d+)";
        var overseerProjectFile = "../src/Overseer/Overseer.csproj";
        var projectFileVersionPath = "/Project/PropertyGroup/Version";        
        var currentVersion = System.Version.Parse(XmlPeek(overseerProjectFile, projectFileVersionPath));
        var newVersion = new Version(currentVersion.Major, currentVersion.Minor, currentVersion.Build + 1);

        // update the csproj xml files
        var csprojFiles = new [] {
            overseerProjectFile, 
            "../src/Overseer.Daemon.Core/Overseer.Daemon.Core.csproj",
            "../src/Overseer.Tests/Overseer.Tests.csproj",
            "../src/Overseer.Daemon.Common/Overseer.Daemon.Common.csproj"
        };
        foreach (var csprojFile in csprojFiles)
        {     
            XmlPoke(csprojFile, projectFileVersionPath, newVersion.ToString());            
        }

        // update npm files
        var npmRunScriptSettings = new NpmRunScriptSettings();
        npmRunScriptSettings.ScriptName = $"setVersion";
        npmRunScriptSettings.WorkingDirectory = "../src/OverseerUI";
        npmRunScriptSettings.Arguments.Add(newVersion.ToString());
        NpmRunScript(npmRunScriptSettings);

        // update environment files
        ReplaceRegexInFiles("../src/OverseerUI/src/environments/environment*", $"appVersion:.\"{versionPattern}\"", $"appVersion: \"{newVersion}\"");
        
        // update install scripts
        ReplaceRegexInFiles("../src/**/overseer*.sh", $"overseerVersion='{versionPattern}'", $"overseerVersion='{newVersion}'");

        // update the assembly info files
        ReplaceRegexInFiles("../src/**/AssemblyInfo.cs", $"AssemblyVersion\\(\"{versionPattern}\"\\)", $"AssemblyVersion(\"{newVersion}\")");
        ReplaceRegexInFiles("../src/**/AssemblyInfo.cs", $"AssemblyFileVersion\\(\"{versionPattern}\"\\)", $"AssemblyFileVersion(\"{newVersion}\")");
        
        Information($"Updated from version {currentVersion} to {newVersion}");
    });

Task("Build")    
    .IsDependentOn("NuGet")
    .Does(() => {                
        MSBuild("../src/Overseer.sln", settings => settings.SetConfiguration(configuration));
    });

Task("Test")
    .IsDependentOn("Build")
    .Does(() => {
        NUnit3("../src/**/bin/" + configuration + "/*.Tests.dll", new NUnit3Settings {
            NoResults = true
        });
    });

Task("PreparePublish")
    .Does(() => {
        if (!DirectoryExists(publishDir)) {
            CreateDirectory(publishDir);
        } else {
            CleanDirectory(publishDir);
        }
    });

Task("PublishClientApp")
    .Does(() => {
        CreateDirectory(workingDir);

        //run npm commands
        NpmInstall(new NpmInstallSettings{
            Global = true,
            Production = true,
            WorkingDirectory = "../src/OverseerUI",
            LogLevel = NpmLogLevel.Verbose
        });

        NpmRunScript(new NpmRunScriptSettings 
        {
            ScriptName = "buildReleaseStatic",
            WorkingDirectory = "../src/OverseerUI",
            LogLevel = NpmLogLevel.Verbose
        });

        //copy the files
        CopyDirectory(clientBuildDir, workingDir + "/overseer-standalone");

        //create the archive
        Zip(workingDir, publishDir + "/overseer-standalone.zip");

        //delete the overseer directory
        DeleteDirectory(workingDir, new DeleteDirectorySettings {
            Recursive = true,
            Force = true
        });
    });

Task("PublishMono")
    .IsDependentOn("Build")
    .Does(() => {
        CreateDirectory(workingDir);

        //copy the release build to the output directory
        CopyDirectory(netFrameworkBuildDir, workingDir + "/overseer");

        //create the zip file for for overseer-linux-armv6.zip
        Zip(workingDir, publishDir + "/overseer-linux-armv6.zip");

        //copy the install script to the output directory
        CopyFile("../src/Overseer.Daemon.Mono/overseer-linux-armv6.sh", publishDir + "/overseer-linux-armv6.sh");

        //delete the working directory
        DeleteDirectory(workingDir, new DeleteDirectorySettings {
            Recursive = true,
            Force = true
        });
    });

Task("PublishCoreXPlat")
    .Does(() => {
        //publish the app for cross platform
        DotNetCorePublish("../src/Overseer.Daemon.Core/Overseer.Daemon.Core.csproj", new DotNetCorePublishSettings
        {
            Framework = "netcoreapp2.1",
            Configuration = "Release",
            OutputDirectory = workingDir + "/overseer",
            Verbosity = DotNetCoreVerbosity.Detailed
        });
        
        //create the zip file
        Zip(workingDir, publishDir + "/overseer-xplat.zip");

        //delete the working directory
        DeleteDirectory(workingDir, new DeleteDirectorySettings {
            Recursive = true,
            Force = true
        });
    });

Task("PublishCoreLinuxArmv7")
    .Does(() => {
        //publish the app for linux-arm
        DotNetCorePublish("../src/Overseer.Daemon.Core/Overseer.Daemon.Core.csproj", new DotNetCorePublishSettings
        {
            Framework = "netcoreapp2.1",
            Configuration = "Release",
            Runtime = "linux-arm",
            OutputDirectory = workingDir + "/overseer",
            Verbosity = DotNetCoreVerbosity.Detailed          
        });

        //create the zip file
        Zip(workingDir, publishDir + "/overseer-linux-armv7.zip");

        //copy the install script to the output directory
        CopyFile("../src/Overseer.Daemon.Core/overseer-linux-armv7.sh", publishDir + "/overseer-linux-armv7.sh");

        //delete the working directory
        DeleteDirectory(workingDir, new DeleteDirectorySettings {
            Recursive = true,
            Force = true
        });
    });

Task("Publish")
    .IsDependentOn("Test")
    .IsDependentOn("Version")
    .IsDependentOn("PreparePublish")
    .IsDependentOn("PublishClientApp")
    .IsDependentOn("PublishMono") 
    .IsDependentOn("PublishCoreXPlat")
    .IsDependentOn("PublishCoreLinuxArmv7");

Task("Default")
    .IsDependentOn("Publish");

RunTarget(target);