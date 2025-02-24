# Overseer

Overseer is a small utility that allows for monitoring multiple 3D Printers from a single user interface.

Includes support for:

- [Octoprint](https://github.com/foosel/OctoPrint)
- [RepRapFirmware](https://github.com/dc42/RepRapFirmware) - Firmware Versions 3.5.0 and beyond.
- [Bambu Labs](https://wiki.bambulab.com/en/home) - Only supported in the server version of Overseer. Only tested in LAN only mode with an X1C.

**WARNING:** It is recommended that you do **not** configure Overseer to be accessible outside of your local network.

![Screenshot](/preview.jpg)

## Usage

There are two ways to use the Overseer application. Which way will work best for you depends on your specific use-case and/or server configuration experience.

### 1. Web Application

The standalone application is that all configuration data is stored local to the browser, so each browser/device will need to be configured individually.

**CAUTION:** The standalone web application has support for readonly accounts, and readonly accounts are restricted from preforming certain operations through the user interface, however since the data is stored in the browser it is accessible through the browsers development tools. This means a savvy user would be able to access the printer information and invoke the APIs directly.

**CAUTION:** The standalone web application can connect to instances using self signed certificates, and even certificate authentication. However, it requires that certificate is accepted/configured with the browser.

**CAUTION:** The standalone web application requires CORS to be enabled.

[Enable CORS for Octoprint](https://docs.octoprint.org/en/master/api/general.html#cross-origin-requests)
[Enable CORS for RepRapFirmware](https://docs.duet3d.com/User_manual/Reference/Gcodes#m586-configure-network-protocols)

**CAUTION:** If you do not understand any of the cautions messages, please don't use web app version. That applies to overseer.live and the self hosted site.

#### Overseer.live

The Standalone Web Application has been published online and is available at [https://overseer.live](https://overseer.live). This works completely in the browser and no data is sent to any 3rd party servers.

#### Self Hosting

You can also host the application on your local network if you prefer. Since the application consist of only static files the configuration is very simple and can be hosted on a Octopi instance along with Octoprint with minimal overhead.

Please refer to the [wiki page](https://github.com/michaelfdeberry/overseer/wiki/Overseer-Standalone-Web-App) for configuration instructions.

### 2.  Server

This is a cross platform server based solution that will allow you to host Overseer on your local network. All configuration will be stored on a centralized database allowing the application to be configured once and accessible from multiple browsers/devices.

Please refer to the [wiki page](https://github.com/michaelfdeberry/overseer/wiki/Overseer-Daemon-%28.Net-Core%29) for configuration instructions.
