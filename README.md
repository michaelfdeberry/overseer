![Screenshot](https://i.imgur.com/XYDRmhU.jpg)

# Overseer

Overseer is a small utility that allows for monitoring multiple 3D Printers from a single user interface. There is currently support for [Octoprint](https://github.com/foosel/OctoPrint) and [RepRepFirmware](https://github.com/dc42/RepRapFirmware). 

<span style="color:red">**WARNING:** It is recommended that you do **not** configure Overseer to be accessible outside of your local network.</span>

## Usage

There are currently three ways to use the Overseer application. Which way will work best for you depends on your specific use-case and/or server configuration experience.

### 1. Standalone Web Application

This is the easiest way to get started with Overseer and recommended for users that aren't comfortable configuring network services. The downside of using the standalone application is that all configuration data is stored local to the browser, so each browser/device will need to be configured individually. However, there are plans to add support for exporting and importing data in a future version.

#### Overseer.live

The Standalone Web Application has been published online and is available at [https://overseer.live](https://overseer.live). Again, this works completely in the browser and no data is sent to any 3rd party servers.

#### Self Hosting

You can also host the application on your local network if you prefer. Since the application consist of only static files the configuration is very simple and can be hosted on a Octopi instance along with Octoprint with minimal overhead. 

Please refer to the [wiki page](https://github.com/michaelfdeberry/overseer/wiki/Overseer-Standalone-Web-App) for configuration instructions. 

### 2. Cross Platform Server

There is a cross platform server solution that will allow you to host Overseer on your local network. All configuration will be stored on a centralized database allowing the application to be configured once and accessible from multiple browser/device. 

Please refer to the [wiki page](https://github.com/michaelfdeberry/overseer/wiki/Overseer-Daemon-%28.Net-Core%29) for configuration instructions. 

### 3. Low-end Single Board Computers.

Overseer is a fairly lightweight application and can run fine on low-end devices such as a Raspberry Pi Zero and 1 series of devices. However, the cross platform implementation requires support for ARMV7 instructions so a special version of the server base application is available.

This version contains all the same functionality of the Cross Platform Server version, however the configuration is slightly more involved. 

Please refer to the [wiki page](https://github.com/michaelfdeberry/overseer/wiki/Overseer-Daemon-%28Mono%29) for configuration instructions.

