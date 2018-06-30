![Screenshot](https://i.imgur.com/NPW9Nor.png)

## Support

[Octoprint](https://octoprint.org/) - Integrates via the Octoprint API

[RepRapFirmware](https://www.duet3d.com/) - Connects directly to control boards with network interface. 

## Setup

### Linux

1. #### Install Mono
	
   Determine if mono is installed:
    
    `mono --version`
    
    If this returns `command not found` mono isn't installed. Execute the following command to install mono:
    
    `sudo apt-get install mono-complete`  
    
 1. #### Install libsodium
    
    Overseer uses [libsodium](https://download.libsodium.org/doc/), by way of [libsodium-net](https://github.com/adamcaudill/libsodium-net), for hashing of user passwords. 
    
    Execute the following commands one by one. Some of the commands may take up to a few minutes to complete.
    
    ```
    wget https://download.libsodium.org/libsodium/releases/libsodium-stable-2018-05-07.tar.gz
    tar xvzf libsodium-stable-2018-05-07.tar.gz
    cd ./libsodium-stable
    ./configure
	make && make check
    sudo make install  
    echo "/usr/local/lib/libsodium.so" >> sudo /etc/Id.so.conf
    sudo ldconfig -p
    ``` 
    
    It's recommended that the latest stable release of libsodium is used. The url for the most recent version can be found [here](https://download.libsodium.org/libsodium/releases/)        
    
    Note: This step can potentially be skipped if you do not plan on creating any user accounts. 
    
1. #### Install Overseer	
    
    Download the archive for the latest version using wget (Replace X.X.X with the latest version)

   `wget https://github.com/michaelfdeberry/overseer/releases/download/X.X.X/overseer.zip`

   Extract the archive

   `unzip overseer.zip`

 	This will extract a directory named overseer that will contain all the files for the application. 	 
        
1. #### Configure startup 
	Run the command:
    
	`sudo crontab -e`
    
    If this is the first time this command is run it will prompt you to choose an editor. The following instructions assume that nano will be used to make the changes. If you are an experienced Linux user pick your editor of choice. 
    
    Add the following to the bottom of the file
    
    `@reboot /usr/bin/mono /home/pi/overseer/Overseer.exe`	
    
    By default Overseer will run on port 9000. To host the application on a different port use -port command line argument with the desired port. 
    
    `@reboot /usr/bin/mono /home/pi/overseer/overseer.exe --port 80` 
    
    This can also be changed from within the application from the settings page, but will require a manual restart. 
    
    Exit nano by pressing ctrl+x. Enter y to save the changes when prompted.            
    
 1. #### Reboot
	 `sudo reboot`
    
     Overseer should be available on your network after the device boots. It will be available by host name or ip address. E.g:
     `http://<host-name>:9000/` or `http://xxx.xxx.xxx.xxx:9000/`

### Windows 

Download the latest version from [Releases Page](https://github.com/michaelfdeberry/overseer/releases) 

Right click on the Overseer.exe executable and click "Run as Administrator". Overseer will be available on port 9000 of the host machine.

Alternatively, Overseer can be lauched from Command Prompt, or PowerShell, with elevated privileges to make use of the command line arguments. 

There is currently no support for running Overseer as a service on Windows. If there is enough demand support can potentially be added at a later date.

## Caveats

The recommended way to add Overseer to your network would be to host the application on a Raspberry Pi running Rasbian Lite. However, the above instructions should work on any Debian based Linux distribution. 

Overseer can potentially run alongside Octoprint on an Octopi instance. However, this hasn't been tested and it is not recommended unless using a device with a multi-core processor.

## Usage 

After installation Overseer is all UI based. Just add your printers from the configuration page!  