#!/bin/bash

overseerVersion='1.0.15'
overseerDirectory=${PWD}'/overseer'
overseerExecutable='Overseer.Daemon.exe'
overseerExecutablePath=${overseerDirectory}'/'${overseerExecutable}
overseerPID=$(ps auxf | grep ${overseerExecutable} | grep -v grep  | awk '{print $2}')
overseerZipFile='overseer-linux-armv6.zip'
overseerZipUrl=https://github.com/michaelfdeberry/overseer/releases/download/${overseerVersion}/${overseerZipFile}
servicePath='/lib/systemd/system/overseer.service'

echo Installing Overseer...

# update the system
apt-get update

# install the prerequisites 
sudo apt install apt-transport-https dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb https://download.mono-project.com/repo/debian stable-raspbianstretch main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list
sudo apt update
sudo apt-get install mono-complete

if [ -n "${overseerPID}" ]; then
    # stop the service if it's is running
    service overseer stop
    
    # also send the kill command in case it was running manually
    kill ${overseerPID} 
fi

# create or overwrite the service file
> $servicePath
echo [Unit] >> $servicePath
echo Description=Overseer Daemon >> $servicePath
echo >> $servicePath
echo [Service] >> $servicePath
echo Restart=on-failure
echo WorkingDirectory=${overseerDirectory} >> $servicePath
echo ExecStart=/usr/bin/mono ${overseerExecutablePath} >> $servicePath
echo ExecReload=/bin/kill -HUP $MAINPID >> $servicePath
echo KillSignal=SIGINT >> $servicePath
echo >> $servicePath
echo [Install] >> $servicePath
echo WantedBy=multi-user.target >> $servicePath
echo >> $servicePath

# download the latest and unzip the archive
wget $overseerZipUrl && unzip -o ${overseerZipFile}

# enable the service
systemctl enable overseer

# start the service
service overseer start

echo Overseer installation has completed.
