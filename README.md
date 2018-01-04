# Overseer 

Overseer is a small integration utility that allows for monitoring multiple 3d printers. There is currently support Octoprint and RepRapFirmware(1).

_(1) RepRapFirmware running on a device that has a network interface such as the Duet Wifi and Duet Ethernet_

![Screenshot](https://i.imgur.com/NPW9Nor.png)

## Setup

### Linux

The recommended way to add Overseer to your network would be to host the application on a Raspberry Pi Zero W running Rasbian Lite. 

Overseer can potentially run along side Octoprint on an Octopi instance. However this hasn't been test and it is not recommended unless using a device with a multi-core processor such as a Raspberry Pi 3.

The following instructions will also work on any other Debian based Linux distribution. 

1. #### Install Mono (If needed)
	
    Determine if mono is installed:
    
    ` mono --version`
    
    If this returns a `command not found` error then run this command to install Mono:
    
    `sudo apt-get install mono-complete`  
    
1. #### Install Overseer
	1. ##### (Option 1) Downloading and installing through SSH 
    
        Download the archive for the latest version using wget

        `wget https://github.com/michaelfdeberry/overseer/releases/download/v0.0.1/overseer.zip`

        Extract the archive

        `unzip overseer.zip` 

        **Note:** Make sure that your working directory is where you want the oversee files to reside. 

	1. ##### (Option 2) Transferring Files From a PC
        Download the archive for latest version from the [Releases Page](https://github.com/michaelfdeberry/overseer/releases) and extract the files locally. 

        To transfer files from you PC to the host device using SFTP. Applications such as [WinSCP](https://winscp.net/) or [Cyberduck](https://cyberduck.io/) can be used for this task. 

        For new Rasbian, or Octopi, installations the default credentials are username:pi password:raspberry 

        The recommended location would be in a users home directory. 

        `/home/<user>/overseer`

        For typical Rasbian installations this will be:

        `/home/pi/overseer`                    
    
1. #### Setup overseer to run at startup. 
	Run the command:
    
	`sudo crontab -e`
    
    If this is the first time this command is run it will prompt you to choose an editor. The following instruction assume that Nano will be used to make the changes. If you are an experienced Linux user pick your editor of choice. 
    
    Add the following to the bottom of the file
    `@reboot /usr/bin/mono /home/pi/overseer/overseer.exe`     
    
    By default Overseer will run on port 9000. To host the Overseer on a different port you can add the -port argument with the desired port. 
    
    `@reboot /usr/bin/mono /home/pi/overseer/overseer.exe -port 80`
    
    This can also be changed from the configuration page within Overseer, but will require a manual reboot. 
    
    **Warning:** Make sure the desired port isn't currently in use. If hosting on an Octopi instance with Octoprint port 80 and 8080, and possibly others, will be in use.
    
    Exit the Nano by pretty ctrl+x and enter y to save the changes.
    
    Reboot the device 
    `sudo reboot`
    
    Overseer should be available on your network after the device boots. You should be able to access it either by the host name of the device or by local IP address.
    
    `http://<host-name>:9000/` or `http://xxx.xxx.xxx.xxx:9000/`

### Windows 

Download the latest version from [Releases Page](https://github.com/michaelfdeberry/overseer/releases) 

Right click on the executable and click "Run as Administrator". While the application is running Overseer will be available on port 9000 of the local machine. 

`http://localhost:9000/`

There is currently no support for running Overseer as a service on Windows. If there is enough demand support can potentially be added at a later date.

## Usage 

After installation Overseer is all UI based. Just add your printers from the configuration page!  
